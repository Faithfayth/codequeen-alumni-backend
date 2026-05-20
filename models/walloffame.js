const mongoose = require('mongoose');

const wallOfFameSchema = new mongoose.Schema({
    alumnaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // Links directly to the sister's profile record
    name: { type: String, required: true }, // Display name for the showcase grid card
    specialAchievement: { type: String, required: true }, // Detailed breakdown of what makes her special
    imageUrl: { type: String }, // Professional photo or award image link
    spotlightCategory: { 
        type: String, 
        default: 'Community Leader', // e.g., 'Agritech Innovator', 'Fintech Pioneer', 'Scholarship Winner'
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true } // Admin audit trail logging
}, { 
    timestamps: true 
});

module.exports = mongoose.model('WallOfFame', wallOfFameSchema);