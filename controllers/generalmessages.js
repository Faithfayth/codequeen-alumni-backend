const GeneralMessage = require('../models/generalMessages');
const User = require('../models/users');

// 1. SEND MESSAGE (Alumni or Admin Only) - REST + Live Broadcast
const sendMessage = async (req, res) => {
    try {
        const { message, imageUrl } = req.body;

        // Validation Check: Ensure the message isn't completely empty
        if (!message && !imageUrl) {
            return res.status(400).json({ message: "A message must contain either text or an image." });
        }

        // Fetch the sender's account from the DB to get their verified name
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User account not found." });

        // A. Permanent Archivist: Save to MongoDB
        const newMessage = new GeneralMessage({
            senderID: req.user.id, 
            sendername: user.username, 
            message,
            imageUrl
        });
        await newMessage.save();

        // B. Live Megaphone: Broadcast the new message to everyone currently online
        const io = req.app.get('io');
        io.emit('receive_general_message', newMessage);

        // C. Standard HTTP response back to the sender
        res.status(201).json({ message: "Message sent to general chat!", result: newMessage });
    } catch (error) {
        res.status(500).json({ message: "Failed to send message", error: error.message });
    }
};

// 2. FETCH ALL MESSAGES (Alumni or Admin Only) - Standard REST HTTP
const getAllMessages = async (req, res) => {
    try {
        // Sorts chronologically (oldest first so it reads naturally like a chat stream)
        const chatHistory = await GeneralMessage.find().sort({ timestamp: 1 });
        res.status(200).json(chatHistory);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat logs", error: error.message });
    }
};

// 3. DELETE MESSAGE (Owner or Admin Only) - REST + Live Removal
// 3. DELETE MESSAGE (Owner or Admin Only - Within 24 Hours)  REST + Live Removal
const deleteMessage = async (req, res) => {
    try {
        const messageToDelete = await GeneralMessage.findById(req.params.id);
        if (!messageToDelete) return res.status(404).json({ message: "Message not found." });

        // SECURITY 1: Verify the requester is the original sender OR has administrative privileges
        if (messageToDelete.senderID.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: "Access Denied: You are only authorized to delete your own messages." 
            });
        }

        // TIME CONSTRAINT: Calculate time difference in milliseconds
        const currentTime = new Date();
        const messageAgeInMs = currentTime - new Date(messageToDelete.timestamp);
        
        // 24 hours in milliseconds = 24 * 60 * 60 * 1000 = 86,400,000 ms
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        // SECURITY 2: Check if the message has expired (Admins can bypass if needed, or enforce for everyone)
        if (messageAgeInMs > twentyFourHoursInMs && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: "Action Denied: Messages cannot be deleted after 24 hours." 
            });
        }

        // A. Permanent Archivist: Remove from MongoDB
        await GeneralMessage.findByIdAndDelete(req.params.id);

        // B. Live Megaphone: Tell the frontend exactly WHICH message ID to drop from the screen
        const io = req.app.get('io');
        io.emit('general_message_deleted', req.params.id);

        // C. Standard HTTP response back to the person who clicked delete
        res.status(200).json({ message: "Message successfully deleted from chat logs." });
    } catch (error) {
        res.status(500).json({ message: "Delete operation failed", error: error.message });
    }
};


module.exports = { sendMessage, getAllMessages, deleteMessage };