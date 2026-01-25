const gemini = require('./gemini');
const openai = require('./openai');
const fallback = require('./fallback'); // твой старый генератор по умолчанию
const logger = require('../logger');

let botInstance = null;

// =====================
// Привязка бота для алертов
// =====================
function setBot(bot) {
    botInstance = bot;
}

// =====================
// Отправка алерта администратору
// =====================
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

// =====================
// Генерация предсказания
// =====================
async function generatePrediction(data, meta = {}) {
    // Попробуем Gemini
    try {
        const res = await gemini.generate(data);
        logger.info(`AI=gemini | type=${meta.type}`);
        return res;
    } catch (e) {
        logger.warn(`Gemini failed: ${e.message}`);
        await alertAdmin(
            `Gemini failed\nType: ${meta.type}\nUser: ${meta.userId}\n${e.message}`
        );
    }

    // Попробуем OpenAI
    try {
        const res = await openai.generate(data);
        logger.info(`AI=openai | type=${meta.type}`);
        return res;
    } catch (e) {
        logger.warn(`OpenAI failed: ${e.message}`);
        await alertAdmin(
            `OpenAI failed\nType: ${meta.type}\nUser: ${meta.userId}\n${e.message}`
        );
    }

    // Если оба ИИ упали, используем fallback
    logger.warn(`AI=fallback | type=${meta.type}`);
    await alertAdmin(
        `Fallback used\nType: ${meta.type}\nUser: ${meta.userId}`
    );

    return fallback.generate(data);
}

module.exports = {
    setBot,
    generatePrediction,
};
