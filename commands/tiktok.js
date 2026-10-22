const { ttdl } = require("ruhend-scraper");
const axios = require('axios');
const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {
        if (processedMessages.has(message.key.id)) return;
        processedMessages.add(message.key.id);
        setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text) return await sock.sendMessage(chatId, { text: "⚠️ Provide TikTok link!\n> © COOLGUY MD V10" }, { quoted: message });

        const url = text.split(' ').slice(1).join(' ').trim();
        if (!url) return await sock.sendMessage(chatId, { text: "⚠️ Provide TikTok link!\n> © COOLGUY MD V10" }, { quoted: message });

        const tiktokPatterns = [/https?:\/\/(?:www\.)?tiktok\.com\//, /https?:\/\/(?:vm\.)?tiktok\.com\//, /https?:\/\/(?:vt\.)?tiktok\.com\//];
        if (!tiktokPatterns.some(p => p.test(url))) return await sock.sendMessage(chatId, { text: "❌ Invalid TikTok link!\n> © COOLGUY MD V10" }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

        try {
            const apiUrl = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`;
            let videoUrl = null, title = null;

            try {
                const response = await axios.get(apiUrl, { timeout: 15000 });
                if (response.data?.status && response.data.data) {
                    if (response.data.data.urls?.length > 0) {
                        videoUrl = response.data.data.urls[0];
                        title = response.data.data.metadata?.title || "TikTok Video";
                    } else if (response.data.data.video_url) {
                        videoUrl = response.data.data.video_url;
                        title = response.data.data.metadata?.title || "TikTok Video";
                    }
                }
            } catch (e) {}

            if (!videoUrl) {
                try {
                    let downloadData = await ttdl(url);
                    if (downloadData?.data?.length > 0) {
                        for (let media of downloadData.data.slice(0, 20)) {
                            const mediaUrl = media.url;
                            const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === 'video';
                            if (isVideo) await sock.sendMessage(chatId, { video: { url: mediaUrl }, mimetype: "video/mp4", caption: "📥 DOWNLOADED BY COOLGUY MD V10\n> © COOLGUY MD V10" }, { quoted: message });
                            else await sock.sendMessage(chatId, { image: { url: mediaUrl }, caption: "📥 DOWNLOADED BY COOLGUY MD V10\n> © COOLGUY MD V10" }, { quoted: message });
                        }
                        return;
                    }
                } catch (e) {}
            }

            if (videoUrl) {
                try {
                    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000, maxContentLength: 100 * 1024 * 1024 });
                    const videoBuffer = Buffer.from(videoResponse.data);
                    const caption = title ? `📥 *COOLGUY MD V10*\n📝 ${title}\n\n> © COOLGUY MD V10` : "📥 *COOLGUY MD V10*\n> © COOLGUY MD V10";
                    await sock.sendMessage(chatId, { video: videoBuffer, mimetype: "video/mp4", caption }, { quoted: message });
                    return;
                } catch (e) {
                    await sock.sendMessage(chatId, { video: { url: videoUrl }, mimetype: "video/mp4", caption: "📥 COOLGUY MD V10\n> © COOLGUY MD V10" }, { quoted: message });
                    return;
                }
            }

            return await sock.sendMessage(chatId, { text: "❌ Failed to download TikTok video.\n> © COOLGUY MD V10" }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, { text: "❌ Failed to download TikTok video.\n> © COOLGUY MD V10" }, { quoted: message });
        }
    } catch (error) {
        await sock.sendMessage(chatId, { text: "❌ Error occurred.\n> © COOLGUY MD V10" }, { quoted: message });
    }
}

module.exports = tiktokCommand;
