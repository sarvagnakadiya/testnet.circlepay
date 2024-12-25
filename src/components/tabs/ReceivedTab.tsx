import React, { useEffect, useState, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Address, pad, PublicClient } from "viem";
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  Wallet,
  Loader2,
  CheckCircle,
  Play,
  Share2,
} from "lucide-react";

import contractABI from "@/usdc.json";
import { AllowedChainIds, initializeClient } from "@/app/utils/publicClient";
import {
  getContractAddress,
  getEtherscanBaseUrl,
} from "@/app/utils/contractAddresses";
import { Transaction } from "@/types/transaction";
import circlePayABI from "@/CirclePay.json";
import { CIRCLEPAY_BASE } from "@/app/utils/contractAddresses";
import TransactionCard from "@/components/shared/TransactionCard";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";

const ReceivedTab: React.FC = () => {
  const { writeContractAsync } = useWriteContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string>("");
  const { address, isConnected, chainId } = useAccount();
  const clientRef = useRef<PublicClient | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "executed">("pending");

  const pendingTransactions = transactions.filter((tx) => !tx.executed);
  const executedTransactions = transactions.filter((tx) => tx.executed);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`api/transactions?receiver=${address}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  useEffect(() => {
    if (chainId) {
      console.log(chainId);
      const newClient = initializeClient(chainId as AllowedChainIds);
      clientRef.current = newClient as PublicClient;
    }
  }, [chainId]);

  const { handleExecute } = useTransactionExecution({
    setIsParticipating,
    setProcessingId,
    clientRef,
  });

  const formatAddress = (address: string) => {
    if (!address) return "N/A"; // Return a fallback value if address is undefined
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string | number) => {
    return (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 4,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Received Transactions
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage your received transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {pendingTransactions.length} Pending
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {executedTransactions.length} Executed
              </span>
            </div>
          </div>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
            <Wallet className="w-5 h-5" />
            <p>Please connect your wallet to execute received transactions</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Transactions
          </button>
          <button
            onClick={() => setActiveTab("executed")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "executed"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Executed Transactions
          </button>
        </div>

        {/* Empty States */}
        {activeTab === "pending" && pendingTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Pending Transactions
            </h3>
            <p className="text-gray-500">
              You dont have any pending transactions to execute
            </p>
          </div>
        ) : activeTab === "executed" && executedTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Executed Transactions
            </h3>
            <p className="text-gray-500">
              You havent executed any transactions yet
            </p>
          </div>
        ) : (
          /* Transaction Grid */
          <div className="grid gap-6 md:grid-cols-2">
            {(activeTab === "pending"
              ? pendingTransactions
              : executedTransactions
            )
              .slice()
              .reverse()
              .map((transaction) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                  isParticipating={isParticipating}
                  processingId={processingId}
                  handleExecute={handleExecute}
                  address={address}
                  chainId={chainId}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedTab;
