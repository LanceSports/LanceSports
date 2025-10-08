import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { ENV } from "./config/env";
import { footySystemPrompt } from "./prompts/system";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

app.post("/api/football-chat", async (req, res) => {
  const message: string = (req.body?.message ?? "").toString().trim();
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        { role: "system", content: footySystemPrompt },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get reply" });
  }
});

app.listen(ENV.PORT, () => {
  console.log(`API listening on http://localhost:${ENV.PORT}`);
});
