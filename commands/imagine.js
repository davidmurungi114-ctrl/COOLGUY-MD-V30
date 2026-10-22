const axios = require('axios');
const { fetchBuffer } = require('../lib/myfunc');

async function imagineCommand(sock, chatId, message) {
    try {
        const prompt = message.message?.conversation?.trim() || 
                      message.message?.extendedTextMessage?.text?.trim() || '';
        
        const imagePrompt = prompt.slice(8).trim();
        
        if (!imagePrompt) {
            await sock.sendMessage(chatId, {
                text: '🎨 *COOLGUY MD V10 IMAGINE*\n\nPlease provide a prompt.\nExample: .imagine a beautiful sunset over mountains'
            }, {
                quoted: message
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '🎨 *Generating your image...* Please wait.\n> © COOLGUY MD V10'
        }, {
            quoted: message
        });

        const enhancedPrompt = enhancePrompt(imagePrompt);

        const response = await axios.get(`https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`, {
            responseType: 'arraybuffer'
        });

        const imageBuffer = Buffer.from(response.data);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🎨 *COOLGUY MD V10*\nGenerated for: "${imagePrompt}"`
        }, {
            quoted: message
        });

    } catch (error) {
        console.error('Error in imagine command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to generate image. Please try again later.'
        }, {
            quoted: message
        });
    }
}

function enhancePrompt(prompt) {
    const qualityEnhancers = [
        'high quality',
        'detailed',
        'masterpiece',
        'best quality',
        'ultra realistic',
        '4k',
        'highly detailed',
        'professional photography',
        'cinematic lighting',
        'sharp focus'
    ];

    const numEnhancers = Math.floor(Math.random() * 2) + 3;
    const selectedEnhancers = qualityEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnhancers);

    return `${prompt}, ${selectedEnhancers.join(', ')}`;
}

module.exports = imagineCommand;
