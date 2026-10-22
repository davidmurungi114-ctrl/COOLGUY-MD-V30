async function groupInfoCommand(sock, chatId, msg) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg';
        }
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        const text = `
┌──「 *INFO GROUP* 」
▢ *♻️ID:*
   • ${groupMetadata.id}
▢ *🔖NAME* : 
• ${groupMetadata.subject}
▢ *👥Members* :
• ${participants.length}
▢ *🤿Group Owner:*
• @${owner.split('@')[0]}
▢ *🕵🏻‍♂️Admins:*
${listAdmin}

▢ *📌Description* :
   • ${groupMetadata.desc?.toString() || 'No description'}

© COOLGUY MD V10
`.trim();

        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        }, { quoted: msg });

    } catch (error) {
        console.error('Error in groupinfo command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get group info!' });
    }
}

module.exports = groupInfoCommand;
