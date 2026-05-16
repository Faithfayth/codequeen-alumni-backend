//ONLY ACCESSIBLE BY ADMIN, create badge, update, delete, award

const Badge = require('../models/badges')

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











module.exports = { createBadge };