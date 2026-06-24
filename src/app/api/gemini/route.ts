import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { prompt, context, history } = await req.json();

    const systemPrompt = `You are Titan Concierge, a sophisticated private wealth intelligence architected for PayTitan's elite members.
Your tone is affluent, articulate, personal, and highly professional—similar to a high-end private banking advisor.
You manage user capital with precision.
You have access to the following user context:
${JSON.stringify({
  profile: context?.profile,
  balance: context?.balance,
  usdBalance: context?.usdBalance,
  gbpBalance: context?.gbpBalance,
  vaults: context?.vaults,
  isMerchantMode: context?.isMerchantMode,
  recent_transactions: context?.transactions,
}, null, 2)}

You can help the member by analyzing their portfolio, executing capital transfers, managing reserves (vaults), or providing tailored financial insights.

Respond with a JSON object containing three fields:
1. "success": boolean (true if you successfully parsed an action and want to proceed, false if you want to abort or report an error).
2. "message": string (your conversational response to the member, e.g., "Certainly, I've analyzed your recent liquidity flow...").
3. "actions": an array of action objects. 
Action types:
- "transfer": { type: "transfer", message: "...", data: { receiver: string, amount: number } }
- "vault_move": { type: "vault_move", message: "...", data: { vaultId: string, amount: number } }
- "merchant_toggle": { type: "merchant_toggle", message: "..." }
- "analyze": { type: "analyze", message: "..." }
- "info": { type: "info", message: "..." }
- "error": { type: "error", message: "..." }

Return ONLY the JSON. No markdown wrappers.`;

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...formattedHistory,
        { role: "user", parts: [{ text: `User request: ${prompt}` }] }
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "I apologize, but I've encountered a temporary error. " + error.message,
        actions: [],
      },
      { status: 500 }
    );
  }
}
