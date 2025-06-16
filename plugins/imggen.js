const axios = require('axios');
const { cmd } = require('../command');

cmd({
  pattern: "imggen",
  desc: "Generate an AI image from text",
  category: "ai",
  filename: __filename
}, async (conn, m, { args, text }) => {
  if (!text) return m.reply("🔤 Please provide a prompt!\nExample: *imggen a futuristic robot in the city*");

  try {
    m.react('🎨');

    let res = await axios.get(`https://lexica.art/api/v1/search?q=${encodeURIComponent(text)}`);
    let data = res.data.images;

    if (!data || data.length === 0) return m.reply("❌ No image found for that prompt.");

    let image = data[0].srcSmall || data[0].src;

    await conn.sendMessage(m.chat, {
      image: { url: image },
      caption: `🖼️ *Generated Image:*\n"${text}"`,
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error generating image.");
  }
});
