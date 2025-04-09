const mongoose = require('mongoose');

const subjectVisibilitySchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        unique: true
    },
    semester: {
        type: String,
        required: true,
        enum: ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII']
    },
    hasFiles: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update visibility when files are uploaded
subjectVisibilitySchema.statics.updateVisibility = async function(subjectCode) {
    try {
        const File = mongoose.model('File');
        const files = await File.find({ subjectCode: subjectCode });
        
        await this.findOneAndUpdate(
            { subjectCode },
            { 
                hasFiles: files.length > 0,
                lastUpdated: Date.now()
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error updating subject visibility:', error);
    }
};

// Get visible subjects for a semester
subjectVisibilitySchema.statics.getVisibleSubjects = async function(semester) {
    try {
        return await this.find({
            semester: semester,
            hasFiles: true
        }).sort('subjectCode');
    } catch (error) {
        console.error('Error getting visible subjects:', error);
        return [];
    }
};

const SubjectVisibility = mongoose.model('SubjectVisibility', subjectVisibilitySchema);
module.exports = SubjectVisibility;