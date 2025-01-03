import {
  SubscribeUpdate,
  SubscribeUpdateTransaction,
  SubscribeUpdateTransactionInfo,
} from "@triton-one/yellowstone-grpc";
import { PublicKey } from "@solana/web3.js";
import {
  formatBuffer,
  formatDate,
  getSolBalanceChange,
  getTokenBalanceChange,
  getTokenMintAccount,
  messageTemplate,
} from "../utils";
import { MessageTemplateParam } from "../types/env.js";
import { buyToken } from "./pump/buyToken";
import { addressManager } from "../addressManager";
//
let isStopped = false;
export default async function handleData(data: SubscribeUpdate) {
  if (isStopped) {
    return;
  }
  if (
    !isSubscribeUpdateTransaction(data) ||
    !data.filters.includes("pumpFun")
  ) {
    return;
  }
  const transaction = data.transaction?.transaction;
  const transactionMessage = data.transaction.transaction?.transaction?.message;
  if (!transaction || !transactionMessage) return;
  //-
  let type = "" as "BUY" | "SELL";
  const isSell = checkIsSell(transaction);
  const isBuy = checkIsBuy(transaction);
  if (!isSell && !isBuy) return;
  type = isBuy ? "BUY" : "SELL";
  //-
  const pre = data.transaction?.transaction?.meta?.preTokenBalances;
  const post = data.transaction?.transaction?.meta?.postTokenBalances;
  const preSol = data.transaction?.transaction?.meta?.preBalances;
  const postSol = data.transaction?.transaction?.meta?.postBalances;
  if (!pre || !post || !preSol || !postSol) return;
  //
  const { tokenMintAccount, accountIndex } = getTokenMintAccount(pre);
  if (!tokenMintAccount || !accountIndex) return;
  //
  const signature = formatBuffer(transaction.signature);
  const accountKeys =
    data.transaction.transaction?.transaction?.message?.accountKeys.map(
      (account) => formatBuffer(account)
    )!;
  const SMART_MONEY_MAP = await addressManager.getAddressMap();
  const smartMoneyName = SMART_MONEY_MAP[accountKeys[0]];
  const smartMoneyAddress = accountKeys[0];

  try {
    isStopped = true;
    if (type === "BUY") {
      const tokenChange = getTokenBalanceChange(pre, post, smartMoneyAddress);
      const solChange = getSolBalanceChange(preSol, postSol, accountIndex);
      const alertMessageParams: MessageTemplateParam = {
        type,
        smartMoneyName,
        smartMoneyAddress,
        tokenMintAccount,
        txHash: signature,
        time: formatDate(),
        slot: data.transaction.slot,
        tokenName: "testName",
        solAmount: solChange,
        tokenAmount: tokenChange,
        tokenMarketCap: "testMC",
        tokenPrice: "testPrice",
      };
      const alertMessage = messageTemplate(alertMessageParams);
      console.log(alertMessage);
      // await sendToTelegram(alertMessage);
      // await buyToken(new PublicKey(tokenMintAccount), 0.01, 30);
      isStopped = false;
    }
    if (type === "SELL") {
      const tokenChange = getTokenBalanceChange(pre, post, smartMoneyAddress);
      const solChange = getSolBalanceChange(preSol, postSol, accountIndex);
      const alertMessageParams: MessageTemplateParam = {
        type,
        smartMoneyName,
        smartMoneyAddress,
        tokenMintAccount,
        txHash: signature,
        time: formatDate(),
        slot: data.transaction.slot,
        tokenName: "testName",
        solAmount: solChange,
        tokenAmount: tokenChange,
        tokenMarketCap: "testMC",
        tokenPrice: "testPrice",
      };
      const alertMessage = messageTemplate(alertMessageParams);
      console.log(alertMessage);
      // await sendToTelegram(alertMessage);
      // 跟单

      isStopped = false;
    }
  } catch (error) {
    console.error("出错", error);
  }
}

// Helper
function isSubscribeUpdateTransaction(
  data: SubscribeUpdate
): data is SubscribeUpdate & { transaction: SubscribeUpdateTransaction } {
  return (
    "transaction" in data &&
    typeof data.transaction === "object" &&
    data.transaction !== null &&
    "slot" in data.transaction &&
    "transaction" in data.transaction
  );
}
// check
function checkIsSell(transaction: SubscribeUpdateTransactionInfo): boolean {
  return (
    transaction.meta?.logMessages
      .toString()
      .includes("Program log: Instruction: Sell") ?? false
  );
}
function checkIsBuy(transaction: SubscribeUpdateTransactionInfo): boolean {
  return (
    transaction.meta?.logMessages
      .toString()
      .includes("Program log: Instruction: Buy") ?? false
  );
}
