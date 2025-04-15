// src/keplr.d.ts
interface Keplr {
    enable(chainIds: string | string[]): Promise<void>;
    experimentalSuggestChain(chainInfo: any): Promise<void>; // Add this line
    getOfflineSigner(chainId: string): any; // You can refine this type later
}

interface Window {
    keplr: Keplr;
}