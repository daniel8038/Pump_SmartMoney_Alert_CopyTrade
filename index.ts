import Client from "@triton-one/yellowstone-grpc";
import { GRPC_URL_MAIN, GRPC_URL_TEST, subRequestConfig } from "./config";
import {
  handleStreamEvent,
  handleStreamPingPong,
  sendSubscribeRequest,
} from "./stream";
import "./tg/bot";
async function main(): Promise<void> {
  const client = new Client(GRPC_URL_MAIN, undefined, {
    "grpc.max_receive_message_length": 16 * 1024 * 1024,
  });
  const stream = await client.subscribe();
  try {
    await sendSubscribeRequest(stream, subRequestConfig);
    await handleStreamEvent(stream);
    await handleStreamPingPong(stream);
  } catch (error) {
    console.error("[程序订阅出错:]", error);
  }
}
main().catch((err) => {
  console.error("[Unhandled error in main]", err);
  process.exit(1);
});
