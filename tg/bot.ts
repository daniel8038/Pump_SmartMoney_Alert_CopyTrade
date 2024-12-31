import { Bot } from "grammy";
import { TG_API_TOKEN, TG_CHAT_ID, TG_MESSAGE_THREAD_ID } from "../config";

const bot = new Bot(TG_API_TOKEN);
bot.command("start", async (ctx) => {
  await ctx.reply(`测试机器人start`, {
    message_thread_id: ctx.message!.message_thread_id,
  });
});
bot.on("message", (ctx) => {});
bot.start();

async function sendToTelegram(message: string) {
  try {
    await bot.api.sendMessage(TG_CHAT_ID, message, {
      message_thread_id: +TG_MESSAGE_THREAD_ID,
    });
  } catch (error) {
    console.error("发送消息到 Telegram 失败:", error);
  }
}
export { sendToTelegram };
