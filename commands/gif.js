const axios = require('axios');
const settings = require('../settings');

async function gifCommand(sock, chatId, query) {
    const apiKey = settings.giphyApiKey;

    if (!query) {
        await sock.sendMessage(chatId, { text: '❌ Please provide a search term.\nExample: .gif cat funny' });
        return;
    }

    if (!apiKey) {
        await sock.sendMessage(chatId, { text: '❌ Giphy API key not set in settings.js' });
        return;
    }

    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
            params: {
                api_key: apiKey,
                q: query,
                limit: 1,
                rating: 'g'
            }
        });

        const gifUrl = response.data.data[0]?.images?.downsized_medium?.url;

        if (gifUrl) {
            await sock.sendMessage(chatId, { 
                video: { url: gifUrl }, 
                mimetype: 'video/mp4',
                caption: `🎬 GIF for "${query}"\n\n© COOLGUY MD V10`,
                gifPlayback: true
            });
        } else {
            await sock.sendMessage(chatId, { text: '❌ No GIFs found for: ' + query });
        }
    } catch (error) {
        console.error('Error fetching GIF:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch GIF. Try again later.' });
    }
}

module.exports = gifCommand;
