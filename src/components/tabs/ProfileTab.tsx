import React, { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { PublicClient } from "viem";
import { Clock, Wallet, Copy, CheckCircle } from "lucide-react";
import { Transaction } from "@/types/transaction";
import blockies from "blockies-ts";
import TransactionCard from "@/components/shared/TransactionCard";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { AllowedChainIds, initializeClient } from "@/app/utils/publicClient";

const ProfileTab: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "pending" | "executed">("all");
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const clientRef = useRef<PublicClient | null>(null);

  const { handleExecute } = useTransactionExecution({
    setIsParticipating,
    setProcessingId,
    clientRef,
  });

  useEffect(() => {
    if (chainId) {
      const newClient = initializeClient(chainId as AllowedChainIds);
      clientRef.current = newClient as PublicClient;
    }
  }, [chainId]);

  const fetchUserTransactions = async () => {
    setLoading(true);
    try {
      const query = `/api/transactions?userAddress=${address}`;
      const response = await fetch(query);
      if (!response.ok) throw new Error("Error fetching transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) fetchUserTransactions();
  }, [address]);

  const formatAddress = (address: string) => {
    if (!address) return "N/A";
    const first = address.substring(0, 6);
    const last = address.slice(-4);
    return `${first}...${last}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) =>
          filter === "pending" ? !tx.executed : tx.executed
        );

  const blockiesImage = blockies
    .create({ seed: address || "", size: 8, scale: 8 })
    .toDataURL();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Transactions
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage your past transactions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                id: "all",
                label: "All",
                count: transactions.length,
                className: "bg-gray-50 text-gray-700 hover:bg-gray-100",
              },
              {
                id: "pending",
                label: "Pending",
                count: transactions.filter((tx) => !tx.executed).length,
                icon: <Clock className="w-5 h-5" />,
                className: "bg-blue-50 text-blue-700 hover:bg-blue-100",
              },
              {
                id: "executed",
                label: "Executed",
                count: transactions.filter((tx) => tx.executed).length,
                icon: <CheckCircle className="w-5 h-5" />,
                className: "bg-green-50 text-green-700 hover:bg-green-100",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all
                  ${item.className}
                  ${filter === item.id ? "ring-2 ring-offset-2" : ""}
                `}
              >
                {item.icon}
                <span className="font-medium">
                  {item.count} {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Section */}
        {isConnected && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <img
              src={blockiesImage}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="text-sm text-gray-500">Your Address</p>
              <div className="flex items-center gap-2">
                <code className="font-mono font-medium text-gray-900">
                  {formatAddress(address || "")}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connection Warning */}
        {!isConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
            <Wallet className="w-5 h-5" />
            <p>
              Please connect your wallet to view and manage your transactions.
            </p>
          </div>
        )}

        {/* Transaction List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-500">
              You haven't initiated or received any transactions yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTransactions
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

export default ProfileTab;
