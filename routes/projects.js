const express = require('express');

const {
    uploadProject,
    getAllProjects,
    searchProjects,
    deleteProject } = require('../controllers/projects');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');


const router = express.Router();

router.post('/uploadproject',isAuth, isAlumna, uploadProject );

router.post('/getallprojects',isAuth, isAlumna, getAllProjects );

router.post('/searchprojects',isAuth, isAlumna, searchProjects );

router.post('/deleteproject',isAuth, isAdmin, deleteProject );

//will add verify functions later


module.exports = router;
