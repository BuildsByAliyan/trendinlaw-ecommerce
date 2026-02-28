// ═══════════════════════════════════════════════════════════════
//  routes/auth.js
//  Mounted at:  /api/auth
// ═══════════════════════════════════════════════════════════════

const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../utils/authHelper');

// POST  /api/auth/register  → Create new account
router.post('/register', authController.register);

// POST  /api/auth/login     → Returns JWT token
router.post('/login', authController.login);

// POST  /api/auth/logout    → Client discards token; server confirms
router.post('/logout', authController.logout);

// GET   /api/auth/me        → Get current user profile (protected)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;