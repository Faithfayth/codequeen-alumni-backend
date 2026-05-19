const mongoose = require('mongoose');

const resourcesschema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    // URL can be a manually entered link or the Cloudinary secure link
    url: { type: String, required: true }, 
    category: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    // New fields for file management
    filePublicId: { type: String }, // Used to delete the file from Cloudinary later
    isTypeFile: { type: Boolean, default: false } // Helps frontend show a 'Download' vs 'Visit' button
}, { timestamps: true });

module.exports = mongoose.model('Resources', resourcesschema);