import { CommandContext, Context } from "grammy";
import { isValidSolanaAddress } from "../../../../utils";
import { searchLatestTweet } from "../../../../twitter";

export const searchTokenInTwitter = async (ctx: CommandContext<Context>) => {
  try {
    // 获取命令后的参数
    const address = ctx.message?.text.split(" ").slice(1).join(" ").trim();
    if (!address || !isValidSolanaAddress(address)) {
      await ctx.reply("输入有效地址", {
        message_thread_id: ctx.message!.message_thread_id,
      });
      return;
    }
    const data = await searchLatestTweet(address);
    console.log(data);
    await ctx.reply(address!, {
      message_thread_id: ctx.message!.message_thread_id,
    });
  } catch (e) {
    console.log(e);
  }
};
