const express = require('express');

const { createEvent, verifyEvent, getCurrentEvents, getPastEvents, registerForEvent, deleteEvent} = require('../controllers/events')

const { isAlumna, isAuth } = require('../middlewares/isAlumna');
const { isAdmin } = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/createevent', isAuth, isAlumna, createEvent);

router.post('/verifyevent/:id', isAuth, isAlumna, verifyEvent);

router.post('/getcurrentevents', isAuth, isAlumna, getCurrentEvents);

router.post('/getpastevents', isAuth, isAlumna, getPastEvents);

router.post('/registerforevent/:id', isAuth, isAlumna, registerForEvent);

router.post('/deleteevent/:id', isAuth, isAlumna, deleteEvent);






module.exports = router;