const cron = require('node-cron');
const { getAllUsers, saveUser } = require('./db');
const { drawCards } = require('./tarot');
const { generateOpenAIPrediction } = require('./bot');

function scheduleDaily(bot) {
    cron.schedule('0 9 * * *', async () => {
        const users = getAllUsers();
        const today = new Date().toISOString().slice(0, 10);

        for (const [userId, user] of Object.entries(users)) {
            if (user.lastDailyReadingDate === today) continue;

            const cards = drawCards(3);
            const question = "Что меня ждёт сегодня?";

            let prediction;
            try {
                prediction = await generateOpenAIPrediction({
                    cards,
                    question,
                    birthdate: user.birthdate,
                });
            } catch {
                prediction = `Твои карты на сегодня: ${cards.map(c => c.name).join(', ')}`;
            }

            try {
                await bot.telegram.sendMessage(userId, `☀️ Утренний расклад на день:\n\n${prediction}`);
                await saveUser(userId, { lastDailyReadingDate: today });
            } catch (err) {
                console.error(`Ошибка отправки утреннего расклада пользователю ${userId}:`, err);
            }
        }
    }, { timezone: 'Europe/London' });
}

module.exports = { scheduleDaily };
