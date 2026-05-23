const express = require('express');

const {register, 
    login, 
    getAllStudents, 
    getAllAlumnae, 
    getAllPartners, 
    getAllAdmins } = require('../controllers/users');

const router = express.Router();

router.post('/register',register);

router.post('/login', login);

router.get('/getallstudents', getAllStudents);

router.get('/getallalumnae', getAllAlumnae);

router.get('/getallapartners', getAllPartners);

router.get('/getalladmin', getAllAdmins);



module.exports = router;