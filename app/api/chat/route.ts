import { NextRequest } from "next/server";
import { Client } from "@gradio/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body?.message ?? "").toString();
    if (!message.trim()) {
      return new Response(JSON.stringify({ error: "Empty message" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const client = await Client.connect("DmbOran/Assistant_Immo");
    const result = await client.predict("/predict", {
      message,
      tokens_max: 1000,
      temperature: 0.1,
      top_p: 0.1,
    } as any);

    const data: unknown = (result as any)?.data;
    const reply = Array.isArray(data) ? data[0] : data;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    console.error("/api/chat error", error);
    return new Response(
      JSON.stringify({ error: "Failed to contact assistant." }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}


