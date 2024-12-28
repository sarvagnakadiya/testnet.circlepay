import { Address, createPublicClient, http, namehash } from "viem";
import { base } from "viem/chains";
import { useAccount } from "wagmi";

// Constants
const BASENAME_L2_RESOLVER_ADDRESS =
  "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";

const L2ResolverAbi = [
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Create Base client
const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Convert address to reverse node
const convertReverseNodeToBytes = (
  address: string,
  chainId: number
): string => {
  const reverseNode = `${address.toLowerCase().slice(2)}.addr.reverse`;
  return namehash(reverseNode);
};

export const useBasenameResolver = () => {
  const { chainId } = useAccount();

  const isBaseChain = (): boolean => {
    return chainId === base.id;
  };

  const resolveBasename = async (address: Address): Promise<string | null> => {
    // Only proceed if we're on Base chain
    if (!isBaseChain()) {
      console.log("Basename resolution only available on Base chain");
      return null;
    }

    try {
      const addressReverseNode = convertReverseNodeToBytes(address, base.id);
      const basename = await baseClient.readContract({
        abi: L2ResolverAbi,
        address: BASENAME_L2_RESOLVER_ADDRESS,
        functionName: "name",
        args: [addressReverseNode as Address],
      });

      return basename as string;
    } catch (error) {
      console.error("Error resolving Basename:", error);
      return null;
    }
  };

  const resolveAddress = async (basename: string): Promise<Address | null> => {
    // Only proceed if we're on Base chain
    if (!isBaseChain()) {
      console.log("Basename resolution only available on Base chain");
      return null;
    }

    try {
      // Implementation for reverse lookup (basename to address)
      // This would depend on the specific contract implementation
      return null;
    } catch (error) {
      console.error("Error resolving address from Basename:", error);
      return null;
    }
  };

  return {
    resolveBasename,
    resolveAddress,
  };
};
