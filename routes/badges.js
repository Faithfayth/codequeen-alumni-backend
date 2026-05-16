const express = require('express');

const {createBadge, updateBadge, deleteBadge, awardBadge} = require('../controllers/badges');

const {isAuth, isAdmin } = require('../middlewares/isAdmin');

const router = express.Router();

//have to pass middleware in the router function
router.post('/createbadge',isAuth, isAdmin, createBadge );

router.put('/updateBadge/:id',isAuth, isAdmin, updateBadge );

router.delete('/deletebadge/:id',isAuth, isAdmin, deleteBadge );

router.post('/awardbadge',isAuth, isAdmin, awardBadge );










module.exports = router;