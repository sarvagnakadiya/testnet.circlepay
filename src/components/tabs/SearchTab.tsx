import React, { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { PublicClient } from "viem";
import { Search, ArrowUpDown } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { AllowedChainIds, initializeClient } from "@/app/utils/publicClient";
import TransactionCard from "@/components/shared/TransactionCard";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";

const SearchTransactions: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sender, setSender] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [initiator, setInitiator] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "executed" | "notExecuted"
  >("all");
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string>("");
  const clientRef = useRef<PublicClient | null>(null);

  const { handleExecute } = useTransactionExecution({
    setIsParticipating,
    setProcessingId,
    clientRef,
  });

  useEffect(() => {
    if (chainId) {
      console.log(chainId);
      const newClient = initializeClient(chainId as AllowedChainIds);
      clientRef.current = newClient as PublicClient;
    }
  }, [chainId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let query = "/api/transactions?";
      if (sender) query += `sender=${sender}&`;
      if (receiver) query += `receiver=${receiver}&`;
      if (initiator) query += `initiator=${initiator}&`;
      if (statusFilter !== "all")
        query += `status=${statusFilter === "notExecuted" ? "false" : "true"}`;

      const response = await fetch(query);
      if (!response.ok) throw new Error("Error fetching transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: "all" | "executed" | "notExecuted") => {
    setStatusFilter(status);
  };

  const SearchInput = ({
    value,
    onChange,
    placeholder,
    label,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    label: string;
  }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none placeholder-gray-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Search Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Transaction Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SearchInput
              label="Sender Address"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Enter sender address"
            />
            <SearchInput
              label="Receiver Address"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Enter receiver address"
            />
            {/* <SearchInput
              label="Initiator Address"
              value={initiator}
              onChange={(e) => setInitiator(e.target.value)}
              placeholder="Enter initiator address"
            /> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {["all", "executed", "notExecuted"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      statusFilter === status
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status === "executed"
                      ? "Executed"
                      : "Pending"}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={fetchTransactions}
              className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 min-w-[120px]"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ArrowUpDown className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {transactions.map((transaction) => (
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
    </div>
  );
};

export default SearchTransactions;
