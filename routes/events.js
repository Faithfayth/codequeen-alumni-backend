const express = require('express');

const { createEvent, verifyEvent, getCurrentEvents, getPastEvents, registerForEvent, deleteEvent, getUnverifiedEvents} = require('../controllers/events')

const { isAlumna, isAuth1 } = require('../middlewares/isAlumna');
const { isAuth, isAdmin } = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/createevent', isAuth1, isAlumna, createEvent);

router.put('/verifyevent/:id', isAuth,  isAdmin, verifyEvent);

router.get('/getcurrentevents', isAuth, isAlumna, getCurrentEvents);

router.get('/getpastevents', isAuth, isAlumna, getPastEvents);

router.put('/registerforevent/:id', isAuth, isAlumna, registerForEvent);

router.delete('/deleteevent/:id', isAuth, isAdmin, deleteEvent);

router.get('/getunverifiedevents', isAuth, isAdmin, getUnverifiedEvents);








module.exports = router;