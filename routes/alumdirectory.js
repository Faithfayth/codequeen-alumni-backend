const express = require('express');

const { submitToDirectory,
    getAllDirectoryRecords,
    adminUpdateRecord,
    adminUnlockRecord,
    deleteDirectoryRecord } = require('../controllers/alumdirectory');

const { isAuth, isAdmin, isAlumna, isPartner, isStudent } = require('../middlewares/isRole');

const router = express.Router();

router.post('/submittodirectory',isAuth, isAlumna, submitToDirectory );

router.get('/getalldirectoryrecords',isAuth, isAdmin, getAllDirectoryRecords );

router.put('/adminupdaterecord',isAuth, isAdmin, adminUpdateRecord );

router.put('/adminunlockrecord',isAuth, isAdmin, adminUnlockRecord );

router.delete('/deletedirectoryrecord',isAuth, isAdmin, deleteDirectoryRecord );





module.exports = router;