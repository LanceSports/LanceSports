// src/server.js
import app from "./app.js";
import dotenv from "dotenv";
import { scheduleFixtureJob } from "./jobs/fetchFixturesJob.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Start the scheduled job
scheduleFixtureJob();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
