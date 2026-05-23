const Opportunity = require('../models/opportunities');

// 1. CREATE OPPORTUNITY (Alumni or Admin)
const createOpportunity = async (req, res) => {
    try {
        const { title, description, imageUrl, url, category, deadline } = req.body;

        const newOpportunity = new Opportunity({
            title,
            description,
            imageUrl,
            url,
            category,
            deadline,
            adminverified: false, // Hidden until verified
            addedBy: req.user.id // Automatically extracted from valid session token
        });

        await newOpportunity.save();
        res.status(201).json({ 
            message: "Opportunity submitted successfully! Awaiting admin verification.", 
            result: newOpportunity 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit opportunity", error: error.message });
    }
};

// 2. FETCH ACTIVE / UPCOMING OPPORTUNITIES (Verified & Deadline is in the future)
const getUpcomingOpportunities = async (req, res) => {
    try {
        const now = new Date();

        // Conditions: Must be verified AND deadline must be greater than or equal to right now
        const activeOpp = await Opportunity.find({
            adminverified: true,
            deadline: { $gte: now }
        }).sort({ deadline: 1 }); // Urgent deadlines show first

        res.status(200).json(activeOpp);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch active opportunities", error: error.message });
    }
};

// 3. FETCH PAST OPPORTUNITIES (Verified & Deadline has passed)
const getPastOpportunities = async (req, res) => {
    try {
        const now = new Date();

        // Conditions: Must be verified AND deadline is strictly less than right now
        const closedOpp = await Opportunity.find({
            adminverified: true,
            deadline: { $lt: now }
        }).sort({ deadline: -1 }); // Recently closed show first

        res.status(200).json(closedOpp);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch expired opportunities", error: error.message });
    }
};

// 4. ADMIN VERIFICATION (Flips flag & blasts it to active users in real-time)
const verifyOpportunity = async (req, res) => {
    try {
        const verifiedOpp = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { adminverified: true },
            { returnDocument: 'after' }
        );

        if (!verifiedOpp) return res.status(404).json({ message: "Opportunity not found." });

        // LIVE MEGAPHONE: Send data straight to front-end layout elements without browser refreshes
        const io = req.app.get('io');
        io.emit('new_opportunity_published', verifiedOpp);

        res.status(200).json({ message: "Opportunity verified and live!", result: verifiedOpp });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

// 5. FETCH UNVERIFIED OPPORTUNITIES (Admin Dashboard Pool Only)
const getUnverifiedOpportunities = async (req, res) => {
    try {
        const pendingOpp = await Opportunity.find({ adminverified: false }).sort({ deadline: 1 });
        
        res.status(200).json({
            count: pendingOpp.length,
            result: pendingOpp
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load pending queue", error: error.message });
    }
};

// 6. DELETE OPPORTUNITY (Admin Only)
const deleteOpportunity = async (req, res) => {
    try {
        const deletedOpp = await Opportunity.findByIdAndDelete(req.params.id);
        if (!deletedOpp) return res.status(404).json({ message: "Opportunity not found." });

        // Update active feeds to instantly drop this specific card
        const io = req.app.get('io');
        io.emit('opportunity_removed', req.params.id);

        res.status(200).json({ message: "Opportunity permanently expunged." });
    } catch (error) {
        res.status(500).json({ message: "Delete operation failed", error: error.message });
    }
};

module.exports = {
    createOpportunity,
    getUpcomingOpportunities,
    getPastOpportunities,
    verifyOpportunity,
    getUnverifiedOpportunities,
    deleteOpportunity
};