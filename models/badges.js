const mongoose = require('mongoose');

const badgesschema = mongoose.Schema({
    badgename: { type: String, required: true },
    iconurl: { type: String, required: true },
    description: { type: String, required: true },
});

module.exports = mongoose.model('Badges', badgesschema);