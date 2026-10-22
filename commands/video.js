const axios = require('axios');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try { return await getter(); } catch (err) { lastError = err; if (attempt < attempts) await new Promise(r => setTimeout(r, 1000 * attempt)); }
    }
    throw lastError;
}

async function getEliteProTechVideoByUrl(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp4`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.downloadURL) return { download: res.data.downloadURL, title: res.data.title };
    throw new Error('EliteProTech no download');
}

async function getYupraVideoByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.data?.download_url) return { download: res.data.data.download_url, title: res.data.data.title, thumbnail: res.data.data.thumbnail };
    throw new Error('Yupra no download');
}

async function getOkatsuVideoByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.mp4) return { download: res.data.result.mp4, title: res.data.result.title };
    throw new Error('Okatsu no mp4');
}

async function videoCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        if (!searchQuery) {
            await sock.sendMessage(chatId, { text: '⚠️ What video to download?\nExample: .video Alan Walker Alone\n\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }
        let videoUrl = ''; let videoTitle = ''; let videoThumbnail = '';
        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) videoUrl = searchQuery;
        else {
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ No videos found!\n> © COOLGUY MD V10' }, { quoted: message });
                return;
            }
            videoUrl = videos[0].url; videoTitle = videos[0].title; videoThumbnail = videos[0].thumbnail;
        }
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || searchQuery;
            if (thumb) await sock.sendMessage(chatId, { image: { url: thumb }, caption: `🎬 *${captionTitle}*\nDownloading...\n\n> © COOLGUY MD V10` }, { quoted: message });
        } catch (e) {}
        let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
        if (!urls) {
            await sock.sendMessage(chatId, { text: '❌ Not a valid YouTube link!\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }
        let videoData; let downloadSuccess = false;
        const apiMethods = [
            { name: 'EliteProTech', method: () => getEliteProTechVideoByUrl(videoUrl) },
            { name: 'Yupra', method: () => getYupraVideoByUrl(videoUrl) },
            { name: 'Okatsu', method: () => getOkatsuVideoByUrl(videoUrl) }
        ];
        for (const apiMethod of apiMethods) {
            try {
                videoData = await apiMethod.method();
                const check = videoData.download || videoData.dl || videoData.url;
                if (!check) continue;
                downloadSuccess = true; break;
            } catch (apiErr) { continue; }
        }
        if (!downloadSuccess || !videoData) throw new Error('All sources failed');
        await sock.sendMessage(chatId, {
            video: { url: videoData.download || videoData.dl || videoData.url },
            mimetype: 'video/mp4',
            fileName: `${(videoData.title || videoTitle || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `*${videoData.title || videoTitle || 'Video'}*\n\n> © COOLGUY MD V10`
        }, { quoted: message });
    } catch (error) {
        let errorMessage = '❌ Failed to download video.\n> © COOLGUY MD V10';
        if (error.message?.includes('blocked')) errorMessage = '❌ Blocked in your region.\n> © COOLGUY MD V10';
        else if (error.message?.includes('All download')) errorMessage = '❌ All sources failed!\n> © COOLGUY MD V10';
        await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
    }
}

module.exports = videoCommand;
