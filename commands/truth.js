const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
        if (!res.ok) throw await res.text();
        const json = await res.json();
        const truthMessage = json.result;

        await sock.sendMessage(chatId, { text: `🎯 *TRUTH - COOLGUY MD V10*\n\n${truthMessage}\n\n> © COOLGUY MD V10` }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Failed to get truth!\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = { truthCommand };
