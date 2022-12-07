import { hethers } from "@hashgraph/hethers";
import {
  AccountId,
  Client,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  PrivateKey,
  Hbar,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const NETWORK = process.env.HEDERA_NETWORK;
const OPERATOR_ID = process.env.OPERATOR_ID_MAINNET_ED2559;
const OPERATOR_KEY = process.env.OPERATOR_KEY_MAINNET_ED2559;

async function main() {
  const client = Client.forName(NETWORK!);
  client.setOperator(
    AccountId.fromString(OPERATOR_ID!),
    PrivateKey.fromString(OPERATOR_KEY!)
  );
  let tokenAddress = "0x00000000000000000000000000000000000cba44"; // <- HBARX
  if (NETWORK === "testnet") {
    tokenAddress = "0x0000000000000000000000000000000002ec6cef"; // random testnet token
  }
  const accountAddress = AccountId.fromString(OPERATOR_ID!).toSolidityAddress();
  console.log("accountAddress", accountAddress);

  await staderStake(client);
  // await withHethers(tokenAddress, accountAddress);
  // await withSDKQuery(client, tokenAddress, accountAddress);
  // await withSDKCall(client, tokenAddress, accountAddress);
}

async function staderStake(client: any) {
  console.log(`Staking with 1 HBAR`);
  // const stakingPoolAddress = "0x0000000000000000000000000000000000158d97";
  const stakingPoolAddress = "0x00000000000000000000000000000000000fae04";
  const contractId = ContractId.fromSolidityAddress(stakingPoolAddress);
  console.log("contractId", String.fromCharCode(...contractId.toBytes()));
  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(200000)
    .setPayableAmount(new Hbar(1))
    .setFunction("stake");

  const txEx = await transaction.execute(client);
  const txExRx = await txEx.getRecord(client);

  console.log(
    `Check you transaction at https://hashscan.io/#/${NETWORK}/transaction/0.0.${txExRx.transactionId
      .toString()
      .replace("0.0.", "")
      .replace(/[@.]/g, "-")}`
  );

  if (txExRx.receipt.status.toString() === "SUCCESS") {
    console.log(`You have successfully staked 1 HBAR`);
  } else {
    console.log(`Something went wrong. Please try again`);
  }
}

async function withSDKQuery(
  client: any,
  tokenAddress: string,
  accountAddress: string
) {
  const contractFunctionParameters =
    new ContractFunctionParameters().addAddress(
      accountAddress.replace("0x", "")
    );
  const contractId = ContractId.fromSolidityAddress(tokenAddress);
  let contractQuery = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(30000)
    // .setQueryPayment(new Hbar(1))
    // .setMaxQueryPayment(new Hbar(2))
    .setFunction("balanceOf", contractFunctionParameters);
  let queryResult = await contractQuery.execute(client);
  console.log("queryResult", queryResult);
  console.log("queryResult.getUint256(0)", queryResult.getUint256(0));
  console.log("formatted", queryResult.getUint256(0).toFormat());
  console.log("done");
}

async function withSDKCall(
  client: any,
  tokenAddress: string,
  accountAddress: string
) {
  console.log("-------- SDK CALL --------");
  const contractFunctionParameters =
    new ContractFunctionParameters().addAddress(
      accountAddress.replace("0x", "")
    );
  const contractId = ContractId.fromSolidityAddress(tokenAddress);
  const contractTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(30000)
    .setFunction("balanceOf", contractFunctionParameters)
    .execute(client);
  const record = await contractTx.getRecord(client);
  console.log(record?.contractFunctionResult?.getUint256(0));
  console.log("done");
}

// This doesn't work on mainnet/testnet
// We think it's because "hethers" library sets an artificial limit of 2 HBAR
// per txn execution, and AccountBalanceQuery on HTS is ~$0.50.
// Basically now that HBAR price is lower, can't satisfy this HTS fee
// with upper limit of 2 HBAR.
async function withHethers(tokenAddress: string, accountAddress: string) {
  console.log("-------- HETHERS --------");
  const eoaAccount = {
    account: OPERATOR_ID,
    privateKey: OPERATOR_KEY,
    isED25519Type: false,
  };
  const provider = hethers.providers.getDefaultProvider(NETWORK);
  const wallet = new hethers.Wallet(
    // @ts-ignore
    eoaAccount,
    provider
  );
  // @ts-ignore
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function transfer(address to, uint amount) returns (bool)",
  ];
  const hbarx = new hethers.Contract(tokenAddress, abi, wallet);
  let balance = await hbarx.balanceOf(accountAddress, {
    gasLimit: 30000,
  });
  console.log("balance", balance);
  console.log("formatted", hethers.utils.formatHbar(balance));
  console.log("done");
}

void main();
