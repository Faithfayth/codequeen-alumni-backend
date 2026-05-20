const express = require('express');

const {
        createAchievement,
        getAllAchievements,
        updateAchievement,
        deleteAchievement } = require('../controllers/achievements');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/createachievement',isAuth, isAdmin, createAchievement );

router.post('/getallachievements',isAuth, isAdmin, getAllAchievements );

router.post('/updateachievement',isAuth, isAdmin, updateAchievement );

router.post('/deleteAchievement',isAuth, isAdmin, deleteAchievement );


module.exports = router;