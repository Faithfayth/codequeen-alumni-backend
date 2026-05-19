const multer = require('multer');
const path = require('path');

// Store in memory temporarily so we can stream to the cloud
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|docx|doc|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only documents (PDF, DOCX, PPT) are allowed!'));
    }
};

const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('resourceFile'); 

module.exports = upload;