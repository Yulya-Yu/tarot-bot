const gemini = require('./gemini');
const openai = require('./openai');
const fallback = require('./fallback');
const logger = require('../logger');

let botInstance = null;

function setBot(bot) {
    botInstance = bot;
}

async function alertAdmin(text) {
    if (!botInstance || !process.env.ADMIN_TELEGRAM_ID) return;
    try {
        await botInstance.telegram.sendMessage(
            process.env.ADMIN_TELEGRAM_ID,
            `⚠️ Tarot Bot Alert\n\n${text}`
        );
    } catch (e) {
        console.error('Failed to send admin alert:', e.message);
    }
}

/**
 * Генерация общего предсказания для нескольких карт
 * @param {Object} data - { cards, question, birthdate }
 * @param {Object} meta - { type, userId }
 * @returns {string} - текст предсказания
 */
async function generatePrediction(data, meta = {}) {
    const { cards, question, birthdate } = data;

    // Формируем текст для ИИ, чтобы он дал одно общее предсказание
    const cardsDescription = cards
        .map(c => `Карта: ${c.name} — ${c.meaning}`)
        .join('\n');

    const prompt = `
Ты — мистический таро-консультант.
Составь **один связный, вдохновляющий и позитивный прогноз** для пользователя.
У пользователя дата рождения: ${birthdate}
Вопрос: ${question}
Карты:
${cardsDescription}

Ответ должен быть в одном блоке текста, включать общую интерпретацию всех карт, 
коротко упоминать их значения, и завершаться позитивной аффирмацией.
`;

    // Попытка 1 — Gemini
    try {
        const res = await gemini.generate({ prompt });
        logger.info(`AI=gemini | type=${meta.type}`);
        return res;
    } catch (e) {
        logger.warn(`Gemini failed: ${e.message}`);
        await alertAdmin(
            `Gemini failed\nType: ${meta.type}\nUser: ${meta.userId}\n${e.message}`
        );
    }

    // Попытка 2 — OpenAI
    try {
        const res = await openai.generate({ prompt });
        logger.info(`AI=openai | type=${meta.type}`);
        return res;
    } catch (e) {
        logger.warn(`OpenAI failed: ${e.message}`);
        await alertAdmin(
            `OpenAI failed\nType: ${meta.type}\nUser: ${meta.userId}\n${e.message}`
        );
    }

    // Попытка 3 — fallback
    logger.warn(`AI=fallback | type=${meta.type}`);
    await alertAdmin(
        `Fallback used\nType: ${meta.type}\nUser: ${meta.userId}`
    );
    return fallback.generate(data);
}

module.exports = {
    generatePrediction,
    setBot,
};
