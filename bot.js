const { Telegraf, Markup } = require('telegraf');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const schedule = require('node-schedule');

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
const { generatePrediction, setBot, alertAdmin } = require('./ai/index');

// =====================
// ENV
// =====================
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');

const CHANNEL_ID = process.env.CHANNEL_ID; // для ежедневного поста в канал

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
async function sendCardsMediaGroup(ctxOrChatId, cards) {
    const media = cards.map(c => ({ type: 'photo', media: c.image }));
    await bot.telegram.sendMediaGroup(ctxOrChatId, media);
}

// Экранируем спецсимволы для MarkdownV2
function escapeMarkdownV2(text) {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// Форматируем текст с картами и общим предсказанием
function formatCardsText(cards, generalPrediction, question) {
    const rawText =
        `✨ Ты спросила: ${question}

${cards.map(c => `🃏 ${c.name} — ${c.meaning}`).join('\n')}

🔮 ${generalPrediction}

Ответ уже внутри тебя.`;

    return escapeMarkdownV2(rawText);
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

        await ctx.reply('🔮 Перемешиваю колоду...');

        // 1️⃣ Отправляем медиагруппу без caption
        await sendCardsMediaGroup(ctx.chat.id, cards);

        // 2️⃣ Генерируем общее предсказание через AI
        let generalPrediction = '✨ Сегодня день будет особенным.';
        try {
            const aiResult = await generatePrediction(
                { cards, question, birthdate },
                { type: 'question', userId }
            );
            if (typeof aiResult === 'string') generalPrediction = aiResult;
        } catch (err) {
            console.error('AI prediction failed:', err.message);
            await alertAdmin(`AI prediction failed for user ${userId}: ${err.message}`);
        }

        // 3️⃣ Формируем текст с толкованием карт + общее предсказание
        const textMessage = formatCardsText(cards, generalPrediction, question);
        await ctx.reply(textMessage, { parse_mode: 'MarkdownV2' });

        delete sessions[userId];
        return;
    }

    return ctx.reply('Напиши /start, чтобы начать заново.');
});

// =====================
// ЕЖЕДНЕВНЫЙ РАСКЛАД В КАНАЛ
// =====================
async function sendDailyPrediction() {
    if (!CHANNEL_ID) return console.warn('CHANNEL_ID не задан');

    const cards = drawCards(3);
    let generalPrediction = '✨ Сегодня день будет особенным.';
    try {
        const aiResult = await generatePrediction(
            { cards, question: 'Общее предсказание дня', birthdate: null },
            { type: 'daily', userId: 'channel' }
        );
        if (typeof aiResult === 'string') generalPrediction = aiResult;
    } catch (err) {
        console.error('AI daily prediction failed:', err.message);
        await alertAdmin(`AI daily prediction failed: ${err.message}`);
    }

    try {
        await sendCardsMediaGroup(CHANNEL_ID, cards);
    } catch (err) {
        console.error('Failed to send daily media group:', err.message);
    }

    const text = cards
        .map(c => `🃏 *${escapeMarkdownV2(c.name)}* — ${escapeMarkdownV2(c.meaning)}`)
        .join('\n');
    const message = `✨ Общее предсказание дня:\n\n${text}\n\n🔮 ${escapeMarkdownV2(generalPrediction)}\n\n_Ответ уже внутри тебя._`;

    try {
        await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error('Failed to send daily text message:', err.message);
    }
}

// Планируем отправку каждый день в 9:00 утра
schedule.scheduleJob('0 9 * * *', () => {
    console.log('🔔 Отправка ежедневного расклада в канал');
    sendDailyPrediction();
});

// =====================
// LAUNCH
// =====================
bot.launch()
    .then(() => console.log('🤖 Bot started'))
    .catch(err => console.error('Bot launch failed:', err));

scheduleDaily(bot); // оставляем, если нужны ежедневные личные уведомления

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
