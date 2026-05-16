const express = require('express');

const {createBadge} = require('../controllers/badges');

const {isAuth, isAdmin } = require('../middlewares/isAdmin');

const router = express.Router();

//have to pass middleware in the router function
router.post('/createbadge',isAuth, isAdmin, createBadge );






module.exports = router;