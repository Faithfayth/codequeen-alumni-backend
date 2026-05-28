const express = require('express');

const { createEvent, verifyEvent, getCurrentEvents, getPastEvents, registerForEvent, deleteEvent, getUnverifiedEvents} = require('../controllers/events')

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/createevent', isAuth, (req, res, next) => {
    if (req.user.isAdmin || req.user.role === 'alumna' || req.user.role === 'partner') {
        return next();
    }
    return res.status(403).json({ message: "Access Denied: Valid Alumna or Partner access level credentials required." });
}, createEvent);

router.put('/verifyevent/:id', isAuth,  isAdmin, verifyEvent);

router.get('/getcurrentevents', isAuth, (req, res, next) => {
    if (req.user.isAdmin || req.user.role === 'alumna' || req.user.role === 'partner') {
        return next();
    }
    return res.status(403).json({ message: "Access Denied: Valid Alumna or Partner access level credentials required." });
}, getCurrentEvents);

router.get('/getpastevents', isAuth, (req, res, next) => {
    if (req.user.isAdmin || req.user.role === 'alumna' || req.user.role === 'partner') {
        return next();
    }
    return res.status(403).json({ message: "Access Denied: Valid Alumna or Partner access level credentials required." });
}, getPastEvents);

router.put('/registerforevent/:id', isAuth, isAlumna, registerForEvent);

router.delete('/deleteevent/:id', isAuth, isAdmin, deleteEvent);

router.get('/getunverifiedevents', isAuth, isAdmin, getUnverifiedEvents);








module.exports = router;