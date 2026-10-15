const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_BOT_TOKEN } = require('./config/token');
const TEXTS = require('./constants/texts');
const handleLanguageSelection = require('./handlers/language');
const handleRegionSelection = require('./handlers/region');
const handleCitySearch = require('./handlers/city');
const { getLanguageKeyboard } = require('./utils/keyboards');
const { userLanguages, userStates } = require('./utils/state');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 100,
        autoStart: true,
        params: { timeout: 5 }
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        userLanguages.delete(chatId);
        userStates.delete(chatId);
        return bot.sendMessage(chatId, '🌐 *Выберите язык / Абярыце мову:*', {
            parse_mode: 'Markdown',
            ...getLanguageKeyboard()
        });
    }

    if (!userLanguages.has(chatId)) {
        return handleLanguageSelection(msg, bot, userLanguages, userStates);
    }

    const lang = userLanguages.get(chatId);

    if (text === TEXTS[lang].changeLang) {
        userLanguages.delete(chatId);
        userStates.delete(chatId);
        return bot.sendMessage(chatId, '🌐 *Выберите язык / Абярыце мову:*', {
            parse_mode: 'Markdown',
            ...getLanguageKeyboard()
        });
    }

    if (userStates.get(chatId) === 'awaiting_region') {
        const handled = await handleRegionSelection(msg, bot, userLanguages, userStates);
        if (handled) return;
    }

    if (text?.length > 1) {
        await handleCitySearch(chatId, text, lang, bot);
    }
});

console.log('🚀 Навигатор по Беларуси запущен!');
console.log('👥 Разработчики: Соловьёв Никита (@ruzhikus) и Кураш Константин (@confuseduser11111)');