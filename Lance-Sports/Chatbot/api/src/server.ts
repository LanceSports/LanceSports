import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { ENV } from "./config/env";
import { footySystemPrompt } from "./prompts/system";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

// In-memory conversation storage (in production, use a database)
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversations = new Map<string, ChatMessage[]>();

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.post("/api/football-chat", async (req, res) => {
  const message: string = (req.body?.message ?? "").toString().trim();
  const sessionId: string = req.body?.sessionId ?? "default";
  
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    // Get or create conversation history for this session
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [
        { role: "system", content: footySystemPrompt }
      ]);
    }
    
    const conversationHistory = conversations.get(sessionId)!;
    
    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: message });
    
    // Limit conversation history to last 20 messages to manage token usage
    const maxMessages = 20;
    if (conversationHistory.length > maxMessages) {
      // Keep system message and last maxMessages-1 messages
      const systemMessage = conversationHistory[0];
      const recentMessages = conversationHistory.slice(-(maxMessages - 1));
      conversations.set(sessionId, [systemMessage, ...recentMessages]);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5" //"gpt-4" for development, gpt-5 for prod,
      temperature: 0.3,
      messages: conversations.get(sessionId)!
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    
    // Add assistant response to conversation history
    conversations.get(sessionId)!.push({ role: "assistant", content: reply });
    
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get reply" });
  }
});

// Endpoint to clear conversation history
app.post("/api/football-chat/clear", (req, res) => {
  const sessionId: string = req.body?.sessionId ?? "default";
  
  if (conversations.has(sessionId)) {
    conversations.delete(sessionId);
    res.json({ success: true, message: "Conversation history cleared" });
  } else {
    res.json({ success: true, message: "No conversation history to clear" });
  }
});

app.listen(ENV.PORT, () => {
  console.log(`API listening on http://localhost:${ENV.PORT}`);
});
