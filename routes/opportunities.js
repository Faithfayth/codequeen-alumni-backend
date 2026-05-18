const express = require('express');

const {createOpportunity,
       getUpcomingOpportunities,
       getPastOpportunities,
       verifyOpportunity,
       getUnverifiedOpportunities,
       deleteOpportunity } = require('../controllers/opportunities');

const { isAlumna, isAuth1 } = require('../middlewares/isAlumna');
const { isAuth, isAdmin } = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/createopportunity', isAuth1, isAlumna, createOpportunity);

router.get('/getpcomingpportunities', isAuth1, isAlumna, getUpcomingOpportunities);

router.get('/getpastopportunities', isAuth1, isAlumna, getPastOpportunities);

router.put('/verifyopportunity/:id', isAuth, isAdmin, verifyOpportunity);

router.get('/getunverifiedopportunities', isAuth, isAdmin, getUnverifiedOpportunities);

router.delete('/deleteopportunity/:id', isAuth, isAdmin, deleteOpportunity);



module.exports = router;