const cron = require('node-cron');
const { getAllUsers, saveUser } = require('./db');
const { drawCards } = require('./tarot');
const { generateOpenAIPrediction, generateFallbackPrediction } = require('./bot'); // Импортируем функции ИИ из bot.js

function scheduleDaily(bot) {
    cron.schedule('0 9 * * *', async () => {
        const users = getAllUsers();
        const today = new Date().toISOString().split('T')[0];

        for (const [userId, user] of Object.entries(users)) {
            if (user.lastDailyReadingDate === today) continue;

            const cards = drawCards(3);
            const question = 'Что меня ждёт сегодня?';

            let prediction;
            try {
                prediction = await generateOpenAIPrediction({
                    cards,
                    question,
                    birthdate: user.birthdate,
                });
            } catch {
                prediction = generateFallbackPrediction({
                    cards,
                    question,
                    birthdate: user.birthdate,
                });
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
