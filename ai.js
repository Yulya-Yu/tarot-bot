function generateMysticPrediction({ cards, question, birthdate }) {
    const affirmations = [
        "Ты заслуживаешь покоя и ясности.",
        "Сегодня твоя душа раскроется навстречу свету.",
        "Будущее открыто перед тобой — просто сделай шаг.",
        "Ты сильнее, чем кажешься, и мудрее, чем думаешь.",
    ];

    const intro = `✨ Твоя душа задала вопрос: *${question}*.\nКарты выбраны с учётом твоего пути.\n`;
    const cardLines = cards.map(card => `🃏 *${card.name}*: ${card.meaning}`).join('\n');
    const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

    return `${intro}\n${cardLines}\n\n🔮 _${affirmation}_`;
}

module.exports = { generateMysticPrediction };
