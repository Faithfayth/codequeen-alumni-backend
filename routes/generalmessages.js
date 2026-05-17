const express = require('express');

const {sendMessage, getAllMessages, deleteMessage} = require('../controllers/generalmessages');

const { isAlumna, isAuth } = require('../middlewares/isAlumna');

const router = express.Router();

router.post('/sendmessage', isAuth, isAlumna, sendMessage);

router.get('/getallmessages', isAuth, isAlumna, getAllMessages );

router.delete('/deletemessage/:id', isAuth, isAlumna, deleteMessage);






module.exports = router;
