"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const openai_1 = __importDefault(require("openai"));
const env_1 = require("./config/env");
const system_1 = require("./prompts/system");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const openai = new openai_1.default({ apiKey: env_1.ENV.OPENAI_API_KEY });
const conversations = new Map();
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.post("/api/football-chat", async (req, res) => {
    const message = (req.body?.message ?? "").toString().trim();
    const sessionId = req.body?.sessionId ?? "default";
    if (!message)
        return res.status(400).json({ error: "message is required" });
    try {
        // Get or create conversation history for this session
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, [
                { role: "system", content: system_1.footySystemPrompt }
            ]);
        }
        const conversationHistory = conversations.get(sessionId);
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
            model: "gpt-4",
            temperature: 0.3,
            messages: conversations.get(sessionId)
        });
        const reply = completion.choices[0]?.message?.content ?? "";
        // Add assistant response to conversation history
        conversations.get(sessionId).push({ role: "assistant", content: reply });
        res.json({ reply });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get reply" });
    }
});
// Endpoint to clear conversation history
app.post("/api/football-chat/clear", (req, res) => {
    const sessionId = req.body?.sessionId ?? "default";
    if (conversations.has(sessionId)) {
        conversations.delete(sessionId);
        res.json({ success: true, message: "Conversation history cleared" });
    }
    else {
        res.json({ success: true, message: "No conversation history to clear" });
    }
});
app.listen(env_1.ENV.PORT, () => {
    console.log(`API listening on http://localhost:${env_1.ENV.PORT}`);
});
