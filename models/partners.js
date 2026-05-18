const mongoose = require('mongoose');

const partnersschema = mongoose.Schema({
    // Adding unique: true forces MongoDB to reject any duplicate profiles for the same account
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
    companyname: { type: String, required: true },
    location:    { type: String, required: true },
    description: { type: String, required: true },
    website: { type: String },
    logoUrl: { type: String },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
});

module.exports = mongoose.model('Partners', partnersschema);

//after a patner has registered as user and selected "partner" as their role, they will be able to create a partner profile 
// by providing the partner name and other relevant details. 
// This information will be stored in the "Partners" collection in the database, which is linked to the "Users" collection through the userID field.