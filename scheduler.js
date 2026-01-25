const cron = require('node-cron');
const { getAllUsers, saveUser } = require('./db');
const { drawCards } = require('./tarot');
const { generatePrediction } = require('./ai');

function scheduleDaily(bot) {
    cron.schedule(
        '0 9 * * *',
        async () => {
            const users = getAllUsers();
            const today = new Date().toISOString().slice(0, 10);

            for (const [userId, user] of Object.entries(users)) {
                if (user.lastDailyReadingDate === today) continue;
                if (!user.birthdate) continue;

                const cards = drawCards(3);

                const prediction = await generatePrediction(
                    {
                        cards,
                        question: 'Что меня ждёт сегодня?',
                        birthdate: user.birthdate,
                    },
                    { type: 'daily', userId }
                );

                try {
                    await bot.telegram.sendMessage(
                        userId,
                        `☀️ Утренний расклад на день:\n\n${prediction}`
                    );

                    await saveUser(userId, { lastDailyReadingDate: today });
                } catch (e) {
                    console.error(`Daily send failed for ${userId}:`, e.message);
                }
            }
        },
        { timezone: 'Europe/London' }
    );
}

module.exports = { scheduleDaily };
