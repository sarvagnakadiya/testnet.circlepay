"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
} from "@wagmi/core/chains";

export const config = getDefaultConfig({
  appName: "CirclePay",
  projectId: "8a002f09d4fc6fba7c4cd6d06df5e19f",
  chains: [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia],
  ssr: true,
});
