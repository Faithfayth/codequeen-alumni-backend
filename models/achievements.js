const mongoose = require('mongoose');

const achievementsschema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true }, // The date on which the achievement was awarded
    category: { type: String, required: true }, // Academic, professional, sponsorship, etc.
    ImageUrl: { type: String }, // e.g., "a photo of graduation"
    // ADDED: Tracks the specific administrator who generated this record
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
}, { 
    // ADDED: Automatically adds createdAt and updatedAt tracking fields
    timestamps: true 
});

module.exports = mongoose.model('Achievements', achievementsschema);