const express = require('express');
const multer = require('multer');

const { 
    addImage,
    getAllImages,
    deleteImage,
    updateImageMetadata 
} = require('../controllers/gallery');

const { isAuth, isAdmin, isAlumna } = require('../middlewares/isRole');

const router = express.Router();

// Configure multer to temporarily hold files in memory buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Inject multer middleware ('image' matches the form key name your frontend will submit)
router.post('/addimage', isAuth, isAlumna, upload.single('image'), addImage);

router.get('/getallimages', isAuth, isAlumna, getAllImages);

// FIXED: Restored missing structural resource :id parameters to match controller expectations
router.delete('/deleteimage/:id', isAuth, isAdmin, deleteImage);

router.put('/updateimagemetadata/:id', isAuth, isAdmin, updateImageMetadata);

module.exports = router;