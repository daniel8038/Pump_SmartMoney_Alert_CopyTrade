import Client, {
  CommitmentLevel,
  SubscribeRequest,
} from "@triton-one/yellowstone-grpc";
import { GRPC_URL_MAIN, PUMP_FUN_PROGRAM_ID } from "./config";
import {
  handleStreamEvent,
  handleStreamPingPong,
  sendSubscribeRequest,
} from "./stream";
import { addressManager } from "./addressManager";

async function main(): Promise<void> {
  const client = new Client(GRPC_URL_MAIN, undefined, {
    "grpc.max_receive_message_length": 16 * 1024 * 1024,
  });
  const stream = await client.subscribe();
  const SMART_ADDRESS_ARRAY = await addressManager.getAddressArray();
  try {
    const subRequestConfig: SubscribeRequest = {
      accounts: {},
      slots: {},
      transactions: {
        pumpFun: {
          accountInclude: SMART_ADDRESS_ARRAY,
          accountExclude: [],
          accountRequired: [PUMP_FUN_PROGRAM_ID],
          failed: false,
        },
      },
      transactionsStatus: {},
      blocks: {},
      blocksMeta: {},
      entry: {},
      accountsDataSlice: [],
      commitment: CommitmentLevel.CONFIRMED,
    };
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
