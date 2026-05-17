const Profile = require('../models/profiles');

// 1. CREATE PROFILE (Strict One-to-One)
const createProfile = async (req, res) => {
    try {
        // Check if a profile already exists for this logged-in user
        const existingProfile = await Profile.findOne({ alumnaID: req.user.id });
        
        if (existingProfile) {
            return res.status(400).json({ 
                message: "You already have a profile. Use 'update' to make changes." 
            });
        }

        const newProfile = new Profile({
            alumnaID: req.user.id,        // Grabbed automatically from isAuth middleware
            fullname: req.body.fullname,
            bio: req.body.bio,
            profileimage: req.body.profileimage,
            cvUrl: req.body.cvUrl,
            portfoliolink: req.body.portfoliolink,
            skills: req.body.skills,
            badges: [] // Starts empty, awarded by admin later
        });

        await newProfile.save();
        res.status(201).json({ message: "Profile created successfully!", result: newProfile });
    } catch (error) {
        res.status(500).json({ message: "Error creating profile", error: error.message });
    }
};

// 2. FETCH ALL PROFILES (For all Alumnae/Admins)
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profiles", error: error.message });
    }
};

// 3. UPDATE PROFILE (Owner Only)
const updateProfile = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        // SECURITY: Check if the requester is the owner
        if (profile.alumnaID.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access Denied: You can only edit your own profile." });
        }

        const updatedProfile = await Profile.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );

        res.status(200).json({ message: "Profile updated!", result: updatedProfile });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// 4. DELETE PROFILE (Owner Only)
const deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        // SECURITY: Check if the requester is the owner
        if (profile.alumnaID.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access Denied: You can only delete your own profile." });
        }

        await Profile.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Profile deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};




module.exports = {createProfile, getAllProfiles, updateProfile, deleteProfile }