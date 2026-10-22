const axios = require('axios');

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after .gpt or .gemini\n\nExample: .gpt write a basic html code"
            }, {
                quoted: message
            });
        }

        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after .gpt or .gemini"
            }, {quoted:message});
        }

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🤖', key: message.key }
            });

            if (command === '.gpt') {
                const response = await axios.get(`https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`);
                
                if (response.data && response.data.status && response.data.result) {
                    const answer = response.data.result;
                    await sock.sendMessage(chatId, {
                        text: answer
                    }, {
                        quoted: message
                    });
                } else {
                    throw new Error('Invalid response from API');
                }
            } else if (command === '.gemini') {
                const apis = [
                    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                    `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`
                ];

                for (const api of apis) {
                    try {
                        const response = await axios.get(api);
                        const data = response.data;

                        if (data.message || data.data || data.answer || data.result) {
                            const answer = data.message || data.data || data.answer || data.result;
                            await sock.sendMessage(chatId, {
                                text: answer
                            }, {
                                quoted: message
                            });
                            return;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                throw new Error('All Gemini APIs failed');
            }
        } catch (error) {
            console.error('API Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to get response. Please try again later."
            }, {
                quoted: message
            });
        }
    } catch (error) {
        console.error('AI Command Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, {
            quoted: message
        });
    }
}

module.exports = aiCommand;
