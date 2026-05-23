const express = require('express');

const { addHonoree,
        getWallOfFame,
        updateHonoree,
        deleteHonoree } = require('../controllers/walloffame');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/addhonoree',isAuth, isAdmin, addHonoree );

router.get('/getwalloffame',isAuth, isAlumna, isPartner, getWallOfFame );

router.put('/updatehonoree',isAuth, isAdmin, updateHonoree );

router.delete('/deletehonoree',isAuth, isAdmin, deleteHonoree );


module.exports = router;