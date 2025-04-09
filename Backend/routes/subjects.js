const express = require('express');
const router = express.Router();
const SubjectVisibility = require('../models/subjectVisibility');
const syllabus = require('../../model/syllabus_structure_new.json');
const jwt = require('jsonwebtoken');

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

// GET route to fetch visible subjects for a semester
router.get('/visible', authenticateToken, async (req, res) => {
    try {
        const { semester } = req.query;
        
        if (!semester) {
            return res.status(400).json({ error: 'Semester parameter is required' });
        }

        // Validate semester value
        if (semester !== '1' && semester !== '2') {
            return res.status(400).json({ error: 'Invalid semester value. Use 1 or 2' });
        }

        const semesterName = semester === '1' ? 'Semester I' : 'Semester II';
        const visibleSubjects = await SubjectVisibility.getVisibleSubjects(semesterName);
        const syllabusSubjects = syllabus['First Year Engineering'][semesterName] || [];
        
        const subjects = syllabusSubjects
            .filter(subject => visibleSubjects.some(vs => vs.subjectCode === subject['Subject Code']))
            .map(subject => ({
                code: subject['Subject Code'],
                name: subject['Subject Name'],
                modules: subject['Modules'],
                hasFiles: true
            }));

        if (subjects.length === 0) {
            return res.status(404).json({
                message: `No visible subjects found for ${semesterName}`,
                subjects: []
            });
        }

        res.json({
            message: `Successfully retrieved subjects for ${semesterName}`,
            subjects: subjects
        });
    } catch (error) {
        console.error('Error fetching visible subjects:', error);
        res.status(500).json({
            error: 'Failed to fetch subjects',
            details: error.message
        });
    }
});

module.exports = router;