import hardhat from "hardhat";
import { SignerWithAddress } from "hardhat-hethers/internal/signers";
import * as hethers from "@hashgraph/hethers";
import { BigNumber, Contract } from "@hashgraph/hethers";
import { Utils } from "../utils/utils";
import { expect } from "chai";
import expectTx from "../utils/LogAssertion";
import getExpiry = Utils.getExpiry;
require("dotenv").config();

const createHTS = require("../scripts/utilities/create-hts");
const deployHeliSwap = require("../scripts/deploy");
const deployMintERC20 = require("../scripts/utilities/deploy-mint-erc20");

const ERC20 = "contracts/core/interfaces/IERC20.sol:IERC20";
const PAIR = "contracts/core/interfaces/IUniswapV2Pair.sol:IUniswapV2Pair";

const TOKEN_A_NAME = "TokenA";
const TOKEN_A_SYMBOL = "TA";
const TOKEN_B_NAME = "TokenB";
const TOKEN_B_SYMBOL = "TB";
const ERC20_NAME = "erc20Token";
const ERC20_SYMBOL = "ERC";
const ERC20_DECIMALS = 18;
const HTS_DECIMALS = 8;

describe("HBARX Tests", function () {
  it("log HBARX balance", async function () {
    // @ts-ignore
    const provider = hethers.providers.getDefaultProvider("mainnet");
    const wallet = new hethers.Wallet(
      // @ts-ignore
      process.env.HEDERA_DEV_ECDSA_PRIVATE_KEY,
      provider
    );
    const signer = wallet.connectAccount(
      // @ts-ignore
      process.env.HEDERA_DEV_ECDSA_ACCOUNT_ID
    );

    // @ts-ignore
    const address = "0x00000000000000000000000000000000000cba44"; // <- HBARX
    const abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
    ];
    const hbarx = new hethers.Contract(address, abi, signer);

    const balance = await hbarx.balanceOf(signer.address, {
      gasLimit: 30000,
    });
    console.log("balance", balance);
    console.log("formatted", hethers.utils.formatHbar(balance));
  });
});
