const express = require('express');

const {
    uploadProject,
    getAllProjects,
    searchProjects,
    deleteProject } = require('../controllers/projects');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');


const router = express.Router();

router.post('/uploadproject',isAuth, isAlumna, uploadProject );

router.get('/getallprojects',isAuth, isAlumna, isPartner, getAllProjects );

router.get('/searchprojects',isAuth, isAlumna, isPartner, searchProjects );

router.delete('/deleteproject',isAuth, isAdmin, deleteProject );

//will add verify functions later


module.exports = router;
