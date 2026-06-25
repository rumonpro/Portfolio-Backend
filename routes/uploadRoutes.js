const express = require('express');
const router = express.Router();
const multer = require('multer');

// Use memory storage — image stays in RAM as a Buffer, never touches disk
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
        }
    }
});

// POST /api/upload
// Converts the uploaded image to a Base64 data URL and returns it.
// The caller (dashboard) stores this URL in MongoDB's image field.
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to Base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({ imageUrl });
});

module.exports = router;
