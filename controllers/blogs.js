const Blog = require('../models/blogs');
const User = require('../models/users');

// 1. CREATE BLOG POST (Alumni or Admin Only)
const createBlog = async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body; 

        // Find the logged-in user in the database using their token ID
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        const newBlog = new Blog({
            authorID: req.user.id,
            authorname: user.username, // Pulls their real name straight from the account!
            title,
            content,
            imageUrl
        });

        await newBlog.save();
        
        const io = req.app.get('io');
        if (io) {
            io.emit('new_blog_published', {
                title: newBlog.title,
                author: newBlog.authorname
            });
        }
        res.status(201).json({ message: "Blog post published successfully!", result: newBlog });
    } catch (error) {
        res.status(500).json({ message: "Failed to create blog post", error: error.message });
    }
};

// 2. FETCH ALL BLOGS (Alumni Only)
const getAllBlogs = async (req, res) => {
    try {
        // Sorts chronologically, newest posts first
        const blogs = await Blog.find().sort({ timestamp: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
    }
};

// 3. UPDATE BLOG (Owner Author or Admin Only)
const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog post not found." });

        // SECURITY: Verify user matches authorID OR has administrative privileges
        if (blog.authorID.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: "Access Denied: You do not have permission to modify this post." 
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({ message: "Blog post modified successfully!", result: updatedBlog });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// 4. DELETE BLOG (Owner Author or Admin Only)
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog post not found." });

        // SECURITY: Verify user matches authorID OR has administrative privileges
        if (blog.authorID.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: "Access Denied: You do not have permission to delete this post." 
            });
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Blog post deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

// 5. ADD COMMENT (Alumni Only)
const addComment = async (req, res) => {
    try {
        const { content } = req.body; 
        
        // Fetch the commenter's account to grab their verified username directly from database registry
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        const commentStructure = {
            commenterID: req.user.id,
            commentername: user.username, // Safely matches user document database property tracing
            content
        };

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: commentStructure } },
            { new: true }
        );

        if (!updatedBlog) return res.status(404).json({ message: "Target blog post not found." });

        res.status(201).json({ message: "Comment added successfully!", result: updatedBlog });
    } catch (error) {
        res.status(500).json({ message: "Failed to post comment", error: error.message });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog,
    addComment
};