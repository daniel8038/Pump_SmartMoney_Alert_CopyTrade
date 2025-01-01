import { TokenBalance } from "@triton-one/yellowstone-grpc/dist/grpc/solana-storage";
import bs58 from "bs58";
import { MessageTemplateParam } from "../types/env";
import {
  Account,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
const formatBuffer = (signature: Uint8Array | number[]): string => {
  return bs58.encode(signature);
};
/**
 * 获取token账户以及账户索引
 */
const getTokenMintAccount = (
  pre: TokenBalance[]
): { tokenMintAccount?: string; accountIndex?: number } => {
  const tokenMintAccount = pre.filter((token) =>
    token.accountIndex === 1 ? false : true
  );
  return {
    tokenMintAccount: tokenMintAccount[0]?.mint ?? null,
    accountIndex: tokenMintAccount[0]?.accountIndex ?? null,
  };
};
/**
 * 格式化交易监控消息模板
 * @param {object} params - 交易信息参数对象
 * @param {string} params.smartMoneyName - 操作者名称 王二
 * @param {string} params.smartMoneyAddress - 缩略后的钱包地址
 * @param {string} params.type - 交易类型(BUY/SELL)
 * @param {string} params.amount - 交易金额
 * @param {string} params.tokenName - 代币名称
 * @param {string} params.txHash - 交易哈希
 * @param {string} params.blockHeight - 区块高度
 * @param {string} params.timestamp - 交易时间戳
 * @param {string} params.explorerUrl - 区块浏览器链接
 * @returns {string} 格式化后的消息字符串
 */
const messageTemplate = ({
  smartMoneyName,
  smartMoneyAddress,
  tokenMintAccount,
  type,
  solAmount,
  tokenAmount,
  tokenName,
  txHash,
  slot,
  time,
  tokenPrice,
  tokenMarketCap,
}: MessageTemplateParam) => {
  return `
🔔 ${type === "BUY" ? "🟢" : "🔴"}  ━━智能钱包监控提醒 ━━
  👤 操作者: ${smartMoneyName} (${smartMoneyAddress})
  💫 操作类型: ${type === "BUY" ? "买入 🟢" : "卖出 🔴"}
  💰 交易金额: ${solAmount} SOL
  💎 代币名称: ${tokenName}
  💎 代币地址: ${tokenMintAccount}
  💎 代币数量: ${tokenAmount}
  💎 代币价格: ${tokenPrice}
  💎 代币市值: ${tokenMarketCap}
  🎯 交易详情
  ├─ 交易哈希: ${txHash}
  ├─ slot: ${slot}
  └─ 时间: ${time}
  🌐 浏览器查看: https://solscan.io/tx/${txHash}`;
};
const formatDate = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const getTokenBalanceChange = (
  pre: TokenBalance[],
  post: TokenBalance[],
  smartMoneyAddress: string
) => {
  let preBalance = 0;
  let postBalance = 0;
  const preAccount = pre.filter((value) => value.owner === smartMoneyAddress);
  const postAccount = post.filter((value) => value.owner === smartMoneyAddress);
  if (preAccount && preAccount.length !== 0) {
    preBalance = preAccount[0].uiTokenAmount?.uiAmount!;
  }
  if (postAccount && postAccount.length !== 0) {
    postBalance = postAccount[0].uiTokenAmount?.uiAmount!;
  }
  return Math.floor(postBalance - preBalance);
};
const getSolBalanceChange = (
  pre: string[],
  post: string[],
  accountIndex: number
) => {
  const preSolBalance = pre[accountIndex - 1];
  const postBalance = post[accountIndex - 1];
  const change = (Number(postBalance) - Number(preSolBalance)) / 10 ** 9;
  return change.toFixed(4);
};
const getOrCreateAssociatedTokenAccountTransaction = async function (
  connection: Connection,
  publicKeyAddress: PublicKey,
  tokenMintAccount: PublicKey,
  keypair: Keypair,
  transaction: Transaction
): Promise<Account | void> {
  let account: Account;
  try {
    account = await getAccount(connection, publicKeyAddress, "finalized");
    return account;
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      try {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            keypair.publicKey,
            publicKeyAddress,
            keypair.publicKey,
            tokenMintAccount
          )
        );
      } catch (error: unknown) {}
    } else {
      throw error;
    }
  }
};
export {
  formatBuffer,
  getTokenMintAccount,
  messageTemplate,
  formatDate,
  getTokenBalanceChange,
  getSolBalanceChange,
  getOrCreateAssociatedTokenAccountTransaction,
};
