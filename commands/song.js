// ... keep all your existing functions: tryRequest, getEliteProTechDownloadByUrl, getYupraDownloadByUrl, getOkatsuDownloadByUrl ...

async function songCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.trim().split(' ').slice(1).join(' ');
        if (!args) {
            await sock.sendMessage(chatId, { text: '⚠️ Usage: `.song <song name or YouTube link>`\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        let video;
        if (args.includes('youtube.com') || args.includes('youtu.be')) {
            video = { url: args, title: 'YouTube Audio', thumbnail: 'https://i.ytimg.com/vi/default/hqdefault.jpg', timestamp: 'N/A' };
        } else {
            const search = await yts(args);
            if (!search || !search.videos.length) {
                await sock.sendMessage(chatId, { text: '❌ No results found.\n> © COOLGUY MD V10' }, { quoted: message });
                return;
            }
            video = search.videos[0];
        }

        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎵 *COOLGUY SONG DOWNLOADER*\n\n📀 Title: *${video.title}*\n⏱ Duration: ${video.timestamp}\n\n_Downloading audio..._\n\n> © COOLGUY MD V10`
        }, { quoted: message });

        // ... your full fallback chain EliteProTech -> Yupra -> Okatsu (keep as is) ...

        // after success:
        await sock.sendMessage(chatId, {
            audio: finalBuffer,
            mimetype: finalMimetype,
            fileName: `${(audioData.title || video.title || 'song').replace(/[^\w\s-]/g, '')}.${finalExtension}`,
            ptt: false
        }, { quoted: message });

        // ... your cleanup ...

    } catch (err) {
        console.error('Song command error:', err);
        let errorMessage = '❌ Failed to download song.\n> © COOLGUY MD V10';
        if (err.message?.includes('blocked')) errorMessage = '❌ Download blocked. Content may be unavailable in your region.\n> © COOLGUY MD V10';
        else if (err.response?.status === 451 || err.status === 451) errorMessage = '❌ Content unavailable (451).\n> © COOLGUY MD V10';
        else if (err.message?.includes('All download sources failed')) errorMessage = '❌ All sources failed. Try another song.\n> © COOLGUY MD V10';
        
        await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
    }
}

module.exports = songCommand;
