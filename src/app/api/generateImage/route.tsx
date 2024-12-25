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
                  padding: "8px 16px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "999px",
                  color: "#60a5fa",
                }}
              >
                {getChainName(params.chainId)}
              </div>
              {params.chainId !== params.destinationChain && (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      borderRadius: "999px",
                      color: "#60a5fa",
                    }}
                  >
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
                gap: "16px",
                padding: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#94a3b8" }}>From</span>
                <span style={{ color: "#e2e8f0" }}>
                  {formatAddress(params.sender)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#94a3b8" }}>To</span>
                <span style={{ color: "#e2e8f0" }}>
                  {formatAddress(params.receiver)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#94a3b8" }}>Valid After</span>
                <span style={{ color: "#e2e8f0" }}>
                  {params.validAfter === "0"
                    ? "Immediately"
                    : new Date(
                        Number(params.validAfter) * 1000
                      ).toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#94a3b8" }}>Valid Before</span>
                <span style={{ color: "#e2e8f0" }}>
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
