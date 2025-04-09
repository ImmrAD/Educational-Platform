const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/file');
const Subject = require('../models/subject');
const jwt = require('jsonwebtoken');
const SubjectClassifier = require('../models/mlModel');
const SubjectVisibility = require('../models/subjectVisibility');
const ensureUploadDirectory = require('../utils/ensureUploadDir');
const fs_promises = require('fs').promises;

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Ensure upload directory exists
ensureUploadDirectory();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only teachers can upload files' });
    }
    next();
};

// Upload file route with automatic subject detection
router.post('/upload', authenticateToken, isTeacher, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Save file to local storage
        await fs.writeFile(filePath, req.file.buffer);

        // Organize file and get subject information
        const { subject: organizedSubject, subjectCode } = await SubjectClassifier.organizeFile(tempPath, path.join(__dirname, '..', 'uploads'));

        // Find or create subject based on organized subject
        let subject = await Subject.findOne({ title: organizedSubject });
        if (!subject) {
            subject = new Subject({
                title: organizedSubject,
                description: `Auto-generated subject for ${organizedSubject} files`,
                author: req.user.username
            });
            await subject.save();
        }

        const newFile = new File({
            filename: uniqueFilename,
            originalName: req.file.originalname,
            fileType: path.extname(req.file.originalname),
            fileSize: req.file.size,
            subject: subject._id,
            uploadedBy: req.user.id,
            filePath: filePath,
            subjectCode: subjectCode
        });

        await newFile.save();

        // Update subject visibility
        await SubjectVisibility.updateVisibility(subjectCode);

        res.status(201).json({
            message: 'File uploaded and organized successfully',
            file: newFile,
            subject: organizedSubject
        });
    } catch (error) {
        console.error('Error in file upload:', error);
        res.status(500).json({ error: error.message || 'Error uploading file' });
    } finally {
        // Clean up temp file if it exists
        if (tempPath && fs.existsSync(tempPath)) {
            try {
                fs.unlinkSync(tempPath);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary file:', cleanupError);
            }
        }
    }
});

// Download file route
router.get('/download/:fileId', authenticateToken, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Check if file exists in local storage
        try {
            await fs.access(file.filePath);
        } catch (error) {
            return res.status(404).json({ error: 'File not found in storage' });
        }

        // Increment access count
        file.accessCount += 1;
        await file.save();

        // Stream file from local storage
        res.setHeader('Content-Type', file.fileType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        const fileStream = fs.createReadStream(file.filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Error downloading file' });
    }
});

// Get teacher's uploaded files
router.get('/teacher-uploads', authenticateToken, isTeacher, async (req, res) => {
    try {
        const files = await File.find({ uploadedBy: req.user.id })
            .populate('subject', 'title')
            .sort({ uploadDate: -1 });

        res.json(files);
    } catch (error) {
        console.error('Error fetching teacher files:', error);
        res.status(500).json({ error: 'Error fetching files' });
    }
});

// Delete file route
router.delete('/:fileId', authenticateToken, isTeacher, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete file from local storage
        try {
            await fs.unlink(file.filePath);
        } catch (error) {
            console.error('Error deleting file from storage:', error);
            return res.status(500).json({ error: 'Error deleting file from storage' });
        }

        // Delete file record from database
        await File.findByIdAndDelete(req.params.fileId);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
});

// Get files by subject ID
router.get('/subject/:subjectId', authenticateToken, async (req, res) => {
    try {
        const files = await File.find({ subject: req.params.subjectId })
            .sort({ uploadDate: -1 })
            .populate('uploadedBy', 'username');

        res.json(files);
    } catch (error) {
        console.error('Error fetching subject files:', error);
        res.status(500).json({ error: 'Error fetching files' });
    }
});

module.exports = router;