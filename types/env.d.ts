// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GRPC_URL_MAIN: string;
      GRPC_URL_TEST: string;
      SMART_MONEY_ADDRESS: string;
      SMART_MONEY_MAP: string;
      TG_API_TOKEN: string;
      TG_CHAT_ID: string;
      TG_MESSAGE_THREAD_ID: string;
    }
  }
}
export interface MessageTemplateParam {
  /** 智能钱包持有者名称 */
  smartMoneyName: string;
  /** 智能钱包地址 */
  smartMoneyAddress: string;
  /** 代币地址 */
  tokenMintAccount: string;
  /** 交易类型 (BUY/SELL) */
  type: "BUY" | "SELL";
  /** 交易金额 */
  solAmount?: string | number;
  /** 交易金额 */
  tokenAmount?: string | number;
  /** 代币名称 */
  tokenName?: string;
  /** 交易哈希 */
  txHash: string;
  /** 交易时间戳 */
  time: string;
  /** slot */
  slot?: string;
}
