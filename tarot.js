const tarotDeck = [
    { name: "Шут", meaning: "Начало пути, энергия обновления, открытие новой главы жизни." },
    { name: "Маг", meaning: "Сила воли и потенциал, который стоит использовать во благо." },
    { name: "Императрица", meaning: "Плодородие, забота о себе, раскрытие внутренней гармонии." },
    // Добавь больше карт…
];

function drawCards(count) {
    const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

module.exports = { drawCards };