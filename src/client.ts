import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';


//testnet
export const RPC_ENDPOINT = process.env.REACT_APP_RPC_URL || '/api/proxy';
const REST_ENDPOINT = 'https://lcd-testnet.shareri.ng';
const CHAIN_ID = 'ShareRing-KUD';
const CONTRACT_ADDRESS = 'shareledger1g4xlpqy29m50j5y69reguae328tc9y83l4299pf2wmjn0xczq5jscm4x5r';

// mainnet
//const RPC_ENDPOINT = 'https://rpc.explorer.shareri.ng';
//const REST_ENDPOINT = 'https://lcd.explorer.shareri.ng';
//const CHAIN_ID = 'ShareRing-VoyagerNet';
//const CONTRACT_ADDRESS = 'shareledger157ls6j2f4u5sze23l4mlcasdys48qz97rhlytexhwumqdmwuf2pq8vrs2y';


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