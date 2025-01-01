import dotenv from "dotenv";
import { CommitmentLevel } from "@triton-one/yellowstone-grpc";
import { SubscribeRequest } from "@triton-one/yellowstone-grpc";
import smartMoneyAddress from "./smartMoneyAddress.json";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
dotenv.config();
// =========ENV========== //
const GRPC_URL_MAIN = process.env.GRPC_URL_MAIN!;
const GRPC_URL_TEST = process.env.GRPC_URL_TEST!;
const RPC_ENDPOINT = process.env.RPC_ENDPOINT!;
const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRAVITE_KEY!));
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
const connection = new Connection(RPC_ENDPOINT, {
  commitment: "processed",
});
const anchorProvider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "processed",
  skipPreflight: true,
});
export {
  GRPC_URL_MAIN,
  GRPC_URL_TEST,
  subRequestConfig,
  SMART_MONEY_ADDRESS,
  SMART_MONEY_MAP,
  TG_API_TOKEN,
  TG_CHAT_ID,
  TG_MESSAGE_THREAD_ID,
  connection,
  anchorProvider,
  keypair,
};
