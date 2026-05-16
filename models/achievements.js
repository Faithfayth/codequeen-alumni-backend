const mongoose = require('mongoose');

const achievementsschema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true }, //the date on which the achievement was awarded
    category: { type: String, required: true }, //accademic, professional, sponsorship, etc (will be indicated in the frontend for users to select from)
    ImageUrl: { type: String }, //"eg. a photo of graduation"
});

module.exports = mongoose.model('Achievements', achievementsschema);