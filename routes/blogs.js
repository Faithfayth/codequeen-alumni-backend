//connect express, call the controllers, call the middleware, create router instance

const express = require('express'); 

const { createBlog, getAllBlogs, updateBlog, deleteBlog, addComment } = require('../controllers/blogs');

const { isAlumna, isAuth } = require('../middlewares/isAlumna');
const { isAdmin } = require('../middlewares/isAdmin')

const router = express.Router();

router.post('/createblog', isAuth, isAlumna, createBlog);

router.get('/getallblogs', isAuth, isAlumna, getAllBlogs );

router.put('/updateblog/:id', isAuth, isAlumna, updateBlog );

router.delete('/deleteblog/:id', isAuth, isAlumna, deleteBlog);

router.post('/addcomment/:id', isAuth, isAlumna, addComment);








module.exports = router;