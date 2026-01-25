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

// Отправка расклада в виде одной галереи и единого текста
async function sendTarotSpread(ctx, cards, question, birthdate) {
    // 1️⃣ Подготовим массив mediaGroup для галереи
    const mediaGroup = cards.map(card => ({
        type: 'photo',
        media: card.image, // URL raw.githubusercontent или локальный путь
        caption: `🃏 ${card.name}\n${card.meaning}`,
    }));

    if (mediaGroup.length > 1) {
        await ctx.telegram.sendMediaGroup(ctx.chat.id, mediaGroup);
    } else {
        await ctx.telegram.sendPhoto(ctx.chat.id, mediaGroup[0].media, { caption: mediaGroup[0].caption });
    }

    // 2️⃣ Генерация единого текста с предсказанием
    const prediction = await generatePrediction(
        { cards, question, birthdate },
        { type: 'spread', userId: ctx.from.id }
    );

    // 3️⃣ Отправка предсказания
    await ctx.reply(`✨ Твой расклад:\n\nТы спросила: *${question}*\n\n${prediction}`);
}

// =====================
// START COMMAND
// =====================
bot.start(async (ctx) => {
    sessions[ctx.from.id] = { step: 'birthdate' };
    await ctx.reply('Привет ✨\nВведи свою дату рождения в формате ДД.ММ.ГГГГ');
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

    // -------- выбор количества карт
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
        await sendTarotSpread(ctx, cards, question, birthdate);

        delete sessions[userId];
        return;
    }

    return ctx.reply('Напиши /start, чтобы начать заново.');
});

// =====================
// LAUNCH BOT
// =====================
bot.launch();
scheduleDaily(bot);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
