const mongoose = require('mongoose');

const projectsschema = new mongoose.Schema({
    title: { type: String, required: true },
    owner: { type: String, required: true }, 
    description: { type: String, required: true },
    projectthumbnail: { type: String }, 
    demolink: { type: String },  
    githubLink: { type: String },
    participants: [{ type: String }], // Array of strings for names
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectsschema);