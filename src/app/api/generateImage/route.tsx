/* eslint-disable @next/next/no-img-element */
import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { getChainName } from "@/app/utils/chains";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base64Params = searchParams.get("params");
    let params: any;

    if (base64Params) {
      const jsonParams = Buffer.from(base64Params, "base64").toString("utf-8");
      params = JSON.parse(jsonParams);
    } else {
      throw new Error("Params not found in the URL");
    }

    // Format amount (USDC has 6 decimals)
    const formattedAmount = (Number(params.amount) / 1_000_000).toLocaleString(
      "en-US",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );

    // Format addresses
    const formatAddress = (address: string) =>
      `${address.slice(0, 6)}...${address.slice(-4)}`;

    // Chain images with absolute URLs
    const chainImages: { [key: string]: string } = {
      "11155111": new URL("/images/ethereum.svg", request.url).toString(),
      "80001": new URL("/images/polygon.svg", request.url).toString(),
      "421614": new URL("/images/arbitrum.svg", request.url).toString(),
      "84532": new URL("/images/base.svg", request.url).toString(),
    };

    // Fetch all required images first
    const sourceChainImage = await fetch(chainImages[params.chainId])
      .then((res) => res.arrayBuffer())
      .then(
        (buffer) =>
          `data:image/svg+xml;base64,${Buffer.from(buffer).toString("base64")}`
      );

    let destinationChainImage;
    if (params.chainId !== params.destinationChain) {
      destinationChainImage = await fetch(chainImages[params.destinationChain])
        .then((res) => res.arrayBuffer())
        .then(
          (buffer) =>
            `data:image/svg+xml;base64,${Buffer.from(buffer).toString(
              "base64"
            )}`
        );
    }

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            backgroundColor: "#0f172a",
            display: "flex",
            flexDirection: "column",
            padding: "48px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                color: "#60a5fa",
              }}
            >
              CirclePay
            </div>
            <div
              style={{
                fontSize: "16px",
                color: "#64748b",
              }}
            >
              Gasless USDC Transfers
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "32px",
            }}
          >
            {/* Amount */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: "72px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              {formattedAmount} USDC
            </div>

            {/* Chain Info */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "999px",
                  color: "#60a5fa",
                }}
              >
                <img
                  src={sourceChainImage}
                  alt={getChainName(params.chainId)}
                  width={24}
                  height={24}
                />
                {getChainName(params.chainId)}
              </div>
              {params.chainId !== params.destinationChain && (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      borderRadius: "999px",
                      color: "#60a5fa",
                    }}
                  >
                    <img
                      src={destinationChainImage}
                      alt={getChainName(params.destinationChain)}
                      width={24}
                      height={24}
                    />
                    {getChainName(params.destinationChain)}
                  </div>
                </>
              )}
            </div>

            {/* Transaction Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "32px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* From -> To Flow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flex: 1,
                  }}
                >
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                    From
                  </span>
                  <span
                    style={{
                      color: "#e2e8f0",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      padding: "12px 20px",
                      borderRadius: "12px",
                    }}
                  >
                    {formatAddress(params.sender)}
                  </span>
                </div>

                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 5l7 7-7 7"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flex: 1,
                  }}
                >
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>To</span>
                  <span
                    style={{
                      color: "#e2e8f0",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      padding: "12px 20px",
                      borderRadius: "12px",
                    }}
                  >
                    {formatAddress(params.receiver)}
                  </span>
                </div>
              </div>

              {/* Expiry */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: "12px 20px",
                  borderRadius: "12px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: "#ef4444" }}>
                  Expires:{" "}
                  {new Date(Number(params.validBefore) * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "40px",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Powered by CirclePay
            </div>
            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Gasless • Secure • Cross-chain
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error: any) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({
        message: "Error generating image",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
