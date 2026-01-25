const { Telegraf, Markup } = require('telegraf');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

// =====================
// IMPORTS
// =====================
const { drawCards } = require('./tarot');
const {
    getUser,
    saveUser,
    alreadyAskedToday,
    saveUserQuestionDate,
} = require('./db');
const { scheduleDaily } = require('./scheduler');
const { generatePrediction, setBot } = require('./ai/index');

// =====================
// ENV
// =====================
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_PATH = `/bot${BOT_TOKEN}`;
const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL; // URL приложения на Render
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');
if (!APP_URL) throw new Error('APP_URL is required for webhook mode');

// =====================
// BOT INIT
// =====================
const bot = new Telegraf(BOT_TOKEN);
setBot(bot);

const sessions = {};

// =====================
// EXPRESS SERVER (ДЛЯ RENDER)
// =====================
const app = express();

app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.send('✨ Tarot bot is alive');
});

// Telegram webhook
app.use(bot.webhookCallback(WEBHOOK_PATH));

app.listen(PORT, async () => {
    console.log(`🌐 Web server running on port ${PORT}`);

    // Настройка webhook
    await bot.telegram.setWebhook(`${APP_URL}${WEBHOOK_PATH}`);
    console.log(`Webhook set to ${APP_URL}${WEBHOOK_PATH}`);
});

// =====================
// HELPERS
// =====================

// Отправка медиагруппы без caption
async function sendCardsMediaGroup(ctx, cards) {
    const media = cards.map(c => ({ type: 'photo', media: c.image }));
    await ctx.telegram.sendMediaGroup(ctx.chat.id, media);
}

// Форматируем текст: карты + общее предсказание
function formatCardsText(cards, generalPrediction, question) {
    const lines = cards
        .map(c => `🃏 ${c.name} — ${c.meaning}`)
        .join('\n');
    return `✨ Ты спросила: ${question}\n\n${lines}\n\n🔮 ${generalPrediction}`;
}

// =====================
// START COMMAND
// =====================
bot.start(async (ctx) => {
    sessions[ctx.from.id] = { step: 'birthdate' };

    await ctx.reply(
        'Привет ✨\nВведи свою дату рождения в формате ДД.ММ.ГГГГ'
    );
});

// =====================
// TEXT HANDLER
// =====================
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const user = getUser(userId) || {};
    const session = sessions[userId] || {};

    // -------- дата рождения
    if (session.step === 'birthdate') {
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
            return ctx.reply('Формат неверный. Пример: 21.03.1994');
        }

        await saveUser(userId, { birthdate: text });
        sessions[userId] = { step: 'cards' };

        return ctx.reply(
            'Выбери количество карт 🃏',
            Markup.keyboard([['1', '3', '5']]).resize().oneTime()
        );
    }

    // -------- выбор карт
    if (session.step === 'cards') {
        const count = Number(text);
        if (![1, 3, 5].includes(count)) {
            return ctx.reply('Выбери количество карт с клавиатуры.');
        }

        sessions[userId] = { step: 'question', cardsCount: count };
        return ctx.reply('Задай свой вопрос ✨');
    }

    // -------- вопрос
    if (session.step === 'question') {
        // if (await alreadyAskedToday(userId)) {
        //     return ctx.reply('🕯️ Сегодня ты уже задавал вопрос. Попробуй завтра.');
        // }

        const question = text.slice(0, 200);
        const cards = drawCards(session.cardsCount || 3);
        const birthdate = user.birthdate;

        await saveUserQuestionDate(userId);

        // 1️⃣ Отправляем медиагруппу без caption
        await sendCardsMediaGroup(ctx, cards);

        // 2️⃣ Генерируем общее предсказание через AI
        const generalPrediction = await generatePrediction(
            { cards, question, birthdate },
            { type: 'question', userId },
        );

        // 3️⃣ Формируем текст с толкованием карт + общее предсказание
        const textMessage = formatCardsText(cards, generalPrediction, question);
        await ctx.reply(textMessage);

        delete sessions[userId];
        return;
    }

    return ctx.reply('Напиши /start, чтобы начать заново.');
});

// =====================
// DAILY SCHEDULE
// =====================
scheduleDaily(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
