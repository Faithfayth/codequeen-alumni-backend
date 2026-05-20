const WallOfFame = require('../models/WallOfFame');

// 1. ADD NEW HONOREE CARD (Admin Only)
const addHonoree = async (req, res) => {
    try {
        const { alumnaId, name, specialAchievement, imageUrl, spotlightCategory } = req.body;

        // Validation Check: Prevent adding duplicate cards for the same sister
        const alreadyFeatured = await WallOfFame.findOne({ alumnaId });
        if (alreadyFeatured) {
            return res.status(400).json({ 
                message: "Validation Error: This alumna is already featured on the Wall of Fame." 
            });
        }

        const newCard = new WallOfFame({
            alumnaId,
            name,
            specialAchievement,
            imageUrl,
            spotlightCategory,
            addedBy: req.user.id // Caught from decoding token data streams
        });

        await newCard.save();

        // Socket.io Realtime Broadcast: Flash the new inspiration card instantly onto all screens
        const io = req.app.get('io');
        if (io) {
            io.emit('wall_of_fame_new_star', {
                message: `🌟 A new sister has been inducted onto the Wall of Fame: Celebrate ${name}!`,
                card: newCard
            });
        }

        res.status(201).json({ message: "Alumna card successfully added to the Wall of Fame!", result: newCard });
    } catch (error) {
        res.status(500).json({ message: "Failed to create Wall of Fame card", error: error.message });
    }
};

// 2. FETCH WALL OF FAME (Admin and Alumna Only)
const getWallOfFame = async (req, res) => {
    try {
        // Fetch and sort cards so the latest additions appear first
        const wallData = await WallOfFame.find()
            .populate('alumnaId', 'email role cohortHistory')
            .populate('addedBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: wallData.length,
            result: wallData
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve Wall of Fame ledger records", error: error.message });
    }
};

// 3. UPDATE HONOREE CARD (Admin Only)
const updateHonoree = async (req, res) => {
    try {
        const { name, specialAchievement, imageUrl, spotlightCategory } = req.body;

        const updatedCard = await WallOfFame.findByIdAndUpdate(
            req.params.id,
            { name, specialAchievement, imageUrl, spotlightCategory },
            { returnDocument: 'after' } // Modern, error-free query update parameter choice
        );

        if (!updatedCard) {
            return res.status(404).json({ message: "Target Wall of Fame profile record not found." });
        }

        // Emit update event to UI interfaces
        const io = req.app.get('io');
        if (io) {
            io.emit('wall_of_fame_card_updated', updatedCard);
        }

        res.status(200).json({ message: "Wall of Fame card successfully adjusted!", result: updatedCard });
    } catch (error) {
        res.status(500).json({ message: "Data adjustment aborted", error: error.message });
    }
};

// 4. DELETE HONOREE CARD (Admin Only)
const deleteHonoree = async (req, res) => {
    try {
        const deleted = await WallOfFame.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Target spotlight record not found." });

        // Update active screens to pop out the card immediately
        const io = req.app.get('io');
        if (io) {
            io.emit('wall_of_fame_card_removed', req.params.id);
        }

        res.status(200).json({ message: "Spotlight card permanently stripped from the Wall of Fame." });
    } catch (error) {
        res.status(500).json({ message: "Data deletion operation failed", error: error.message });
    }
};

module.exports = {
    addHonoree,
    getWallOfFame,
    updateHonoree,
    deleteHonoree
};