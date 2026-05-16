//connect express, call the controllers, call the middleware, create router instance

const express = require('express'); 

const { createBlog } = require('../controllers/blogs');

const router = express.Router();

router.post('/create', createBlog);


module.exports = router;