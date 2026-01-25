const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generate({ cards, question, birthdate }) {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

    // Формируем текстовый prompt
    const cardsText = cards.map(c => `${c.name}: ${c.meaning}`).join('; ');
    const prompt = `Ты таролог. Пользователь задает вопрос: "${question}". Дата рождения: ${birthdate}. Карты: ${cardsText}. Составь короткое, ясное предсказание на основе этих карт.`;

    const response = await fetch('https://api.gemini.com/v1/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GEMINI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            max_tokens: 200,
        }),
    });

    const data = await response.json();

    // В зависимости от ответа Gemini
    if (!data || !data.text) {
        throw new Error('Invalid response from Gemini');
    }

    return data.text.trim();
}

module.exports = { generate };
