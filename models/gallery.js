const mongoose = require('mongoose');

const galleryschema = mongoose.Schema({
    imageUrl: { type: String, required: true },
    caption:  { type: String },
    keywords: [{ type: String }], //array of keywords for searching and categorization
    category: { type: String }, //optional field for categorizing images (e.g. "events", "achievements", "community", etc.)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, //reference to the user who uploaded the image
    timestamp:  { type: Date, default: Date.now }, //the date and time when the image was uploaded
});



module.exports = mongoose.model('Gallery', galleryschema);