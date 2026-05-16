//ONLY ACCESSIBLE BY ADMIN, create badge, update, delete, award, fetch badges.

const Badge = require('../models/badges');
const Profile = require('../models/profiles'); // Needed for awarding


//Creating the badge
const createBadge = async (req, res) => {
    try {
        const { badgename, iconurl, description } = req.body; //these come from the frontend
        const newBadge = new Badge({ badgename, iconurl, description }); //create a new instance of the badge object
        await newBadge.save();      //you save the new instance
        res.status(201).json({ message: "New Badge created!", result: newBadge });
    } catch (error) {
        res.status(500).json({ message: "Error creating badge", error: error.message });
    }
};



// Updating the badge
const updateBadge = async (req, res) => {
    try {
        const updatedBadge = await Badge.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json({ message: "Badge updated!", result: updatedBadge });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// Deleting the badge
const deleteBadge = async (req, res) => {
    try {
        await Badge.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Badge deleted permanently." });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

// 3. Awarding the badge (Linking a Badge to an Alumna's Profile)
const awardBadge = async (req, res) => {
    try {
        const { alumnaId, badgeId } = req.body;

        // Use $addToSet so she can't get the same badge twice
        const profile = await Profile.findOneAndUpdate(
            { userId: alumnaId },
            { $addToSet: { badges: badgeId } },
            { new: true }
        );

        res.status(200).json({ message: "Badge awarded!", result: profile });
    } catch (error) {
        res.status(500).json({ message: "Awarding failed", error: error.message });
    }
};






module.exports = { createBadge, updateBadge, deleteBadge, awardBadge };
