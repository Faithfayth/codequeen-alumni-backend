//connect express, call the controllers, call the middleware, create router instance

const express = require('express'); 

const { createBlog, getAllBlogs, updateBlog, deleteBlog, addComment } = require('../controllers/blogs');

const { isAlumna, isAuth1 } = require('../middlewares/isAlumna');
const { isAdmin } = require('../middlewares/isAdmin')

const router = express.Router();

router.post('/createblog', isAuth1, isAlumna, createBlog);

router.get('/getallblogs', isAuth1, isAlumna, getAllBlogs );

router.put('/updateblog/:id', isAuth1, isAlumna, updateBlog );

router.delete('/deleteblog/:id', isAuth1, isAlumna, deleteBlog);

router.post('/addcomment/:id', isAuth1, isAlumna, addComment);








module.exports = router;