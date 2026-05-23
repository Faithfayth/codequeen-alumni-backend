const express = require('express');

const {createOpportunity,//tab
       getUpcomingOpportunities,//tab
       getPastOpportunities,//tab
       verifyOpportunity,//button
       getUnverifiedOpportunities,  //tab
       deleteOpportunity //button
                     } = require('../controllers/opportunities');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');


const router = express.Router();

router.post('/createopportunity', isAuth, isAlumna, createOpportunity);

router.get('/getpcomingpportunities', isAuth, isAlumna, getUpcomingOpportunities);

router.get('/getpastopportunities', isAuth, isAlumna, getPastOpportunities);

router.put('/verifyopportunity/:id', isAuth, isAdmin, verifyOpportunity);

router.get('/getunverifiedopportunities', isAuth, isAdmin, getUnverifiedOpportunities);

router.delete('/deleteopportunity/:id', isAuth, isAdmin, deleteOpportunity);



module.exports = router;