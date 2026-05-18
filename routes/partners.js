const express = require('express');

const { createPartnerProfile,
        getApprovedPartners,
        updatePartnerProfile,
        deletePartnerProfile,
        verifyPartnerStatus,
        getPendingPartners } = require('../controllers/partners');


const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/createpartnerrofile',isAuth, isPartner,  createPartnerProfile);  //Only partner or admin

router.get('/getapprovedpartners', isAuth, isAlumna, isPartner, isStudent, getApprovedPartners); //partners, alumni, students, admin

router.put('/updatepartnerprofile/:id', isAuth, isPartner, updatePartnerProfile);  //Partner or Admin

router.delete('/deletepartnerprofile/:id', isAuth, isPartner, deletePartnerProfile);  //only admin or owner partner

router.put('/verifypartnerstatus/:id', isAuth, isAdmin, verifyPartnerStatus); //only admin

router.get('/getpendingpartners', isAuth, isAdmin, getPendingPartners); //only admin





module.exports = router;