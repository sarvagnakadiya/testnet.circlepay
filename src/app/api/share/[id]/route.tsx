/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection
const uri =
  process.env.NEXT_PUBLIC_MONGODB_URI || "your_mongodb_connection_string";
const client = new MongoClient(uri);
const dbName = "transferData";
const collectionName = "Transactions";

const app = new Frog({
  basePath: "/api/share",
  title: "Frog Frame",
});

const fetchTransactions = async (id: string) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Fetch transactions matching the query
  const objectId = new ObjectId(id);
  const transactions = await collection.find({ _id: objectId }).toArray();
  // console.log(transactions);
  return transactions[0];
};

// Frame route that uses a document ID from the URL
app.frame("/:id", async (c) => {
  const id = c.req.param();
  const txObj = await fetchTransactions(id.id);

  const params = {
    sender: txObj.sender,
    receiver: txObj.receiver,
    amount: txObj.amount,
    chainId: txObj.chainId,
    destinationChain: txObj.destinationChain,
    validAfter: txObj.validAfter,
    validBefore: txObj.validBefore,
  };

  const jsonParams = JSON.stringify(params);
  const base64Params = Buffer.from(jsonParams).toString("base64");

  return c.res({
    image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/generateImage?params=${base64Params}`,
    intents: [
      <Button.Transaction target={`/execute/${id.id}`}>
        Execute
      </Button.Transaction>,
    ],
  });
});

export const GET = handle(app);
export const POST = handle(app);
