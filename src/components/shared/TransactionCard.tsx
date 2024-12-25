import React, { useState } from "react";
import {
  ArrowRight,
  Wallet,
  Loader2,
  Play,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import { getEtherscanBaseUrl } from "@/app/utils/contractAddresses";

interface TransactionCardProps {
  transaction: Transaction;
  isParticipating: boolean;
  processingId: string;
  handleExecute: (transaction: Transaction) => void;
  address?: string;
  chainId?: number;
}

const getChainDetails = (chainId: number) => {
  switch (chainId) {
    case 84532:
      return {
        image: "/images/base.svg",
        name: "Base Sepolia",
      };
    case 11155420:
      return {
        image: "/images/optimism.svg",
        name: "Optimism Sepolia",
      };
    case 421614:
      return {
        image: "/images/arbitrum.svg",
        name: "Arbitrum Sepolia",
      };
    case 11155111:
      return {
        image: "/images/ethereum.svg",
        name: "Sepolia",
      };
    default:
      return {
        image: "/images/ethereum.svg",
        name: `Chain ${chainId}`,
      };
  }
};

const getRelativeTime = (date: string | number) => {
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now.getTime() - past.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 365) {
    return `${Math.floor(diffDays / 365)}y ago`;
  } else if (diffDays > 30) {
    return `${Math.floor(diffDays / 30)}mo ago`;
  } else if (diffDays > 7) {
    return `${Math.floor(diffDays / 7)}w ago`;
  } else if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return "just now";
  }
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  isParticipating,
  processingId,
  handleExecute,
  address,
  chainId,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<{
    [key: string]: boolean;
  }>({});

  const formatAddress = (address: string) => {
    if (!address) return "N/A";
    const first = address.substring(0, 6);
    const last = address.slice(-4);
    return `${first}...${last}`;
  };

  const formatAmount = (amount: string | number) => {
    return (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 4,
    });
  };

  const handleCopyAddress = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress((prev) => ({
        ...prev,
        [type]: true,
      }));
      setTimeout(() => {
        setCopiedAddress((prev) => ({
          ...prev,
          [type]: false,
        }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200
        ${
          processingId === transaction._id
            ? "ring-2 ring-blue-500"
            : "hover:shadow-md"
        }`}
    >
      <div className="p-6 space-y-6">
        {/* Header with chains */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <img
                src={getChainDetails(transaction.chainId).image}
                alt={getChainDetails(transaction.chainId).name}
                className="w-4 h-4"
              />
              {getChainDetails(transaction.chainId).name}
            </div>
            {transaction.chainId !== transaction.destinationChain && (
              <>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <img
                    src={getChainDetails(transaction.destinationChain).image}
                    alt={getChainDetails(transaction.destinationChain).name}
                    className="w-4 h-4"
                  />
                  {getChainDetails(transaction.destinationChain).name}
                </div>
              </>
            )}
          </div>
          <time className="text-sm text-gray-500">
            {getRelativeTime(transaction.initiateDate)}
          </time>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* From Address */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Wallet className="w-5 h-5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 mb-1">From</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-medium text-gray-900 truncate">
                    {formatAddress(transaction.sender)}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        handleCopyAddress(transaction.sender, "sender")
                      }
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress["sender"] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {transaction.sender === address && (
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* To Address */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Wallet className="w-5 h-5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 mb-1">To</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-medium text-gray-900 truncate">
                    {formatAddress(transaction.receiver)}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        handleCopyAddress(transaction.receiver, "receiver")
                      }
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress["receiver"] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {transaction.receiver === address && (
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amount and Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatAmount(transaction.amount)}
              </span>
              <span className="text-gray-500">USDC</span>
            </div>
          </div>

          {/* Show Execute or View on Etherscan based on transaction status */}
          {!transaction.executed ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleExecute(transaction)}
                disabled={isParticipating}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-all
                  ${
                    isParticipating && processingId === transaction._id
                      ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  }`}
              >
                {isParticipating && processingId === transaction._id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Execute
                  </span>
                )}
              </button>

              <a
                href={`https://warpcast.com/~/compose?text=Hey%20frens%2C%20feeling%20generous%20today%3F%20Sponsor%20my%20USDC%20transfer%20and%20join%20the%20Circle%20of%20Legends%E2%84%A2.%20Your%20kindness%20might%20just%20get%20you%20a%20seat%20at%20the%20cool%20table!%20%F0%9F%98%8E%F0%9F%92%B8&embeds[]=${window.location.origin}/api/share/${transaction._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                title="Share on Farcaster"
              >
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          ) : transaction.transactionHash ? (
            <a
              href={`${getEtherscanBaseUrl(transaction.chainId)}/tx/${
                transaction.transactionHash
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              View on Explorer
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
