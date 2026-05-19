const express = require('express');

const { enrollInCohort,
        updateProgressByStudent,
        getPendingApprovals,
        approveByStudentId } = require('../controllers/enrollments');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/enrollincohort',isAuth, isAdmin, enrollInCohort );

router.post('/updateprogressbystudent',isAuth, isAdmin, updateProgressByStudent );

router.post('/getpendingapprovals',isAuth, isAdmin, getPendingApprovals );

router.post('/approvebystudentId',isAuth, isAdmin, approveByStudentId );



module.exports = router;