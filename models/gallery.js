const mongoose = require('mongoose');

const galleryschema = mongoose.Schema({
    imageUrl: { type: String, required: true },
    caption:  { type: String },
    keywords: [{ type: String }], // Array of keywords for searching and categorization
    category: { type: String }, // Optional field for categorizing images (e.g. "events", "achievements", "community", etc.)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
}, { 
    // UPDATED: Standardizes date management across your ecosystem
    timestamps: true 
});

module.exports = mongoose.model('Gallery', galleryschema);