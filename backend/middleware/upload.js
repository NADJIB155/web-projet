const multer = require('multer');
const path = require('path');

// Set Storage Engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb){
    // Save as: fieldname-date.extension (e.g., video-16234234.mp4)
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 100000000}, // Limit 100MB (Change as needed)
}).single('video'); // Field name must be 'video'

module.exports = upload;