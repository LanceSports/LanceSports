// src/server.js
import express from "express";
import fixturesRouter from "./routes/fixturesRoutes.js";

const app = express();

app.use("/fixtures", fixturesRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});




/*import app from "./app.js";
import dotenv from "dotenv";
import { scheduleFixtureJob } from "./jobs/fetchFixturesJob.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Start the scheduled job
scheduleFixtureJob();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
*/