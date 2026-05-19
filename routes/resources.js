const express = require('express');
const multer = require('multer');

// Controller Import - Added missing 'require'
const { 
    addResource,
    getAllResources,
    updateResource,
    deleteResource 
} = require('../controllers/resources');

// Middleware Import
const { isAuth, isAlumna, isAdmin } = require('../middlewares/isRole');

// Multer Configuration (Memory storage for Cloudinary streaming)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

/**
 * @route   POST /api/resources/addresource
 * @desc    Upload a file or add a link (Admin/Alumna only)
 * @access  Private
 */
router.post('/addresource', isAuth, upload.single('resourceFile'), addResource);  // 'resourceFile' is the name attribute for the frontend input

/**
 * @route   GET /api/resources/getallresources
 * @desc    Fetch all shared resources
 * @access  Private
 */
router.get('/getallresources', isAuth, getAllResources);

/**
 * @route   PUT /api/resources/updateresource/:id
 * @desc    Update a resource by ID
 * @access  Private (Owner or Admin)
 */
router.put('/updateresource/:id', isAuth, updateResource);

/**
 * @route   DELETE /api/resources/deleteresource/:id
 * @desc    Remove a resource and its cloud file
 * @access  Private (Owner or Admin)
 */
router.delete('/deleteresource/:id', isAuth, deleteResource);

module.exports = router;