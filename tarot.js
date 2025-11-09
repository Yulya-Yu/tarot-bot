const path = require('path');

// -----------------------
// Большой Аркан
// -----------------------
const MAJOR_ARCANA = [
    { name: "The Fool", meaning: "Новые начала, спонтанность, свобода.", image: path.join(__dirname, 'images/MW_The_Fool.jpg') },
    { name: "The Magician", meaning: "Мастерство, концентрация, сила воли.", image: path.join(__dirname, 'images/MW_The_Magician.jpg') },
    { name: "The High Priestess", meaning: "Интуиция, тайны, подсознание.", image: path.join(__dirname, 'images/MW_The_High_Priestess.jpg') },
    { name: "The Empress", meaning: "Изобилие, творчество, материнство.", image: path.join(__dirname, 'images/MW_The_Empress.jpg') },
    { name: "The Emperor", meaning: "Структура, власть, стабильность.", image: path.join(__dirname, 'images/MW_The_Emperor.jpg') },
    { name: "The Hierophant", meaning: "Традиции, наставничество, духовность.", image: path.join(__dirname, 'images/MW_The_Hierophant.jpg') },
    { name: "The Lovers", meaning: "Выбор, гармония, партнерство.", image: path.join(__dirname, 'images/MW_The_Lovers.jpg') },
    { name: "The Chariot", meaning: "Победа, движение, решимость.", image: path.join(__dirname, 'images/MW_The_Chariot.jpg') },
    { name: "Strength", meaning: "Мужество, терпение, контроль.", image: path.join(__dirname, 'images/MW_Strength.jpg') },
    { name: "The Hermit", meaning: "Размышление, поиск истины, одиночество.", image: path.join(__dirname, 'images/MW_The_Hermit.jpg') },
    { name: "Wheel of Fortune", meaning: "Перемены, судьба, циклы.", image: path.join(__dirname, 'images/MW_Wheel_of_Fortune.jpg') },
    { name: "Justice", meaning: "Справедливость, равновесие, решения.", image: path.join(__dirname, 'images/MW_Justice.jpg') },
    { name: "The Hanged Man", meaning: "Жертва, пауза, переосмысление.", image: path.join(__dirname, 'images/MW_The_Hanged_Man.jpg') },
    { name: "Death", meaning: "Конец цикла, трансформация, обновление.", image: path.join(__dirname, 'images/MW_Death.jpg') },
    { name: "Temperance", meaning: "Баланс, гармония, умеренность.", image: path.join(__dirname, 'images/MW_Temperance.jpg') },
    { name: "The Devil", meaning: "Привязанности, ограничения, искушения.", image: path.join(__dirname, 'images/MW_The_Devil.jpg') },
    { name: "The Tower", meaning: "Резкие перемены, разрушение, озарение.", image: path.join(__dirname, 'images/MW_The_Tower.jpg') },
    { name: "The Star", meaning: "Надежда, вдохновение, исцеление.", image: path.join(__dirname, 'images/MW_The_Star.jpg') },
    { name: "The Moon", meaning: "Иллюзии, интуиция, скрытое.", image: path.join(__dirname, 'images/MW_The_Moon.jpg') },
    { name: "The Sun", meaning: "Радость, успех, энергия.", image: path.join(__dirname, 'images/MW_The_Sun.jpg') },
    { name: "Judgement", meaning: "Прозрение, возрождение, решение.", image: path.join(__dirname, 'images/MW_Judgement.jpg') },
    { name: "The World", meaning: "Завершение, целостность, успех.", image: path.join(__dirname, 'images/MW_The_World.jpg') },
];

