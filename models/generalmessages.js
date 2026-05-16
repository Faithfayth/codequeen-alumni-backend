const mongoose = require('mongoose');

const generalmessageschema = mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    sendername: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Generalmessages', generalmessageschema);