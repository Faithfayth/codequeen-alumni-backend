const mongoose = require('mongoose');

const opportuniesschema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    url: { type: String, required: true },
    category: { type: String, required: true },
    deadline: { type: Date, required: true },
    adminverified: { type: Boolean, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
});

module.exports = mongoose.model('Opportunities', opportuniesschema);