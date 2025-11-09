const { OpenAI } = require('openai');
const { generateMysticPrediction } = require('./ai');

if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Не найден OPENAI_API_KEY");
    process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Генерация предсказания через OpenAI GPT
 * @param {Array} cards - массив карт
 * @param {string} question - вопрос пользователя
 * @param {string} birthdate - дата рождения пользователя
 */
async function generateOpenAIPrediction({ cards, question, birthdate }) {
    const prompt = `
Ты — мистический таролог. Создай вдохновляющее, позитивное, мистическое предсказание для пользователя.
Дата рождения: ${birthdate}
Вопрос пользователя: ${question}
Карты:
${cards.map(c => `${c.name} — ${c.meaning}`).join('\n')}
`;

    try {
        const response = await client.responses.create({
            model: 'gpt-4o-mini',
            input: prompt,
            max_output_tokens: 300
        });

        // Вытаскиваем текст из ответа
        return response.output[0].content[0].text.trim();
    } catch (err) {
        console.error("OpenAI error:", err);
        // fallback на локальный генератор
        return generateMysticPrediction({ cards, question, birthdate });
    }
}

module.exports = { generateOpenAIPrediction };
