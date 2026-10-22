const axios = require('axios');

module.exports = async function (sock, chatId, message) {
    try {
        const apiKey = process.env.NEWS_API_KEY || 'dcd720a6f1914e2d9dba9790c188c808c';
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        const articles = response.data.articles.slice(0, 5);
        let newsMessage = '📰 *COOLGUY MD V10 LATEST NEWS*\n\n';
        articles.forEach((article, index) => {
            newsMessage += `${index + 1}. *${article.title}*\n${article.description}\n${article.url ? `🔗 ${article.url}\n\n` : '\n'}`;
        });
        newsMessage += `\n> © COOLGUY TECH`;
        await sock.sendMessage(chatId, { text: newsMessage }, { quoted: message });
    } catch (error) {
        console.error('Error fetching news:', error);
        await sock.sendMessage(chatId, { text: '❌ Sorry, I could not fetch news right now.' }, { quoted: message });
    }
};
