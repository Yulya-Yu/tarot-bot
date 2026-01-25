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
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');

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
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('✨ Tarot bot is alive');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});

// =====================
// HELPERS
// =====================

// Отправка медиагруппы без caption
async function sendCardsMediaGroup(ctx, cards) {
    const media = cards.map(c => ({ type: 'photo', media: c.image }));
    await ctx.telegram.sendMediaGroup(ctx.chat.id, media);
}

// Экранируем все спецсимволы для MarkdownV2
function escapeMarkdownV2(text) {
    if (!text) return '';
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// Формируем текст с толкованием карт и общим предсказанием
function formatCardsText(cards, generalPrediction, question) {
    const lines = cards
        .map(c => `🃏 *${escapeMarkdownV2(c.name)}* — ${escapeMarkdownV2(c.meaning)}`)
        .join('\n');
    return `✨ Ты спросила: *${escapeMarkdownV2(question)}*\n\n${lines}\n\n🔮 ${escapeMarkdownV2(generalPrediction)}`;
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
        if (await alreadyAskedToday(userId)) {
            return ctx.reply('🕯️ Сегодня ты уже задавал вопрос. Попробуй завтра.');
        }

        const question = text.slice(0, 200);
        const cards = drawCards(session.cardsCount || 3);
        const birthdate = user.birthdate;

        await saveUserQuestionDate(userId);

        await ctx.reply('🔮 Перемешиваю колоду...');

        // 1️⃣ Отправляем медиагруппу карт без caption
        await sendCardsMediaGroup(ctx, cards);

        // 2️⃣ Генерируем общее предсказание через AI
        let generalPrediction = '';
        try {
            generalPrediction = await generatePrediction(
                { cards, question, birthdate },
                { type: 'question', userId }
            );
        } catch (e) {
            generalPrediction = '✨ Сегодня день будет обычным, без особых предзнаменований.';
        }

        // 3️⃣ Формируем текст с толкованием карт + общее предсказание
        const textMessage = formatCardsText(cards, generalPrediction, question);

        // 4️⃣ Отправляем одно безопасное сообщение MarkdownV2
        await ctx.replyWithMarkdownV2(textMessage);

        delete sessions[userId];
        return;
    }

    return ctx.reply('Напиши /start, чтобы начать заново.');
});

// =====================
// LAUNCH
// =====================
bot.launch();
scheduleDaily(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
