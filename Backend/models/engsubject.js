const mongoose = require("mongoose")

const engsubjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    sem: {
        type: String,
        required: true,
        trim: true
    },
    resources: [
        {
            title: { type: String, required: true, trim: true },
            type: { type: String, enum: ['youtube', 'pdf', 'link'], required: true },
            link: { type: String, required: true, trim: true }
        }
    ]
});
const EngSubject = mongoose.model("EngSubject",engsubjectSchema);
module.exports = EngSubject;