const mongoose = require('mongoose');

const eventsschema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {type: String, required: true }, //this will be used to categorize the events (e.g., "networking", "workshop", "webinar", etc.)
    date: { type: Date, required: true },
    location: { type: String, required: true },
    imageurl: { type: String },
    isVerified: { type: Boolean, required: true },
    attendees: { type: [String], required: true }, //this will be an array of userIDs of the attendees.
});

module.exports = mongoose.model('Events', eventsschema);

//when an alumna registers for an event, their userID will be added to the attendees array of that event.