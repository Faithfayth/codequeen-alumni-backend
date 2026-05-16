const mongoose = require('mongoose');

const mentorchatschema = mongoose.Schema({
    groupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentorgroups', required: true },
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    sendername: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mentorchat', mentorchatschema);