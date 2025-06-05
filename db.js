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
/**
 * Проверяет, задавал ли пользователь вопрос сегодня
 * @param {string|number} userId
 * @returns {Promise<boolean>}
 */
async function alreadyAskedToday(userId) {
    const user = getUser(userId);
    if (!user || !user.lastQuestionDate) return false;

    const today = new Date().toISOString().slice(0, 10);
    return user.lastQuestionDate === today;
}

/**
 * Сохраняет дату последнего вопроса пользователя как сегодня
 * @param {string|number} userId
 * @returns {Promise<void>}
 */
async function saveUserQuestionDate(userId) {
    const today = new Date().toISOString().slice(0, 10);
    await saveUser(userId, { lastQuestionDate: today });
}
module.exports = {
    getUser,
    saveUser,
    getAllUsers,
    alreadyAskedToday,
    saveUserQuestionDate,
};
