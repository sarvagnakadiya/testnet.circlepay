import { useAccount, useWriteContract } from "wagmi";
import { Address, pad, PublicClient } from "viem";
import { useRef } from "react";
import { AllowedChainIds } from "@/app/utils/publicClient";
import contractABI from "@/usdc.json";
import circlePayABI from "@/CirclePay.json";
import {
  CIRCLEPAY_BASE,
  getContractAddress,
} from "@/app/utils/contractAddresses";
import { Transaction } from "@/types/transaction";

interface UseTransactionExecutionProps {
  setIsParticipating: (value: boolean) => void;
  setProcessingId: (value: string) => void;
  clientRef: React.RefObject<PublicClient | null>;
}

export const useTransactionExecution = ({
  setIsParticipating,
  setProcessingId,
  clientRef,
}: UseTransactionExecutionProps) => {
  const { writeContractAsync } = useWriteContract();
  const { address, isConnected, chainId } = useAccount();

  const handleTransfer = async (
    from: string,
    to: string,
    value: string | number,
    nonce: number,
    sign: string,
    validAfter: number,
    validBefore: number,
    transactionId: string
  ) => {
    console.log("same chain transfer: calling transferWithAuthorization");
    if (!isConnected) {
      alert("Please connect your account to participate.");
      return;
    }

    setProcessingId(transactionId);
    const validateAddress = (address: string): `0x${string}` => {
      return address.startsWith("0x")
        ? (address as `0x${string}`)
        : (`0x${address}` as `0x${string}`);
    };

    try {
      if (!clientRef.current) {
        alert("Client not initialized. Please try again.");
        return;
      }
      setIsParticipating(true);

      const tx = await writeContractAsync({
        address: (await getContractAddress(
          chainId as AllowedChainIds
        )) as Address,
        account: address,
        abi: contractABI,
        functionName: "transferWithAuthorization",
        args: [
          from,
          to,
          value,
          validAfter,
          validBefore,
          pad(validateAddress(nonce.toString())),
          sign,
        ],
      });

      const receipt = await clientRef.current.waitForTransactionReceipt({
        hash: tx,
      });

      if (receipt) {
        await fetch("/api/execute", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
            transactionHash: receipt.transactionHash,
          }),
        });
        setIsParticipating(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error participating:", error);
    } finally {
      setIsParticipating(false);
      setProcessingId("");
    }
  };

  const handleCrossChainTransfer = async (
    from: string,
    to: string,
    value: string | number,
    nonce: number,
    sign: string,
    validAfter: number,
    validBefore: number,
    destinationChain: number,
    transactionId: string
  ) => {
    console.log("doing crosschain");
    if (!isConnected) {
      alert("Please connect your account to participate.");
      return;
    }

    setProcessingId(transactionId);
    const validateAddress = (address: string): `0x${string}` => {
      return address.startsWith("0x")
        ? (address as `0x${string}`)
        : (`0x${address}` as `0x${string}`);
    };

    try {
      if (!clientRef.current) {
        alert("Client not initialized. Please try again.");
        return;
      }
      setIsParticipating(true);

      const tx = await writeContractAsync({
        address: CIRCLEPAY_BASE,
        account: address,
        abi: circlePayABI.abi,
        functionName: "transferUsdcCrossChain",
        args: [
          from,
          value,
          validAfter,
          validBefore,
          pad(validateAddress(nonce.toString())),
          sign,
          destinationChain,
          to,
        ],
      });

      const receipt = await clientRef.current.waitForTransactionReceipt({
        hash: tx,
      });

      if (receipt) {
        await fetch("/api/execute", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
            transactionHash: receipt.transactionHash,
          }),
        });
        setIsParticipating(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error participating:", error);
    } finally {
      setIsParticipating(false);
      setProcessingId("");
    }
  };

  const handleExecute = (transaction: Transaction) => {
    console.log("handleExecute");
    console.log(transaction.chainId);
    console.log(transaction.destinationChain);
    if (transaction.chainId != transaction.destinationChain) {
      console.log("cross chain transfer");
      handleCrossChainTransfer(
        transaction.sender,
        transaction.receiver,
        transaction.amount,
        transaction.nonce,
        transaction.sign,
        transaction.validAfter,
        transaction.validBefore,
        transaction.destinationChain,
        transaction._id
      );
    } else {
      handleTransfer(
        transaction.sender,
        transaction.receiver,
        transaction.amount,
        transaction.nonce,
        transaction.sign,
        transaction.validAfter,
        transaction.validBefore,
        transaction._id
      );
    }
  };

  return { handleExecute };
};
