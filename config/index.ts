import dotenv from "dotenv";
import { CommitmentLevel } from "@triton-one/yellowstone-grpc";
import { SubscribeRequest } from "@triton-one/yellowstone-grpc";
import smartMoneyAddress from "./smartMoneyAddress.json";
dotenv.config();
// =========ENV========== //
const GRPC_URL_MAIN = process.env.GRPC_URL_MAIN!;
const GRPC_URL_TEST = process.env.GRPC_URL_TEST!;
const SMART_MONEY_ADDRESS: string[] = Object.keys(smartMoneyAddress);
const SMART_MONEY_MAP: Record<string, string> = smartMoneyAddress;
const TG_API_TOKEN = process.env.TG_API_TOKEN!;
const TG_CHAT_ID = process.env.TG_CHAT_ID!;
const TG_MESSAGE_THREAD_ID = process.env.TG_MESSAGE_THREAD_ID!;
// =========SubscribeRequestConfig========== //
const PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const subRequestConfig: SubscribeRequest = {
  accounts: {},
  slots: {},
  transactions: {
    pumpFun: {
      accountInclude: SMART_MONEY_ADDRESS,
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

export {
  GRPC_URL_MAIN,
  GRPC_URL_TEST,
  subRequestConfig,
  SMART_MONEY_ADDRESS,
  SMART_MONEY_MAP,
  TG_API_TOKEN,
  TG_CHAT_ID,
  TG_MESSAGE_THREAD_ID,
};
