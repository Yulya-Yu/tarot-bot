const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.json');

let users = {};

// Загружаем при старте
try {
    if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH);
        users = JSON.parse(raw);
    }
} catch (e) {
    console.error('Ошибка загрузки базы данных:', e);
}

// Сохраняем в файл
function saveDB() {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function getUser(userId) {
    return users[userId];
}

function getAllUsers() {
    return users;
}

async function saveUser(userId, data) {
    users[userId] = {
        ...users[userId],
        ...data,
    };
    saveDB();
}

module.exports = {
    getUser,
    saveUser,
    getAllUsers,
};
