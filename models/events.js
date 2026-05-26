const mongoose = require('mongoose');

const eventsschema = mongoose.Schema({
    creatorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    title:     { type: String, required: true },
    description: { type: String, required: true },
    category:  { type: String, required: true }, 
    url:       { type: String }, // Optional field for event-related links
    startdate: { type: Date, required: true },
    enddate:   { type: Date, required: true }, // Added to manage past vs current splitting
    location:  { type: String, required: true },
    imageurl:  { type: String },
    isVerified:{ type: Boolean, default: false }, // Default to false until admin reviews
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }] // Better tracking format
});
module.exports = mongoose.model('Events', eventsschema);

//when an alumna registers for an event, their userID will be added to the attendees array of that event.