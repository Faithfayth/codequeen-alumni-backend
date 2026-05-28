const mongoose = require('mongoose');

const generalmessageschema = mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    sendername: { type: String, required: true },
    message: { type: String }, // Removed required: true to support image-only messages
    imageUrl: { type: String }, // Added to support media uploads/links
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('generalmessages', generalmessageschema);