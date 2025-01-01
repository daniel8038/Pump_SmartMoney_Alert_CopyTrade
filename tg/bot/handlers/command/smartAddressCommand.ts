import { CommandContext, Context, InputFile } from "grammy";
import { addressManager } from "../../../../addressManager";

function formatSmartAddresses(addresses: Record<string, string>): string {
  return Object.entries(addresses)
    .map(([address, name], index) => {
      return `🕵️‍♀️ ${name}: ${address}`;
    })
    .join("\n");
}
export const smartAddressCommand = async (ctx: CommandContext<Context>) => {
  try {
    const smartMoneyAddress = await addressManager.getAddresses();
    const addressArray = await addressManager.getAddressArray();
    const formattedMessage = formatSmartAddresses(smartMoneyAddress);
    await ctx.reply(`${formattedMessage}\n 共：${addressArray.length}`, {
      message_thread_id: ctx.message!.message_thread_id,
    });
  } catch (error) {
    console.error("Error in smartAddressCommand:", error);
    await ctx.reply("❌ 获取地址列表失败，请稍后重试", {
      message_thread_id: ctx.message?.message_thread_id,
    });
  }
};
