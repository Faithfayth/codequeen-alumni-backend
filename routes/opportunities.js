const express = require('express');
const {
    createOpportunity,
    getUpcomingOpportunities,
    getPastOpportunities,
    verifyOpportunity,
    getUnverifiedOpportunities,
    deleteOpportunity
} = require('../controllers/opportunities');

const { isAuth, isAdmin } = require('../middlewares/isRole');

const router = express.Router();

//Combined access verification logic directly on the post handler execution chain
router.post('/createopportunity', isAuth, (req, res, next) => {
    if (req.user.isAdmin || req.user.role === 'alumna' || req.user.role === 'partner') {
        return next();
    }
    return res.status(403).json({ message: "Access Denied: Valid Alumna or Partner access level credentials required." });
}, createOpportunity);

// Display Routes accessible to all authenticated dashboard systems
router.get('/getpcomingpportunities', isAuth, getUpcomingOpportunities);
router.get('/getpastopportunities', isAuth, getPastOpportunities);

// Admin Control Panel Verification Routes
router.put('/verifyopportunity/:id', isAuth, isAdmin, verifyOpportunity);
router.get('/getunverifiedopportunities', isAuth, isAdmin, getUnverifiedOpportunities);
router.delete('/deleteopportunity/:id', isAuth, isAdmin, deleteOpportunity);

module.exports = router;