const mongoose = require("mongoose")

const engsubjectSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    sem:{
        type: String,
        require: true
    },
    resources: [
        {
            title: {type: String, require: true},
            type: {type: String, enum: ['youtube','pdf','link'], reqiured:true},
            link: { type: String, required: true }
        }
    ]
});
const EngSubject = mongoose.model("EngSubject",engsubjectSchema);
module.exports = EngSubject;