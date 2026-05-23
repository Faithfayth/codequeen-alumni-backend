const express = require('express');
const router = express.Router();
const { 
    createElection,
    addPostToElection, // Make sure this is imported!
    addCandidate,
    toggleElectionActive,
    getActiveElections,
    castVote,
    getElectionResults 
} = require('../controllers/elections');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

// Synchronized Route Definitions with proper parameter maps
router.post('/createelection', isAuth, isAdmin, createElection);
router.post('/addpost/:electionId', isAuth, isAdmin, addPostToElection);
router.post('/addcandidate/:electionId', isAuth, isAdmin, addCandidate);
router.put('/toggleelectionactive/:id', isAuth, isAdmin, toggleElectionActive);
router.get('/getactiveelections', isAuth,isAlumna, isPartner, isStudent, getActiveElections); // Removed strict admin lock so dashboard can load it
router.get('/getelectionresults/:id', isAuth,isAdmin, getElectionResults);
router.post('/castvote', isAuth, isAlumna, castVote);

module.exports = router;