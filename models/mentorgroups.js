const mongoose = require('mongoose');

const mentorgroupsschema = mongoose.Schema({
    mentorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    mentorname: { type: String, required: true },
    groupname: { type: String, required: true },
    description: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }], //array of user IDs who are participants in the mentor group
});

module.exports = mongoose.model('Mentorgroups', mentorgroupsschema);