function interpretCard(card, question) {
    return `🔮 *${card.name}* — ${card.meaning}\n` +
        `_Это карта откликается на твой вопрос "${question}" как напоминание:_ ` +
        `*верь в себя и доверься вселенной*.`;
}

function dailyMessage(cards) {
    return "☀️ *Твой утренний расклад:*\n\n" + cards.map(c =>
        `🔹 *${c.name}* — ${c.meaning}`
    ).join("\n\n") + `\n\n_Пусть этот день наполнится светом и заботой._`;
}

module.exports = { interpretCard, dailyMessage };