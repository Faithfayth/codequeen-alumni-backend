const mongoose = require('mongoose');

const resourcesschema = mongoose.Schema({
    title:   { type: String, required: true },
    description: { type: String, required: true },
    url:     { type: String, required: true },
    category:{ type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
});

module.exports = mongoose.model('Resources', resourcesschema);