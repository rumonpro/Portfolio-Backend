const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST /api/contact/message
router.post('/message', contactController.sendMessage);

// POST /api/contact/subscribe
router.post('/subscribe', contactController.subscribeNewsletter);

module.exports = router;
