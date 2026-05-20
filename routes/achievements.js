const express = require('express');

const {
        createAchievement,
        getAllAchievements,
        updateAchievement,
        deleteAchievement } = require('../controllers/achievements');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/createachievement',isAuth, isAdmin, createAchievement );

router.get('/getallachievements',isAuth, isAdmin, getAllAchievements );

router.put('/updateachievement',isAuth, isAdmin, updateAchievement );

router.delete('/deleteAchievement',isAuth, isAdmin, deleteAchievement );


module.exports = router;