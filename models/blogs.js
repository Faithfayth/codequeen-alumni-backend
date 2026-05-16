const mongoose = require('mongoose');

const blogsschema = mongoose.Schema({
    authorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    authorname: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    timestamp: { type: Date, default: Date.now }, //this will automatically add a createdAt field to the schema, which will store the date and time when the blog post was created.
    comments:[{
        commenterID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        commentername: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
})


module.exports = mongoose.model('Blogs', blogsschema);