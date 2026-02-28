// ═══════════════════════════════════════════════════════════════
//  routes/contact.js
//  Mounted at:  /api/contact
// ═══════════════════════════════════════════════════════════════

const express           = require('express');
const router            = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, isAdmin } = require('../utils/authHelper');

// POST /api/contact       → Submit a contact form message (public)
router.post('/', contactController.submitMessage);

// GET  /api/contact       → Fetch all messages (admin only)
router.get('/', verifyToken, isAdmin, contactController.getAllMessages);

module.exports = router;