const express = require('express');
const multer = require('multer');

const { 
    addResource,
    getAllResources,
    updateResource,
    deleteResource 
} = require('../controllers/resources');

const { isAuth, isAlumna } = require('../middlewares/isRole');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit Max
});

const router = express.Router();

// Fallback protection intercepts empty streams only if a backup text URL link is missing
router.post('/addresource', upload.single('resourceFile'), isAuth, isAlumna, (req, res, next) => {
    if (req.file && (!req.file.buffer || req.file.buffer.length === 0) && !req.body.url) {
        return res.status(400).json({ 
            message: "File processing failure: The uploaded file asset buffer stream arrived completely empty." 
        });
    }
    next();
}, addResource);

router.get('/getallresources', isAuth, isAlumna, getAllResources);
router.put('/updateresource/:id', isAuth, isAlumna, updateResource);
router.delete('/deleteresource/:id', isAuth, isAlumna, deleteResource);

module.exports = router;