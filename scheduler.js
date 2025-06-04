const cron = require('node-cron');
const { drawCards } = require('./tarot');
const { dailyMessage } = require('./messages');
const { getUser } = require('./db');

//TODO добавить ограничение одного запроса в день
function scheduleDaily(bot) {
    cron.schedule('0 9 * * *', async () => {
        const users = Object.entries(require('./db.json').users);
        for (const [id, user] of users) {
            const cards = drawCards(1);
            await bot.telegram.sendMessage(id, dailyMessage(cards), { parse_mode: 'Markdown' });
        }
    });
}

module.exports = { scheduleDaily };