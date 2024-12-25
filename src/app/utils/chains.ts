export function getChainName(chainId: number): string {
  switch (chainId) {
    case 1:
      return "Ethereum";
    case 10:
      return "Optimism";
    case 100:
      return "Gnosis";
    case 137:
      return "Polygon";
    case 8453:
      return "Base";
    case 42161:
      return "Arbitrum One";
    case 42170:
      return "Arbitrum Nova";
    case 84532:
      return "Base Sepolia";
    case 421614:
      return "Arbitrum Sepolia";
    case 7777777:
      return "Zora";
    case 11155111:
      return "Sepolia";
    case 11155420:
      return "Optimism Sepolia";
    case 666666666:
      return "PGN";
    default:
      return `Chain ${chainId}`;
  }
}
