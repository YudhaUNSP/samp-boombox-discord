// utils/storage.js
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'storage.json');

/**
 * Memuat data userFiles dari storage.json
 * @returns {Map<string, Array<any>>}
 */
function loadData() {
  if (!fs.existsSync(dataFilePath)) {
    return new Map();
  }
  const raw = fs.readFileSync(dataFilePath, 'utf-8');
  if (!raw) return new Map();

  const jsonObj = JSON.parse(raw); 
  // jsonObj = { "userId": [ {...}, {...} ], ... }
  // Convert object -> Map
  return new Map(Object.entries(jsonObj));
}

/**
 * Menyimpan data userFiles ke storage.json
 * TIDAK menyimpan properti "timeoutId" karena itu menyebabkan circular reference.
 * Kita juga buat replacer agar jika ada "timeoutId", dihapus.
 * @param {Map<string, Array<any>>} userFiles
 */
function saveData(userFiles) {
  const obj = Object.fromEntries(userFiles); // Map -> Object

  // Buat replacer untuk hilangkan "timeoutId" jika ada
  const dataStr = JSON.stringify(obj, (key, value) => {
    if (key === 'timeoutId') return undefined;
    return value;
  }, 2);

  fs.writeFileSync(dataFilePath, dataStr, 'utf-8');
}

module.exports = { loadData, saveData };
