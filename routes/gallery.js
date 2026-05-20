const express = require('express');

const { addImage,
        getAllImages,
        deleteImage,
        updateImageMetadata } = require('../controllers/gallery');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/addimage',isAuth, isAlumna, addImage );

router.post('/getallimages',isAuth, isAlumna, getAllImages );

router.post('/deleteimage',isAuth,  deleteImage );

router.post('/updateimagemetadata',isAuth, isAlumna, updateImageMetadata );



module.exports = router;