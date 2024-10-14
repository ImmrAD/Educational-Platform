const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    resources: [
        {
            title: { type: String, required: true },
            type: { type: String, enum: ['youtube', 'pdf', 'link'], required: true },
            link: { type: String, required: true }
        }
    ]
});

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;
