const express = require('express');

const { createElection,
        addCandidate,
        toggleElectionActive,
        getActiveElections,
        castVote,
        getElectionResults } = require('../controllers/elections');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/createelection',isAuth, isAdmin, createElection );

router.post('/addcandidate',isAuth, isAdmin, addCandidate );

router.post('/toggleelectionactive',isAuth, isAdmin, toggleElectionActive );

router.post('/getactiveelections',isAuth, isAdmin, getActiveElections );

router.post('/castvote',isAuth, isAlumna, castVote );

router.post('/getelectionresults',isAuth, isAdmin, getElectionResults );




module.exports = router;