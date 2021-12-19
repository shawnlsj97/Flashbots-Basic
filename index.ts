import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { BigNumber, providers, Wallet } from "ethers";

const CHAIN_ID = 5;
const provider = new providers.InfuraProvider(CHAIN_ID);
const FLASHBOTS_ENDPOINT = "https://relay-goerli.flashbots.net";
if (process.env.WALLET_PRIVATE_KEY === undefined) {
    console.error("Please provide WALLET_PRIVATE_KEY env");
    process.exit(1);
}
const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, provider);

const GWEI = BigNumber.from(10).pow(9);
const ETHER = BigNumber.from(10).pow(18);

async function main() {
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, Wallet.createRandom(), FLASHBOTS_ENDPOINT);
    provider.on('block', async (blockNumber) => {
        console.log(blockNumber);
        const bundleSubmitResponse = await flashbotsProvider.sendBundle(
            [
                {
                    transaction: {
                        chainId: CHAIN_ID,
                        type: 2,
                        value: ETHER.div(100).mul(3),
                        data: "0x1249c58b",
                        maxFeePerGas: GWEI.mul(3),
                        maxPriorityFeePerGas: GWEI.mul(2),
                        to: "0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D"
                    },
                    signer: wallet
                }
            ], blockNumber + 1 
        )
        if ('error' in bundleSubmitResponse) {
            console.log(bundleSubmitResponse.error.message);
            return
        }
        console.log(await bundleSubmitResponse.simulate())
    })
}

main();