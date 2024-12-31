import {
  SubscribeUpdate,
  SubscribeUpdateTransaction,
  SubscribeUpdateTransactionInfo,
} from "@triton-one/yellowstone-grpc";
import {
  formatBuffer,
  formatDate,
  getSolBalanceChange,
  getTokenBalanceChange,
  getTokenMintAccount,
  messageTemplate,
} from "../utils";
import { SMART_MONEY_MAP } from "../config";
import { MessageTemplateParam } from "../types/env";
import { sendToTelegram } from "../tg/bot";
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
  //-
  const { tokenMintAccount, accountIndex } = getTokenMintAccount(pre);
  if (!tokenMintAccount || !accountIndex) return;
  const signature = formatBuffer(transaction.signature);
  const accountKeys =
    data.transaction.transaction?.transaction?.message?.accountKeys.map(
      (account) => formatBuffer(account)
    )!;
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
      };
      const alertMessage = messageTemplate(alertMessageParams);
      await sendToTelegram(alertMessage);
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
      };
      const alertMessage = messageTemplate(alertMessageParams);
      await sendToTelegram(alertMessage);
      isStopped = false;
    }
  } catch (error) {}
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
