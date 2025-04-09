const express = require('express');
const router = express.Router();
const File = require('../models/file');
const Subject = require('../models/subject');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get analytics data (admin only)
router.get("/files/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Get total files count
        const totalFiles = await File.countDocuments({ isActive: true });

        // Get total subjects count
        const totalSubjects = await Subject.countDocuments();

        // Get popular subjects (based on file access counts)
        const popularSubjects = await Subject.aggregate([
            {
                $lookup: {
                    from: 'files',
                    localField: '_id',
                    foreignField: 'subject',
                    as: 'files'
                }
            },
            {
                $project: {
                    title: 1,
                    accessCount: { $sum: '$files.accessCount' }
                }
            },
            { $sort: { accessCount: -1 } },
            { $limit: 5 }
        ]);

        // Get recent uploads
        const recentUploads = await File.find({ isActive: true })
            .sort({ uploadDate: -1 })
            .limit(5)
            .select('originalName uploadDate');

        res.json({
            totalFiles,
            totalSubjects,
            popularSubjects,
            recentUploads
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 