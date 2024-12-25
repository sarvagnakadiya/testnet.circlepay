import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req: Request) {
  return new ImageResponse(
    (
      <div style={{ display: "flex" }}>
        <h1>Hello</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
