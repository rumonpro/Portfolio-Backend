const express = require('express');
const router = express.Router();
const { loginUser, setupSuperAdmin } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/setup', setupSuperAdmin);

module.exports = router;
