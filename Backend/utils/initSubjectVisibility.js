const mongoose = require('mongoose');
const SubjectVisibility = require('../models/subjectVisibility');
const syllabus = require('../../model/syllabus_structure_new.json');

async function initializeSubjectVisibility() {
    try {
        const years = [
            'First Year Engineering',
            'Second Year Engineering',
            'Third Year Engineering',
            'Fourth Year Engineering'
        ];

        const semesters = [
            'Semester I', 'Semester II', 'Semester III', 'Semester IV',
            'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'
        ];

        for (const year of years) {
            const yearData = syllabus[year];
            if (!yearData) continue;

            for (const semester of semesters) {
                if (!yearData[semester]) continue;

                for (const subject of yearData[semester]) {
                    const subjectCode = subject['Subject Code'];
                    if (!subjectCode) continue;

                    await SubjectVisibility.findOneAndUpdate(
                        { subjectCode },
                        { 
                            subjectCode,
                            semester,
                            hasFiles: false,
                            lastUpdated: new Date()
                        },
                        { upsert: true }
                    );
                }
            }
        }
        
        console.log('Subject visibility records initialized successfully');
    } catch (error) {
        console.error('Error initializing subject visibility:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

module.exports = { initializeSubjectVisibility };