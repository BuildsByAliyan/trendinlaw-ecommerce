// ═══════════════════════════════════════════════════════════════
//  TREND IN LAW — server.js  (Entry Point)
//  Run from:  /server/   →   node server.js
//  All route files live at:  ../routes/
//  All data  files live at:  ../data/
// ═══════════════════════════════════════════════════════════════

require('dotenv').config({ path: __dirname + '/.env' });

const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Validate required env vars on startup ──────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'YOUR_VERY_STRONG_SECRET_KEY_HERE_FOR_JWT{') {
    console.error('❌  FATAL: JWT_SECRET is not set. Edit server/.env before running.');
    process.exit(1);
}

// ── Import Routes ──────────────────────────────────────────────
const authRoutes    = require('../routes/auth');
const productRoutes = require('../routes/products');
const orderRoutes   = require('../routes/orders');
const contactRoutes = require('../routes/contact');
const returnRoutes  = require('../routes/returns');

// ── CORS ───────────────────────────────────────────────────────
//  Allow all origins during development.
//  In production, replace '*' with your actual domain:
//  e.g.  origin: 'https://trendinlaw.com'
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ───────────────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ── Serve Frontend Static Files ────────────────────────────────
//  The /docs folder holds all HTML, CSS, JS, images.
//  Visiting http://localhost:5000 serves docs/index.html
const frontendPath = path.join(__dirname, '..', 'docs');
app.use(express.static(frontendPath));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/returns',  returnRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler for unknown API routes ────────────────────────
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// ── Fallback: serve index.html for any non-API route ──────────
//  Useful if you ever add client-side routing in the future.
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: 'An internal server error occurred.' });
});

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅  Server running  →  http://localhost:${PORT}`);
    console.log(`📦  API Base URL    →  http://localhost:${PORT}/api`);
    console.log(`🗂️   Frontend served →  http://localhost:${PORT}\n`);
});