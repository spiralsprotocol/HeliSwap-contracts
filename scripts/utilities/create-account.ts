import {AccountCreateTransaction, Client, Hbar, PublicKey} from "@hashgraph/sdk";
import {hethers} from "@hashgraph/hethers";
import {Hashgraph} from "../../utils/hashgraph";

async function createAccount(network: string, account: string, pk: string, balance: string) {
	console.log(`Creating Account at ${network} with initial HBAR balance: ${balance}`)

	const client = Hashgraph.clientFor(network).setOperator(account, pk);

	const randomWallet = hethers.Wallet.createRandom();
	const tx = await new AccountCreateTransaction()
		.setKey(PublicKey.fromString(randomWallet._signingKey().compressedPublicKey))
		.setInitialBalance(Hbar.fromString(balance))
		.execute(client);
	const getReceipt = await tx.getReceipt(client);

	console.log(`Account: ${getReceipt.accountId?.toString()}`);
	console.log(`PK: ${randomWallet._signingKey().privateKey}`);
}

module.exports = createAccount;