import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { PUMP_FUN_IDL, PumpFun } from "../../IDL";
import { anchorProvider, connection, keypair } from "../../config";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccountTransaction } from "../../utils";

const buyToken = async (
  tokenMintAccount: PublicKey,
  solAmount: number,
  slippage: number,
  priorityFee?: number
) => {
  const program = new Program<PumpFun>(PUMP_FUN_IDL as PumpFun, anchorProvider);
  //
  const transaction = new Transaction();
  // AT
  const myAssociatedTokenAddress = await getAssociatedTokenAddress(
    tokenMintAccount,
    keypair.publicKey
  );
  // ATA
  await getOrCreateAssociatedTokenAccountTransaction(
    connection,
    myAssociatedTokenAddress,
    tokenMintAccount,
    keypair,
    transaction
  );
};
export { buyToken };
