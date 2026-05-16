const mongoose = require('mongoose');

const privatemessagesschema = mongoose.Schema({
    participantIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }], //array of user IDs who are participants in the private message
    messages: [{
        senderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Privatemessages', privatemessagesschema);