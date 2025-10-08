import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import { systemPrompt } from "./prompts/system";
import { DeepSeekService } from "./services/deepseek";

const app = express();
app.use(cors());
app.use(express.json());

const deepseek = new DeepSeekService(ENV.DEEPSEEK_API_KEY);

app.post("/api/chat", async (req, res) => {
  const message: string = (req.body?.message ?? "").toString().trim();
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const response = await deepseek.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]);

    res.json({ reply: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get reply from DeepSeek" });
  }
});

app.listen(ENV.PORT, () => {
  console.log(`DeepSeek Chatbot API listening on http://localhost:${ENV.PORT}`);
});
