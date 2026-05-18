const express = require('express');

const {sendMessage, getAllMessages, deleteMessage} = require('../controllers/generalmessages');

const { isAlumna, isAuth1 } = require('../middlewares/isAlumna');

const router = express.Router();

router.post('/sendmessage', isAuth1, isAlumna, sendMessage);

router.get('/getallmessages', isAuth1, isAlumna, getAllMessages );

router.delete('/deletemessage/:id', isAuth1, isAlumna, deleteMessage);






module.exports = router;
