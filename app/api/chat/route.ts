import { createClient } from "@/lib/supabase/server";
import { streamText, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Chat API Received:", JSON.stringify(body, null, 2));
    const { messages } = body;

    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch user context from Supabase
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user.id);

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id);

    // Build the system prompt with the user's data
    const systemPrompt = `
      You are Ownly, an intelligent, helpful, and highly capable personal finance and inventory assistant.
      The user is asking you questions about their data. Be concise, polite, and helpful. 
      Format your responses with clear markdown, bullet points, and bold text where appropriate to make it easy to read.

      Here is the user's current database context:

      === PURCHASES ===
      ${JSON.stringify(purchases, null, 2)}

      === SUBSCRIPTIONS ===
      ${JSON.stringify(subscriptions, null, 2)}

      If the user asks a question about their spending, subscriptions, or warranties, use this data to answer accurately. 
      If the data is empty, politely inform them that they have not added any items yet.
    `;

    const coreMessages = (messages || []).map((m: any) => {
      let content = m.content;
      if (m.parts && Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n');
      }
      return {
        role: m.role,
        content: content || '',
      };
    });

    const result = streamText({
      model: google('gemini-pro-latest'),
      messages: coreMessages,
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
