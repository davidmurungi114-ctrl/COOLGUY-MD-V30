const fetch = require('node-fetch');

async function shayariCommand(sock, chatId, message) {
    try {
        const response = await fetch('https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo');
        const data = await response.json();
        
        if (!data || !data.result) {
            throw new Error('Invalid response from API');
        }

        await sock.sendMessage(chatId, { 
            text: `✨ *COOLGUY SHAYARI*\n\n${data.result}\n\n> © COOLGUY MD V10\n\n_Use .shayari for more | .roseday for Rose Day_`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in shayari command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch shayari. Try later!\n> © COOLGUY MD V10',
        }, { quoted: message });
    }
}

module.exports = { shayariCommand };
