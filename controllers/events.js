const Event = require('../models/Events');

// 1. CREATE EVENT (Alumni Only - Enters database unverified)
const createEvent = async (req, res) => {   //form filled frontend
    try {
        const { title, description, category, startdate, enddate, location, imageurl } = req.body;

        const newEvent = new Event({
            creatorID: req.user.id, // Pulled from token
            title,
            description,
            category,
            startdate,
            enddate,  //frontend has to verify for for enddate not to be a past date
            location,
            imageurl,
            isVerified: false, // Forces admin review step
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

// 2. ADMIN VERIFICATION (Flips status & broadcasts live to all online Alumnae)
const verifyEvent = async (req, res) => {  //called from an onclick function linked to a button
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
const getCurrentEvents = async (req, res) => {  //fetch upcoming events. >>onclick function
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
const getPastEvents = async (req, res) => {  //called from onclick function
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

// 5. REGISTER FOR AN EVENT (Alumni or Admin)
const registerForEvent = async (req, res) => {  //called from an onclick function
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


const getUnverifiedEvents = async (req, res) => { //Only accessible to admin >>probably onclick function
    try {
        // Find all events where isVerified is explicitly false
        // Sorted with the oldest submissions first so admins can process them in order
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


module.exports = {
    createEvent,
    verifyEvent,
    getCurrentEvents,
    getPastEvents,
    registerForEvent,
    deleteEvent,
    getUnverifiedEvents
};