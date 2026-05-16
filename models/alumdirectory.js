const mongoose = require('mongoose');

const alumdirectoryschema = mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    name:   { type: String, required: true },
    email:  { type: String, required: true },
    contact:{ type: String, required: true },
    location: { type: String, required: true },
    //NIN: { type: String, required: true },
    graduationYear: { type: Number, required: true },
});

module.exports = mongoose.model('Alumdirectory', alumdirectoryschema);



//this will be filled once a user receives a message, that they have been verified to join the alumni community, (complete project submission, attendance marked and verified by the admin)