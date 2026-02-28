// ═══════════════════════════════════════════════════════════════
//  utils/fileHelper.js
//  JSON flat-file database helpers.
//  All data files live in:  /data/
// ═══════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');

// Resolves to the /data/ directory at the project root,
// regardless of where this file is imported from.
const DATA_DIR = path.resolve(__dirname, '..', 'data');

/**
 * Reads a JSON data file and returns its contents as a parsed array.
 * Returns [] if the file does not exist yet (safe bootstrap).
 *
 * @param {string} filename  e.g. 'orders.json'
 * @returns {Promise<Array>}
 */
exports.readData = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DATA_DIR, filename);
        fs.readFile(filePath, 'utf8', (err, raw) => {
            if (err) {
                // File doesn't exist yet — treat as empty DB table
                if (err.code === 'ENOENT') return resolve([]);
                return reject(new Error(`readData failed for "${filename}": ${err.message}`));
            }
            try {
                const trimmed = raw.trim();
                resolve(trimmed ? JSON.parse(trimmed) : []);
            } catch (parseErr) {
                reject(new Error(`JSON parse failed for "${filename}": ${parseErr.message}`));
            }
        });
    });
};

/**
 * Writes an array to a JSON data file (pretty-printed, atomic via temp file).
 *
 * @param {string} filename  e.g. 'orders.json'
 * @param {Array}  data
 * @returns {Promise<void>}
 */
exports.writeData = (filename, data) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DATA_DIR, filename);
        const tempPath = filePath + '.tmp';
        const json     = JSON.stringify(data, null, 2);

        // Write to a temp file first, then rename — avoids corrupt files on crash
        fs.writeFile(tempPath, json, 'utf8', (writeErr) => {
            if (writeErr) {
                return reject(new Error(`writeData temp failed for "${filename}": ${writeErr.message}`));
            }
            fs.rename(tempPath, filePath, (renameErr) => {
                if (renameErr) {
                    return reject(new Error(`writeData rename failed for "${filename}": ${renameErr.message}`));
                }
                resolve();
            });
        });
    });
};

/**
 * Ensures the /data/ directory exists. Call once at startup if needed.
 */
exports.ensureDataDir = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log(`📁  Created data directory: ${DATA_DIR}`);
    }
};