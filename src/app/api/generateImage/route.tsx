import { ImageResponse } from "@vercel/og";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection
const uri = process.env.NEXT_PUBLIC_MONGODB_URI || "";
const client = new MongoClient(uri);
const dbName = "transferData";
const collectionName = "Transactions";

const fetchTransaction = async (id: string) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const objectId = new ObjectId(id);
  const transactions = await collection.find({ _id: objectId }).toArray();
  return transactions[0];
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing transaction ID", { status: 400 });
    }

    const transaction = await fetchTransaction(id);

    if (!transaction) {
      return new Response("Transaction not found", { status: 404 });
    }

    const getChainDetails = (chainId: number) => {
      switch (chainId) {
        case 84532:
          return { name: "Base Sepolia" };
        case 11155420:
          return { name: "Optimism Sepolia" };
        case 421614:
          return { name: "Arbitrum Sepolia" };
        case 11155111:
          return { name: "Sepolia" };
        default:
          return { name: `Chain ${chainId}` };
      }
    };

    const formatAddress = (address: string) =>
      `${address.slice(0, 6)}...${address.slice(-4)}`;

    const formatAmount = (amount: string | number) =>
      (Number(amount) / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom right, #1e293b, #0f172a)",
            color: "white",
            padding: "40px",
            position: "relative",
          }}
        >
          {/* Brand Header */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              CirclePay
            </div>
          </div>

          {/* Main Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              width: "80%",
              maxWidth: "900px",
            }}
          >
            {/* Chain Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                }}
              >
                {getChainDetails(transaction.chainId).name}
              </div>
              {transaction.chainId !== transaction.destinationChain && (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                      padding: "12px 24px",
                      borderRadius: "999px",
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      color: "#60a5fa",
                    }}
                  >
                    {getChainDetails(transaction.destinationChain).name}
                  </div>
                </>
              )}
            </div>

            {/* Amount */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {formatAmount(transaction.amount)} USDC
              </div>
            </div>

            {/* Transaction Details */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "24px 32px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "16px" }}>From</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "20px",
                    color: "#e2e8f0",
                  }}
                >
                  {formatAddress(transaction.sender)}
                </span>
              </div>

              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "16px" }}>To</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "20px",
                    color: "#e2e8f0",
                  }}
                >
                  {formatAddress(transaction.receiver)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Powered by CirclePay
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
