const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "imggen",
  desc: "Generate an AI image from text",
  category: "ai",
  filename: __filename
}, async (conn, m, { text }) => {
  if (!text) return m.reply("📝 *Please provide a prompt.*\nExample: `imggen an astronaut cat on Mars`");

  try {
    m.react("🖌️");
    const res = await axios.post("https://backend.craiyon.com/generate", {
      prompt: text
    });

    const images = res.data.images;
    if (!images || images.length === 0) return m.reply("❌ Failed to generate image.");

    // Craiyon returns base64 strings – let's pick the first image
    const base64Image = images[0];

    await conn.sendMessage(m.chat, {
      image: Buffer.from(base64Image, "base64"),
      caption: `🖼️ *Image generated for:* "${text}"`,
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error generating image.");
  }
});
