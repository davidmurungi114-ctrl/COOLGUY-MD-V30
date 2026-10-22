const axios = require('axios');

module.exports = async function (sock, chatId, message, city) {
    if (!city) {
        await sock.sendMessage(chatId, { text: '⚠️ Provide a city!\nExample: .weather Kampala\n\n> © COOLGUY MD V10' }, { quoted: message });
        return;
    }
    try {
        const apiKey = '4902c0f2550f58298ad4146a92b65e10';
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
        const weather = response.data;
        const weatherText = `🌤️ *WEATHER - COOLGUY MD V10*\n\n📍 City: ${weather.name}, ${weather.sys.country}\n🌥️ Condition: ${weather.weather[0].description}\n🌡️ Temp: ${weather.main.temp}°C (Feels: ${weather.main.feels_like}°C)\n💧 Humidity: ${weather.main.humidity}%\n💨 Wind: ${weather.wind.speed} m/s\n📊 Pressure: ${weather.main.pressure} hPa\n\n> © COOLGUY MD V10`;
        await sock.sendMessage(chatId, { text: weatherText }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { text: `❌ Could not fetch weather for "${city}"!\nCheck city name.\n> © COOLGUY MD V10` }, { quoted: message });
    }
};
