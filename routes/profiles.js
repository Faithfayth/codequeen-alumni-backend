const express = require('express');

const {createProfile, getAllProfiles, updateProfile, deleteProfile} = require('../controllers/profiles');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/createprofile', isAuth, isAlumna, createProfile);

router.get('/getallprofiles',isAuth, isAlumna, getAllProfiles);

router.put('/updateprofile/:id',isAuth, isAlumna, updateProfile);

router.delete('/deleteprofile/:id',isAuth, isAlumna, deleteProfile);



module.exports = router;