// -----------------------
// Малый Аркан — Wands
// -----------------------
const WANDS_CARDS = [
    { name: "Ace of Wands", meaning: "Начало действия, вдохновение, энергия.", image: path.join(__dirname, 'images/MW_Ace_of_Wands.jpg') },
    { name: "Two of Wands", meaning: "Планирование, выбор направления, перспектива.", image: path.join(__dirname, 'images/MW_Two_of_Wands.jpg') },
    { name: "Three of Wands", meaning: "Расширение, ожидание результатов, рост.", image: path.join(__dirname, 'images/MW_Three_of_Wands.jpg') },
    { name: "Four of Wands", meaning: "Стабильность, праздник, домашний уют.", image: path.join(__dirname, 'images/MW_Four_of_Wands.jpg') },
    { name: "Five of Wands", meaning: "Конфликты, соревнование, напряжение.", image: path.join(__dirname, 'images/MW_Five_of_Wands.jpg') },
    { name: "Six of Wands", meaning: "Признание, победа, успех.", image: path.join(__dirname, 'images/MW_Six_of_Wands.jpg') },
    { name: "Seven of Wands", meaning: "Защита, стойкость, вызовы.", image: path.join(__dirname, 'images/MW_Seven_of_Wands.jpg') },
    { name: "Eight of Wands", meaning: "Движение, скорость, прогресс.", image: path.join(__dirname, 'images/MW_Eight_of_Wands.jpg') },
    { name: "Nine of Wands", meaning: "Упорство, настойчивость, готовность к трудностям.", image: path.join(__dirname, 'images/MW_Nine_of_Wands.jpg') },
    { name: "Ten of Wands", meaning: "Тяжесть, ответственность, нагрузка.", image: path.join(__dirname, 'images/MW_Ten_of_Wands.jpg') },
    { name: "Page of Wands", meaning: "Любопытство, исследование, новые идеи.", image: path.join(__dirname, 'images/MW_Page_of_Wands.jpg') },
    { name: "Knight of Wands", meaning: "Страсть, энергия, приключение.", image: path.join(__dirname, 'images/MW_Knight_of_Wands.jpg') },
    { name: "Queen of Wands", meaning: "Самоуверенность, харизма, лидерство.", image: path.join(__dirname, 'images/MW_Queen_of_Wands.jpg') },
    { name: "King of Wands", meaning: "Вдохновение, управление, дальновидность.", image: path.join(__dirname, 'images/MW_King_of_Wands.jpg') },
];

// -----------------------
// Малый Аркан — Cups
// -----------------------
const CUPS_CARDS = [
    { name: "Ace of Cups", meaning: "Начало эмоций, открытое сердце, интуиция.", image: path.join(__dirname, 'images/MW_Ace_of_Cups.jpg') },
    { name: "Two of Cups", meaning: "Партнёрство, гармония, взаимность.", image: path.join(__dirname, 'images/MW_Two_of_Cups.jpg') },
    { name: "Three of Cups", meaning: "Праздник, дружба, радость.", image: path.join(__dirname, 'images/MW_Three_of_Cups.jpg') },
    { name: "Four of Cups", meaning: "Размышления, апатия, переоценка.", image: path.join(__dirname, 'images/MW_Four_of_Cups.jpg') },
    { name: "Five of Cups", meaning: "Разочарование, сожаление, утрата.", image: path.join(__dirname, 'images/MW_Five_of_Cups.jpg') },
    { name: "Six of Cups", meaning: "Ностальгия, воспоминания, детство.", image: path.join(__dirname, 'images/MW_Six_of_Cups.jpg') },
    { name: "Seven of Cups", meaning: "Варианты, иллюзии, выбор.", image: path.join(__dirname, 'images/MW_Seven_of_Cups.jpg') },
    { name: "Eight of Cups", meaning: "Покидание, поиск истины, путь внутрь.", image: path.join(__dirname, 'images/MW_Eight_of_Cups.jpg') },
    { name: "Nine of Cups", meaning: "Исполнение желаний, удовлетворение.", image: path.join(__dirname, 'images/MW_Nine_of_Cups.jpg') },
    { name: "Ten of Cups", meaning: "Семейное счастье, гармония, завершение.", image: path.join(__dirname, 'images/MW_Ten_of_Cups.jpg') },
    { name: "Page of Cups", meaning: "Любопытство, эмоциональные новости, начало отношений.", image: path.join(__dirname, 'images/MW_Page_of_Cups.jpg') },
    { name: "Knight of Cups", meaning: "Романтика, предложение, движение чувств.", image: path.join(__dirname, 'images/MW_Knight_of_Cups.jpg') },
    { name: "Queen of Cups", meaning: "Эмоциональная зрелость, забота, интуиция.", image: path.join(__dirname, 'images/MW_Queen_of_Cups.jpg') },
    { name: "King of Cups", meaning: "Эмоциональная стабильность, мудрость, поддержка.", image: path.join(__dirname, 'images/MW_King_of_Cups.jpg') },
];

