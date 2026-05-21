const express = require('express');

const {createBadge, updateBadge, deleteBadge, awardBadge, getBadges} = require('../controllers/badges');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

//pass middleware in the router function
router.post('/createbadge',isAuth, isAdmin, createBadge );

router.put('/updateBadge/:id',isAuth, isAdmin, updateBadge );

router.delete('/deletebadge/:id',isAuth, isAdmin, deleteBadge );

// public fetch badges
router.get('/getbadges', getBadges );

router.post('/awardbadge',isAuth, isAdmin, awardBadge );










module.exports = router;