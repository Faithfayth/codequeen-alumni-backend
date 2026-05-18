const express = require('express');

const {createProfile, getAllProfiles, updateProfile, deleteProfile} = require('../controllers/profiles');

const{isAlumna, isAuth1} = require('../middlewares/isAlumna')

const router = express.Router();

router.post('/createprofile', isAuth1, isAlumna, createProfile);

router.get('/getallprofiles',isAuth1, isAlumna, getAllProfiles);

router.put('/updateprofile/:id',isAuth1, isAlumna, updateProfile);

router.delete('/deleteprofile/:id',isAuth1, isAlumna, deleteProfile);



module.exports = router;