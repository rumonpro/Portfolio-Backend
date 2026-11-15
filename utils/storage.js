const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const getFilePath = (collection) => path.join(dataDir, `${collection}.json`);

const readData = (collection) => {
    const file = getFilePath(collection);
    if (!fs.existsSync(file)) return [];
    try {
        const content = fs.readFileSync(file, 'utf-8');
        return JSON.parse(content || '[]');
    } catch (err) {
        console.error(`Error reading ${collection}.json:`, err.message);
        return [];
    }
};

const writeData = (collection, data) => {
    const file = getFilePath(collection);
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error(`Error writing ${collection}.json:`, err.message);
    }
};

const isDbConnected = () => {
    return mongoose.connection && mongoose.connection.readyState === 1;
};

module.exports = {
    isDbConnected,
    readData,
    writeData
};
