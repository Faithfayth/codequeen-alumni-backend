const express = require('express');

const { enrollInCohort,
        updateProgressByStudent,
        getPendingApprovals,
        approveByStudentId } = require('../controllers/enrollments');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/enrollincohort',isAuth, isAdmin, enrollInCohort );

router.put('/updateprogressbystudent',isAuth, isAdmin, updateProgressByStudent );

router.get('/getpendingapprovals',isAuth, isAdmin, getPendingApprovals );

router.put('/approvebystudentId',isAuth, isAdmin, approveByStudentId );



module.exports = router;