// -----------------------
// Малый Аркан — Swords
// -----------------------
const SWORDS_CARDS = [
    { name: "Ace of Swords", meaning: "Новая идея, ясность, решимость.", image: path.join(__dirname, 'images/MW_Ace_of_Swords.jpg') },
    { name: "Two of Swords", meaning: "Выбор, дилемма, компромисс.", image: path.join(__dirname, 'images/MW_Two_of_Swords.jpg') },
    { name: "Three of Swords", meaning: "Боль, разочарование, разрыв.", image: path.join(__dirname, 'images/MW_Three_of_Swords.jpg') },
    { name: "Four of Swords", meaning: "Отдых, восстановление, пауза.", image: path.join(__dirname, 'images/MW_Four_of_Swords.jpg') },
    { name: "Five of Swords", meaning: "Конфликты, проигрыш, напряжение.", image: path.join(__dirname, 'images/MW_Five_of_Swords.jpg') },
    { name: "Six of Swords", meaning: "Переход, путешествие, отпускание.", image: path.join(__dirname, 'images/MW_Six_of_Swords.jpg') },
    { name: "Seven of Swords", meaning: "Хитрость, стратегия, обход правил.", image: path.join(__dirname, 'images/MW_Seven_of_Swords.jpg') },
    { name: "Eight of Swords", meaning: "Ограничения, страхи, блоки.", image: path.join(__dirname, 'images/MW_Eight_of_Swords.jpg') },
    { name: "Nine of Swords", meaning: "Беспокойство, ночные тревоги, сомнения.", image: path.join(__dirname, 'images/MW_Nine_of_Swords.jpg') },
    { name: "Ten of Swords", meaning: "Конец, поражение, освобождение.", image: path.join(__dirname, 'images/MW_Ten_of_Swords.jpg') },
    { name: "Page of Swords", meaning: "Любопытство, обучение, наблюдение.", image: path.join(__dirname, 'images/MW_Page_of_Swords.jpg') },
    { name: "Knight of Swords", meaning: "Быстрое действие, смелость, энергия.", image: path.join(__dirname, 'images/MW_Knight_of_Swords.jpg') },
    { name: "Queen of Swords", meaning: "Чёткость, честность, независимость.", image: path.join(__dirname, 'images/MW_Queen_of_Swords.jpg') },
    { name: "King of Swords", meaning: "Интеллект, аналитика, власть.", image: path.join(__dirname, 'images/MW_King_of_Swords.jpg') },
];

// -----------------------
// Малый Аркан — Pentacles
// -----------------------
const PENTACLES_CARDS = [
    { name: "Ace of Pentacles", meaning: "Новая возможность, изобилие, материальный старт.", image: path.join(__dirname, 'images/MW_Ace_of_Pentacles.jpg') },
    { name: "Two of Pentacles", meaning: "Баланс, адаптация, двойственная нагрузка.", image: path.join(__dirname, 'images/MW_Two_of_Pentacles.jpg') },
    { name: "Three of Pentacles", meaning: "Сотрудничество, мастерство, признание.", image: path.join(__dirname, 'images/MW_Three_of_Pentacles.jpg') },
    { name: "Four of Pentacles", meaning: "Контроль, удержание, страх потери.", image: path.join(__dirname, 'images/MW_Four_of_Pentacles.jpg') },
    { name: "Five of Pentacles", meaning: "Материальные трудности, чувство лишения.", image: path.join(__dirname, 'images/MW_Five_of_Pentacles.jpg') },
    { name: "Six of Pentacles", meaning: "Щедрость, помощь, баланс дачи и получения.", image: path.join(__dirname, 'images/MW_Six_of_Pentacles.jpg') },
    { name: "Seven of Pentacles", meaning: "Оценка прогресса, терпение, долгосрочные планы.", image: path.join(__dirname, 'images/MW_Seven_of_Pentacles.jpg') },
    { name: "Eight of Pentacles", meaning: "Практика, обучение, совершенствование мастерства.", image: path.join(__dirname, 'images/MW_Eight_of_Pentacles.jpg') },
    { name: "Nine of Pentacles", meaning: "Самодостаточность, успех, комфорт.", image: path.join(__dirname, 'images/MW_Nine_of_Pentacles.jpg') },
    { name: "Ten of Pentacles", meaning: "Благополучие, семейное наследие, стабильность.", image: path.join(__dirname, 'images/MW_Ten_of_Pentacles.jpg') },
    { name: "Page of Pentacles", meaning: "Новое обучение, планы, проявление идей.", image: path.join(__dirname, 'images/MW_Page_of_Pentacles.jpg') },
    { name: "Knight of Pentacles", meaning: "Терпение, надежность, методичное движение.", image: path.join(__dirname, 'images/MW_Knight_of_Pentacles.jpg') },
    { name: "Queen of Pentacles", meaning: "Практичность, забота, материальная стабильность.", image: path.join(__dirname, 'images/MW_Queen_of_Pentacles.jpg') },
    { name: "King of Pentacles", meaning: "Процветание, успех, мудрое управление ресурсами.", image: path.join(__dirname, 'images/MW_King_of_Pentacles.jpg') },
];

// -----------------------
// Общий массив всех карт
// -----------------------
const TAROT_CARDS = [
    ...MAJOR_ARCANA,
    ...WANDS_CARDS,
    ...CUPS_CARDS,
    ...SWORDS_CARDS,
    ...PENTACLES_CARDS,
];

// Функция выбора случайных карт без повторов
function drawCards(count = 3) {
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

module.exports = {
    TAROT_CARDS,
    drawCards
};
