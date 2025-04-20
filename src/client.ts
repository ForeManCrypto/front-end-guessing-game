import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';


//testnet
const RPC_ENDPOINT = 'http://localhost:3001';
const REST_ENDPOINT = 'https://lcd-testnet.shareri.ng';
const CHAIN_ID = 'ShareRing-KUD';
const CONTRACT_ADDRESS = 'shareledger1hyja4uyjktpeh0fxzuw2fmjudr85rk2qu98fa6nuh6d4qru9l0sscg22hg';

// mainnet
//const RPC_ENDPOINT = 'https://rpc.explorer.shareri.ng';
//const REST_ENDPOINT = 'https://lcd.explorer.shareri.ng';
//const CHAIN_ID = 'ShareRing-VoyagerNet';
//const CONTRACT_ADDRESS = 'shareledger157ls6j2f4u5sze23l4mlcasdys48qz97rhlytexhwumqdmwuf2pq8vrs2y';


export const config = {
  chainId: 'ShareRing-KUD', // Replace with actual Shareledger chain ID (e.g., shareledger-testnet-1)
  rpcEndpoint: 'http://localhost:3001', // Replace with actual Shareledger RPC
  prefix: 'shareledger', // Address prefix for Shareledger
  denom: 'nshr', // Micro-SHR (10^-6 SHR)
  gasPrice: GasPrice.fromString('0.025nshr'), // Adjust based on network
};


export async function connectWallet() {
   if (!window.keplr) {
         throw new Error('Please install Keplr extension');
     }

  const chainInfo = {
    chainId: CHAIN_ID,
    chainName: 'Shareledger Public Testnet',
    rpc: RPC_ENDPOINT,
    rest: REST_ENDPOINT,
    stakeCurrency: {
      coinDenom: 'shr',
      coinMinimalDenom: 'nshr',
      coinDecimals: 9,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'shareledger',
      bech32PrefixAccPub: 'shareledgerpub',
      bech32PrefixValAddr: 'shareledgervaloper',
      bech32PrefixValPub: 'shareledgervaloperpub',
      bech32PrefixConsAddr: 'shareledgervalcons',
      bech32PrefixConsPub: 'shareledgervalconspub',
    },
    currencies: [
      {
        coinDenom: 'shr',
        coinMinimalDenom: 'nshr',
        coinDecimals: 9,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'shr',
        coinMinimalDenom: 'nshr',
        coinDecimals: 9,
        gasPriceStep: {
          low: 30000,
          average: 40000,
          high: 50000,
        },
      },
    ],
    features: ['cosmwasm'],
  };

  try {
    await window.keplr.experimentalSuggestChain(chainInfo);
    await window.keplr.enable(CHAIN_ID);
} catch (error) {
    console.error('Keplr connection error:', error);
    throw new Error(`Failed to connect to Keplr: ${(error as Error).message}`);
}

const offlineSigner = window.keplr.getOfflineSigner(CHAIN_ID);
const accounts = await offlineSigner.getAccounts();

const client = await SigningCosmWasmClient.connectWithSigner(
    RPC_ENDPOINT,
    offlineSigner,
    {
        gasPrice: GasPrice.fromString('40000nshr'), // Matches 'average' gasPriceStep
    }
);

return { client, address: accounts[0].address };
}

export { CONTRACT_ADDRESS };