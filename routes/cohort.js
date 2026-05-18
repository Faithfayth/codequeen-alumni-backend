const express = require('express');

const {createCohort, getAllCohorts, getSingleCohort, deleteCohort} = require('../controllers/cohort');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');


const router = express.Router();

router.post('/createcohort',isAuth, isAdmin, createCohort );

router.post('/getallcohorts',isAuth, isAdmin, getAllCohorts );

router.post('/getsinglecohort/:id',isAuth, isAdmin, getSingleCohort );

router.post('/deletecohort/:id',isAuth, isAdmin, deleteCohort );




module.exports = router;