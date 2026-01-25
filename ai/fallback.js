function generate({ cards, question }) {
    const intro = `✨ Ты спросила: *${question}*\n\n`;
    const lines = cards
        .map(c => `🃏 *${c.name}* — ${c.meaning}`)
        .join('\n');

    return intro + lines + `\n\n_Ответ уже внутри тебя._`;
}

module.exports = { generate };
