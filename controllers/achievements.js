const Achievements = require('../models/achievements');

// 1. CREATE AN ACHIEVEMENT (Admin Only)
const createAchievement = async (req, res) => {
    try {
        const { title, description, date, category, ImageUrl } = req.body;

        const newAchievement = new Achievements({
            title,
            description,
            date,
            category,
            ImageUrl,
            createdBy: req.user.id // Captured securely from your auth decoding token middleware
        });

        await newAchievement.save();

        // Socket.io Live Broadcast Notification
        const io = req.app.get('io');
        if (io) {
            io.emit('new_achievement_unlocked', {
                message: `🎉 Global Community Milestone Unlocked: ${title}!`,
                achievement: newAchievement
            });
        }

        res.status(201).json({ 
            message: "Community achievement successfully logged and broadcasted!", 
            result: newAchievement 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to initialize achievement record", error: error.message });
    }
};

// 2. FETCH ALL ACHIEVEMENTS (Accessible by Partners, Students, Alumnae, and Admins)
const getAllAchievements = async (req, res) => {
    try {
        // Sort achievements by award date (newest milestones show up at the top of the board)
        const board = await Achievements.find()
            .populate('createdBy', 'username')
            .sort({ date: -1 });

        res.status(200).json({
            count: board.length,
            result: board
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve accomplishments board logs", error: error.message });
    }
};

// 3. UPDATE AN ACHIEVEMENT (Admin Only)
const updateAchievement = async (req, res) => {
    try {
        const { title, description, date, category, ImageUrl } = req.body;

        const updatedAchievement = await Achievements.findByIdAndUpdate(
            req.params.id,
            { title, description, date, category, ImageUrl },
            { returnDocument: 'after' } // Modern, warning-free configuration parameter choice
        );

        if (!updatedAchievement) {
            return res.status(404).json({ message: "Target achievement card not found." });
        }

        // Push real-time modification details to updating screens
        const io = req.app.get('io');
        if (io) {
            io.emit('achievement_updated', updatedAchievement);
        }

        res.status(200).json({ message: "Achievement record successfully updated!", result: updatedAchievement });
    } catch (error) {
        res.status(500).json({ message: "Data update transaction aborted", error: error.message });
    }
};

// 4. DELETE AN ACHIEVEMENT (Admin Only)
const deleteAchievement = async (req, res) => {
    try {
        const deleted = await Achievements.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Target achievement record matching this id not found." });
        }

        // Live megaphone notification to clear item from screens globally
        const io = req.app.get('io');
        if (io) {
            io.emit('achievement_removed', req.params.id);
        }

        res.status(200).json({ message: "Achievement record permanently removed from platform records." });
    } catch (error) {
        res.status(500).json({ message: "Data deletion transaction failed", error: error.message });
    }
};

module.exports = {
    createAchievement,
    getAllAchievements,
    updateAchievement,
    deleteAchievement
};