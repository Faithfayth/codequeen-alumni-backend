const Event = require('../models/events');

// 1. CREATE EVENT (Alumni or Corporate Partner - Enters database unverified)
const createEvent = async (req, res) => {   // form filled frontend
    try {
        // FIX: Added 'url' to destructuring array properties from request body
        const { title, description, category, startdate, enddate, location, imageurl, url } = req.body;

        // Validation Check: Ensure structural URL parameters exist if required
        const newEvent = new Event({
            creatorID: req.user.id, // Pulled dynamically from verified session token
            title,
            description,
            category,
            startdate,
            enddate,  // Frontend validates that enddate cannot happen in the past
            location,
            imageurl,
            url,      // FIX: Instantiated into the Database save instance
            isVerified: false, // Forces admin review loop step
            attendees: []
        });

        await newEvent.save();
        res.status(201).json({ 
            message: "Event submitted successfully! Awaiting administrator verification.", 
            result: newEvent 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to propose event", error: error.message });
    }
};

// 2. ADMIN VERIFICATION (Flips status & broadcasts live to all online systems)
const verifyEvent = async (req, res) => {  // called from an onclick function linked to a button
    try {
        const verifiedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { returnDocument: 'after' }
        );

        if (!verifiedEvent) return res.status(404).json({ message: "Target event not found." });

        // LIVE MEGAPHONE: Broadcast the newly verified event to all connected users instantly
        const io = req.app.get('io');
        io.emit('new_event_verified', verifiedEvent);

        res.status(200).json({ message: "Event verified and published!", result: verifiedEvent });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

// 3. FETCH CURRENT/UPCOMING VERIFIED EVENTS
const getCurrentEvents = async (req, res) => {  // fetch upcoming events via onclick tab handler
    try {
        const now = new Date();
        
        // Conditions: Must be verified AND its enddate must be in the future (>= now)
        const currentEvents = await Event.find({
            isVerified: true,
            enddate: { $gte: now }
        }).sort({ startdate: 1 }); // Sort closest date first

        res.status(200).json(currentEvents);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch upcoming events", error: error.message });
    }
};

// 4. FETCH PAST VERIFIED EVENTS
const getPastEvents = async (req, res) => {  // called from onclick tab handler
    try {
        const now = new Date();
        
        // Conditions: Must be verified AND its enddate is in the past (< now)
        const pastEvents = await Event.find({
            isVerified: true,
            enddate: { $lt: now }
        }).sort({ enddate: -1 }); // Newest completed event first

        res.status(200).json(pastEvents);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch past events", error: error.message });
    }
};

// 5. REGISTER FOR AN EVENT (Alumni or Student)
const registerForEvent = async (req, res) => {  // called from registration button onclick
    try {
        // Enforce that you can only register for verified events
        const event = await Event.findById(req.params.id);
        if (!event || !event.isVerified) {
            return res.status(400).json({ message: "Cannot register for an unverified or non-existent event." });
        }

        // Use $addToSet to prevent an alumna from registering for the same event multiple times
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { attendees: req.user.id } },
            { returnDocument: 'after' }
        );

        res.status(200).json({ message: "Successfully registered for this event!", result: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// 6. DELETE EVENT (Admin Only)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found." });

        // Notify active screens to strip this event card out of their lists
        const io = req.app.get('io');
        io.emit('event_deleted', req.params.id);

        res.status(200).json({ message: "Event permanently deleted from platform records." });
    } catch (error) {
        res.status(500).json({ message: "Delete operation failed", error: error.message });
    }
};

// 7. FETCH UNVERIFIED EVENTS (Admin Dashboard Moderation Pool Only)
const getUnverifiedEvents = async (req, res) => { 
    try {
        // Find all events where isVerified is explicitly false
        const pendingEvents = await Event.find({ isVerified: false }).sort({ startdate: 1 });
        
        res.status(200).json({
            message: "Unverified events retrieved successfully.",
            count: pendingEvents.length,
            result: pendingEvents
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch unverified events", error: error.message });
    }
};

// 8. UPDATE EVENT (NEW COMPONENT - Permits modification of parameters including the new URL field)
const updateEvent = async (req, res) => {
    try {
        const targetEventID = req.params.id;
        
        // Find existing record to evaluate creation mapping safety rules
        const checkEvent = await Event.findById(targetEventID);
        if (!checkEvent) return res.status(404).json({ message: "Target modification record absent." });

        // Authorization Constraint: Only the event creator or a system Admin can update this data
        if (checkEvent.creatorID.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access Denied: You do not possess structural ownership rights to update this event." });
        }

        // If a non-admin modifies a verified event, revert verification status to trigger re-review
        const updatePayload = { ...req.body };
        if (!req.user.isAdmin) {
            updatePayload.isVerified = false; 
        }

        const modifiedEvent = await Event.findByIdAndUpdate(
            targetEventID,
            { $set: updatePayload },
            { new: true, runValidators: true }
        );

        // Notify live clients about the event alteration details via web socket parameters
        const io = req.app.get('io');
        io.emit('event_updated_broadcast', modifiedEvent);

        res.status(200).json({ 
            message: req.user.isAdmin ? "Event updated successfully!" : "Event modified and returned to pending queue for admin review.", 
            result: modifiedEvent 
        });
    } catch (error) {
        res.status(500).json({ message: "Data adjustment pipeline fault encountered", error: error.message });
    }
};

module.exports = {
    createEvent,
    verifyEvent,
    getCurrentEvents,
    getPastEvents,
    registerForEvent,
    deleteEvent,
    getUnverifiedEvents,
    updateEvent // Exported cleanly
};