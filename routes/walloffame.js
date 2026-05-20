const express = require('express');

const { addHonoree,
        getWallOfFame,
        updateHonoree,
        deleteHonoree } = require('../controllers/walloffame');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/addhonoree',isAuth, isAlumna, addHonoree );

router.post('/getwalloffame',isAuth, isAlumna, getWallOfFame );

router.post('/updatehonoree',isAuth, isAlumna, updateHonoree );

router.post('/deletehonoree',isAuth, isAlumna, deleteHonoree );


module.exports = router;