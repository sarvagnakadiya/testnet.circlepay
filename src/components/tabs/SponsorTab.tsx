import React, { useEffect, useState, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { PublicClient } from "viem";
import { CheckCircle2, Clock, Wallet, Loader2, Search } from "lucide-react";

import { AllowedChainIds, initializeClient } from "@/app/utils/publicClient";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";

import { Transaction } from "@/types/transaction";
import TransactionCard from "@/components/shared/TransactionCard";

interface SponsorTabProps {
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const SponsorTab: React.FC<SponsorTabProps> = ({ setActiveTab }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string>("");
  const { address, isConnected, chainId } = useAccount();
  const clientRef = useRef<PublicClient | null>(null);

  const { handleExecute } = useTransactionExecution({
    setIsParticipating,
    setProcessingId,
    clientRef,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions?status=false");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Transaction[] = await response.json();
        console.log(data);
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    if (chainId) {
      console.log(chainId);
      const newClient = initializeClient(chainId as AllowedChainIds);
      clientRef.current = newClient as PublicClient;
    }
  }, [chainId]);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    setFilteredTransactions(
      transactions.filter(
        (transaction) =>
          transaction.sender.toLowerCase().includes(lowercasedTerm) ||
          transaction.receiver.toLowerCase().includes(lowercasedTerm)
      )
    );
  }, [searchTerm, transactions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string | number) => {
    return (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section with Search */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Spread Joy, Pay Their Way! 🤝
            </h1>
            <p className="text-gray-600 mt-2">
              Be the spark that lights someones day - cover their gas, make
              their transaction play ✨
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {filteredTransactions.length} Pending
            </span>
          </div>
          <div className="flex items-center bg-white shadow-sm rounded-lg px-4 py-2">
            <Search className="text-gray-400 w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search by address"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-transparent focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
            <Wallet className="w-5 h-5" />
            <p>
              Please connect your wallet to participate in transaction execution
            </p>
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Matching Transactions
            </h3>
            <p className="text-gray-500">
              Try a different address or check back later.
            </p>
            <button
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 my-4"
              onClick={() => setActiveTab(3)}
            >
              {" "}
              Send Token
            </button>
          </div>
        ) : (
          /* Transaction Grid */
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

export default SponsorTab;
