const axios = require('axios');

module.exports = async function (sock, chatId, message) {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' }
        });
        const joke = response.data.joke;
        await sock.sendMessage(chatId, { text: `😂 *COOLGUY MD V10 JOKE*\n\n${joke}\n\n> © COOLGUY TECH` }, { quoted: message });
    } catch (error) {
        console.error('Error fetching joke:', error);
        await sock.sendMessage(chatId, { text: '❌ Sorry, I could not fetch a joke right now.' }, { quoted: message });
    }
};
