const isAdmin = require('../lib/isAdmin');

async function promoteCommand(sock, chatId, mentionedJids, message, senderId) {
    let userToPromote = [];
    
    if (mentionedJids && mentionedJids.length > 0) {
        userToPromote = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    if (userToPromote.length === 0) {
        await sock.sendMessage(chatId, { 
            text: '❌ Please mention the user or reply to their message to promote!\n> © COOLGUY MD V10'
        }, { quoted: message });
        return;
    }

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId || message.key.participant);
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Bot must be admin!' }, { quoted: message });
        return;
    }
    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Only admins can promote!' }, { quoted: message });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
        
        const usernames = userToPromote.map(jid => `@${jid.split('@')[0]}`);
        const promoterJid = senderId || message.key.participant || sock.user.id;
        
        const promotionMessage = `*『 GROUP PROMOTION 🔥 』*\n\n` +
            `👥 *Promoted User${userToPromote.length > 1 ? 's' : ''}:*\n` +
            `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Promoted By:* @${promoterJid.split('@')[0]}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}\n> © COOLGUY MD V10`;
        await sock.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in promote command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to promote user(s)!'}, { quoted: message });
    }
}

async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || participants.length === 0) return;

        const promotedUsernames = participants.map(jid => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]} `;
        });

        let promotedBy;
        let mentionList = participants.map(jid => typeof jid === 'string' ? jid : (jid.id || jid.toString()));

        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = 'System';
        }

        const promotionMessage = `*『 GROUP PROMOTION 🔥 』*\n\n` +
            `👥 *Promoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${promotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Promoted By:* ${promotedBy}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}\n> © COOLGUY MD V10`;
        
        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling promotion event:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };
