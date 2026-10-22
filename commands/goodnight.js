const fetch = require('node-fetch');

async function goodnightCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/lovenight?apikey=${shizokeys}`);
        if (!res.ok) throw await res.text();
        const json = await res.json();
        await sock.sendMessage(chatId, { text: `🌙 *GOODNIGHT*\n\n${json.result}\n\n© COOLGUY MD V10` }, { quoted: message });
    } catch (error) {
        console.error('Error in goodnight command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get goodnight. Try again later!' }, { quoted: message });
    }
}

module.exports = { goodnightCommand };
