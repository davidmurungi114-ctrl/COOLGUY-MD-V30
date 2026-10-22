const fetch = require('node-fetch');

async function memeCommand(sock, chatId, message) {
    try {
        const response = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            
            await sock.sendMessage(chatId, { 
                image: imageBuffer,
                caption: "> Here's your cheems meme! 🐕\n> © COOLGUY MD V10"
            },{ quoted: message});
        } else {
            throw new Error('Invalid response type from API');
        }
    } catch (error) {
        console.error('Error in meme command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch meme. Please try again later.'
        },{ quoted: message });
    }
}

module.exports = memeCommand;
