const mongoose = require('mongoose');

const projectsschema = mongoose.Schema({
    title: { type: String, required: true },
    owner: {type: String, required: true }, //owner could one alumni or a group... 
    description: { type: String, required: true },
    projectthumbnail: { type: String }, //url of the project thumbnail image
    demolink: { type: String },  //has to be specified in the frontend that the use either has to demolink or githublink one of the two.
    githubLink: { type: String },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
});

module.exports = mongoose.model('Projects', projectsschema);