import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
} from "@wagmi/core/chains";
import { http } from "viem";
import { createConfig } from "wagmi";

export const config = createConfig({
  chains: [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
  ssr: true,
});
