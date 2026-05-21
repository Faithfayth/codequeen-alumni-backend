const mongoose = require('mongoose');

const electionsschema = mongoose.Schema({
    electionName: { type: String, required: true },
    description: { type: String, required: true },
    
    // Grouped Hierarchy: Election has Posts, Post has Candidates
    posts: [{
        postName: { type: String, required: true }, // e.g., "President", "Treasurer"
        candidates: [{
            candidateID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
            name: { type: String, required: true },
            manifesto: { type: String, required: true },
            imageurl: { type: String, required: true },
            votesCount: { type: Number, default: 0 }
        }]
    }],
    
    // Tracking collection array remains atomic to prevent duplicate voting per position
    votersRecord: [{
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        postVotedFor: { type: String, required: true } // Maps to posts.postName
    }],
    
    isActive: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Elections', electionsschema);