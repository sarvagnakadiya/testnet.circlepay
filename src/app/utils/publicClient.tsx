import { getPublicClient } from "@wagmi/core";
import { config } from "@/app/utils/config";
import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
} from "@wagmi/core/chains";

import { type Chain } from "viem";
export const local = {
  id: 1,
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
} as const satisfies Chain;

// Define a union type of allowed chain IDs
export type AllowedChainIds =
  | typeof sepolia.id
  | typeof baseSepolia.id
  | typeof arbitrumSepolia.id
  | typeof optimismSepolia.id;

// Utility function to initialize a client for a specific chain
export const initializeClient = (chainId: AllowedChainIds) => {
  const client = getPublicClient(config, { chainId });
  return client;
};

// Example usage: initializing clients for different chains
export const initializeClientsForAllChains = () => {
  const sepoliaClient = initializeClient(sepolia.id);
  const baseClient = initializeClient(baseSepolia.id);
  const arbitrumClient = initializeClient(arbitrumSepolia.id);
  const optimismClient = initializeClient(optimismSepolia.id);

  return {
    sepoliaClient,
    baseClient,
    arbitrumClient,
    optimismClient,
  };
};
