const { Low, JSONFile } = require('lowdb');
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

async function initDB() {
    await db.read();
    db.data ||= { users: {} };
    await db.write();
}

async function saveUser(id, data) {
    db.data.users[id] = { ...(db.data.users[id] || {}), ...data };
    await db.write();
}

function getUser(id) {
    return db.data.users[id];
}

module.exports = { initDB, saveUser, getUser };