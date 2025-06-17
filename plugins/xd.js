const { cmd } = require("../command");
const config = require("../config");

cmd({
  on: "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    if (!global.statusWarnings) {
      global.statusWarnings = {};
    }

    // Fixed condition: allow plugin only in groups where ANTI_STATUS is enabled
    if (!isGroup || isAdmins || !isBotAdmins || config.ANTI_STATUS !== "true") {
      return;
    }

    // Detect status-like messages
    const isStatusLike =
      body.split("\n").length > 5 || // too many lines
      (body.match(/[★♥♠♦♣•◈©®™℠℡℗Ωℨℬℰℯℱℳℴℵ]/g) || []).length > 3 || // special chars
      (body.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu) || []).length > 5 || // too many emojis
      /^(?:[\*_~]|```)/.test(body) || // starts with markdown characters
      body.length > 500; // message is too long

    if (isStatusLike) {
      console.log("Status-like message detected from " + sender);

      try {
        await conn.sendMessage(from, {
          delete: m.key
        });
        console.log("Status message deleted: " + m.key.id);
      } catch (error) {
        console.error("Failed to delete status message:", error);
      }

      global.statusWarnings[sender] = (global.statusWarnings[sender] || 0) + 1;
      const warningCount = global.statusWarnings[sender];

      if (warningCount < 4) {
        await conn.sendMessage(from, {
          text:
            `‎*⚠️ STATUS MESSAGES ARE NOT ALLOWED ⚠️*\n` +
            `*╭────⬡ WARNING ⬡────*\n` +
            `*├▢ USER :* @${sender.split('@')[0]}\n` +
            `*├▢ COUNT : ${warningCount}*\n` +
            `*├▢ REASON : STATUS MESSAGE DETECTED*\n` +
            `*├▢ WARN LIMIT : 3*\n` +
            `*╰────────────────*`,
          mentions: [sender]
        });
      } else {
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *HAS BEEN REMOVED - STATUS WARN LIMIT EXCEEDED!*`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.statusWarnings[sender];
      }
    }

  } catch (error) {
    console.error("Anti-status error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
