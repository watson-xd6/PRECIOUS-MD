
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

const WELCOME_FILE = path.join(__dirname, '../data/welcome.json');
let welcomeData = fs.existsSync(WELCOME_FILE) ? JSON.parse(fs.readFileSync(WELCOME_FILE)) : {};

// Save function
const saveWelcome = () => fs.writeFileSync(WELCOME_FILE, JSON.stringify(welcomeData, null, 2));

// Command to toggle welcome ON/OFF
cmd({
  pattern: 'welcome',
  desc: 'Enable or disable welcome messages',
  category: 'group',
  filename: __filename
}, async (conn, m, { args, isGroup, isAdmin }) => {
  if (!isGroup) return m.reply('This command can only be used in groups!');
  if (!isAdmin) return m.reply('Only group admins can use this command!');

  const groupId = m.chat;
  const action = args[0];

  if (action === 'on') {
    welcomeData[groupId] = true;
    saveWelcome();
    m.reply('✅ Welcome message enabled!');
  } else if (action === 'off') {
    delete welcomeData[groupId];
    saveWelcome();
    m.reply('❌ Welcome message disabled!');
  } else {
    m.reply('Usage:\n- welcome on\n- welcome off');
  }
});

// Group Participants Update Event
cmd({
  on: 'group-participants-update',
  filename: __filename
}, async (conn, m) => {
  const groupId = m.id;
  const action = m.action;
  const user = m.participants[0];

  if (action === 'add' && welcomeData[groupId]) {
    const name = await conn.getName(user);
    const pp = await conn.profilePictureUrl(user, 'image').catch(() => 'https://files.catbox.moe/2899fa.jpg');

    await conn.sendMessage(groupId, {
      image: { url: pp },
      caption: `👋 Welcome @${user.split('@')[0]} to *${m.subject}*!\n\nWe're happy to have you here.`,
      mentions: [user]
    });
  }
});
