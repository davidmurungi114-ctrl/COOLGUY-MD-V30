const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn, getWelcome } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');
const fetch = require('node-fetch');

async function welcomeCommand(sock, chatId, message, match) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: '❌ Group only command!\n> © COOLGUY MD V10' });
        return;
    }
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');
    await handleWelcome(sock, chatId, message, matchText);
}

async function handleJoinEvent(sock, id, participants) {
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;
    const customMessage = await getWelcome(id);
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'No description';

    for (const participant of participants) {
        try {
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            let displayName = user;
            try {
                const contact = await sock.getBusinessProfile(participantString);
                if (contact?.name) displayName = contact.name;
                else {
                    const userParticipant = groupMetadata.participants.find(p => p.id === participantString);
                    if (userParticipant?.name) displayName = userParticipant.name;
                }
            } catch {}

            let finalMessage;
            if (customMessage) {
                finalMessage = customMessage.replace(/{user}/g, `@${displayName}`).replace(/{group}/g, groupName).replace(/{description}/g, groupDesc) + '\n\n> © COOLGUY MD V10';
            } else {
                const timeString = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                finalMessage = `╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮\n┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${displayName} 👋\n┃Count: #${groupMetadata.participants.length}\n┃𝚃𝙸𝙼𝙴: ${timeString}⏰\n╰━━━━━━━━━━━━━━━╯\n\n*@${displayName}* Welcome to *${groupName}*! 🎉\n*Group DESCRIPTION*\n${groupDesc}\n\n> © COOLGUY MD V10`;
            }

            try {
                let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
                try { const pic = await sock.profilePictureUrl(participantString, 'image'); if (pic) profilePicUrl = pic; } catch {}
                const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    await sock.sendMessage(id, { image: imageBuffer, caption: finalMessage, mentions: [participantString], ...channelInfo });
                    continue;
                }
            } catch {}

            await sock.sendMessage(id, { text: finalMessage, mentions: [participantString], ...channelInfo });
        } catch (error) {
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            let fallbackMessage = customMessage ? customMessage.replace(/{user}/g, `@${user}`).replace(/{group}/g, groupName).replace(/{description}/g, groupDesc) + '\n\n> © COOLGUY MD V10' : `Welcome @${user} to ${groupName}! 🎉\n\n> © COOLGUY MD V10`;
            await sock.sendMessage(id, { text: fallbackMessage, mentions: [participantString], ...channelInfo });
        }
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
