const express = require('express');

const {sendMessage, getAllMessages, deleteMessage} = require('../controllers/generalmessages');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/sendmessage', isAuth, isAlumna, sendMessage);

router.get('/getallmessages', isAuth, isAlumna, getAllMessages );

router.delete('/deletemessage/:id', isAuth, isAlumna, deleteMessage);






module.exports = router;
