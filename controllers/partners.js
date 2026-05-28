const PartnerProfile = require('../models/partners');

// 1. CREATE PARTNER PROFILE (Partner Role Only - Strict 1:1)
const createPartnerProfile = async (req, res) => {
    try {
        const { companyname, location, description, website, logoUrl, contact, email } = req.body;

        const existingProfile = await PartnerProfile.findOne({ userID: req.user.id });
        if (existingProfile) {
            return res.status(400).json({ 
                message: "A profile already exists for this partner account. Use edit path to update data." 
            });
        }

        const newPartnerProfile = new PartnerProfile({
            userID: req.user.id,
            companyname,
            location,
            description,
            website,
            logoUrl,
            contact,
            email,
            status: 'pending' 
        });

        await newPartnerProfile.save();
        res.status(201).json({ 
            message: "Partner profile created successfully! Awaiting administrative verification.", 
            result: newPartnerProfile 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to initialize partner profile", error: error.message });
    }
};

// 2. FETCH ALL APPROVED PARTNERS (Accessible by Partners, Alumnae, Admins, and Students)
const getApprovedPartners = async (req, res) => {
    try {
        const verifiedPartners = await PartnerProfile.find({ status: 'approved' }).sort({ companyname: 1 });
        res.status(200).json(verifiedPartners);
    } catch (error) {
        res.status(500).json({ message: "Failed to load partners network registry", error: error.message });
    }
};

// 3. EDIT PARTNER PROFILE (Profile Owner Partner or Admin Only - Reverts to Pending)
const updatePartnerProfile = async (req, res) => {
    try {
        const profile = await PartnerProfile.findById(req.params.id);
        if (!profile) return res.status(404).json({ message: "Partner profile card matching this identifier not found." });

        // SECURITY CHECK: Is the requester the actual profile owner OR an administrator?
        if (profile.userID.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: "Access Denied: You do not possess structural permissions to alter this company record." 
            });
        }

        // FIX: Combine req.body changes AND force status to 'pending' inside the update payload
        const updateData = {
            ...req.body,
            status: 'pending' // Correctly placed inside the data payload object
        };

        const updatedProfile = await PartnerProfile.findByIdAndUpdate(
            req.params.id,
            updateData, // The actual data to change
            { returnDocument: 'after' } // The clean options object
        );

        // LIVE MEGAPHONE: Remove them from the public list stream instantly since they are now unverified
        const io = req.app.get('io');
        io.emit('partner_removed_from_network', req.params.id);

        res.status(200).json({ 
            message: "Partner record successfully updated! Profile status has reverted to pending for administrative re-verification.", 
            result: updatedProfile 
        });
    } catch (error) {
        res.status(500).json({ message: "Data update transaction failed", error: error.message });
    }
};

// 4. DELETE PARTNER PROFILE (Profile Owner Partner or Admin Only)
const deletePartnerProfile = async (req, res) => {
    try {
        const profile = await PartnerProfile.findById(req.params.id);
        if (!profile) return res.status(404).json({ message: "Partner record not found." });

        if (profile.userID.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access Denied: Unauthorized deletion invocation." });
        }

        await PartnerProfile.findByIdAndDelete(req.params.id);
        
        const io = req.app.get('io');
        io.emit('partner_removed_from_network', req.params.id);

        res.status(200).json({ message: "Partner profile permanently wiped from system archives." });
    } catch (error) {
        res.status(500).json({ message: "Data deletion transaction failed", error: error.message });
    }
};

// 5. ADMIN VERIFICATION TOGGLE WORKSPACE (Admin Only)
const verifyPartnerStatus = async (req, res) => {
    try {
        const { status } = req.body; 

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Validation Exception: Status must evaluate to 'approved' or 'rejected'." });
        }

        const evaluatedProfile = await PartnerProfile.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { returnDocument: 'after' }
        );

        if (!evaluatedProfile) return res.status(404).json({ message: "Target partner listing not found." });

        const io = req.app.get('io');
        if (status === 'approved') {
            io.emit('new_partner_onboarded', evaluatedProfile);
        } else {
            // Safety measure: If an admin explicitly rejects a previously approved item, pull it off screen
            io.emit('partner_removed_from_network', req.params.id);
        }

        res.status(200).json({ message: `Partner registration state switched to ${status}!`, result: evaluatedProfile });
    } catch (error) {
        res.status(500).json({ message: "Admin status alteration procedure aborted", error: error.message });
    }
};

// 6. ADMIN FETCH UNVERIFIED/PENDING QUEUE (Admin Dashboard Only)
const getPendingPartners = async (req, res) => {
    try {
        const pendingQueue = await PartnerProfile.find({ status: 'pending' }).sort({ createdAt: 1 });
        res.status(200).json({
            count: pendingQueue.length,
            result: pendingQueue
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to parse incoming application logs", error: error.message });
    }
};

module.exports = {
    createPartnerProfile,
    getApprovedPartners,
    updatePartnerProfile,
    deletePartnerProfile,
    verifyPartnerStatus,
    getPendingPartners
};