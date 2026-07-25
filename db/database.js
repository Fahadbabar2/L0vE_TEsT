// Simple persistent storage using a JSON file on disk.
// Chosen instead of better-sqlite3 to avoid native compilation (node-gyp / Visual
// Studio Build Tools) issues on Windows, Mac, and Linux alike. Every session is
// still saved permanently to disk in db/sessions.json and survives server restarts.

const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "sessions.json");

function ensureFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2), "utf-8");
  }
}

function readAll() {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw || "{}");
  } catch (err) {
    return {};
  }
}

function writeAll(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getSession(id) {
  const all = readAll();
  return all[id] || null;
}

function saveSession(session) {
  const all = readAll();
  all[session.id] = session;
  writeAll(all);
  return session;
}

module.exports = { getSession, saveSession };
