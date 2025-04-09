const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const SubjectVisibility = require('../models/subjectVisibility');
const { initializeSubjectVisibility } = require('../utils/initSubjectVisibility');
const syllabus = require('../../model/syllabus_structure_new.json');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Initialize subject visibility records
router.post('/init', authenticateToken, async (req, res) => {
    try {
        await initializeSubjectVisibility();
        res.json({ message: 'Subject visibility records initialized successfully' });
    } catch (error) {
        console.error('Error initializing subject visibility:', error);
        res.status(500).json({ error: 'Failed to initialize subject visibility records' });
    }
});

// Get visible subjects for a semester
router.get('/:semester', authenticateToken, async (req, res) => {
    try {
        const semesterParam = req.params.semester;
        // Convert semester number to roman numeral format
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
        const semesterNum = parseInt(semesterParam);
        
        if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
            return res.status(400).json({ error: 'Invalid semester parameter. Use a number between 1 and 8.' });
        }

        const semester = `Semester ${romanNumerals[semesterNum - 1]}`;
        const visibleSubjects = await SubjectVisibility.find({
            semester: semester,
            hasFiles: true
        }).sort('subjectCode');

        // Get files for each subject
        const File = mongoose.model('File');
        const subjects = [];

        // Get semester data from syllabus
        const yearKey = semesterNum <= 2 ? 'First Year Engineering' :
                       semesterNum <= 4 ? 'Second Year Engineering' :
                       semesterNum <= 6 ? 'Third Year Engineering' : 'Fourth Year Engineering';
        const semesterData = syllabus[yearKey]?.[semester] || [];

        for (const subject of visibleSubjects) {
            const files = await File.find({ subjectCode: subject.subjectCode })
                .select('originalName fileType fileSize uploadDate _id')
                .populate('uploadedBy', 'username')
                .sort('-uploadDate');

            const subjectData = semesterData.find(s => s['Subject Code'] === subject.subjectCode);
            subjects.push({
                code: subject.subjectCode,
                name: subjectData ? subjectData['Subject Name'] : subject.subjectCode,
                modules: subjectData ? subjectData['Modules'] : [],
                files: files
            });
        }

        res.status(200).json({ subjects });
    } catch (error) {
        console.error('Error fetching visible subjects:', error);
        res.status(500).json({ error: 'Internal server error while fetching subjects' });
    }
});

module.exports = router;