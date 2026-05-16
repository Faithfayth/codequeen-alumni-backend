//createblog
//getallblogs
//getblogbyid
//updateblog
//deleteblog
//add comment

const Blogs = require('../models/Blogs');

const createBlog = async (req, res) => {
    try {
        const { authorID, authorname, title, content, imageUrl } = req.body;
        const newBlog = new Blogs({ authorID, authorname, title, content, imageUrl });
        await newBlog.save();
        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
}









module.exports = { createBlog, };