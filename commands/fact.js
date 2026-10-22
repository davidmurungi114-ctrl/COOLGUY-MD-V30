const axios = require('axios');

module.exports = async function (sock, chatId, message) {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = response.data.text;
        await sock.sendMessage(chatId, { text: `🧠 *RANDOM FACT*\n\n${fact}\n\n© COOLGUY MD V10` },{ quoted: message });
    } catch (error) {
        console.error('Error fetching fact:', error);
        await sock.sendMessage(chatId, { text: '❌ Sorry, I could not fetch a fact right now.' },{ quoted: message });
    }
};
