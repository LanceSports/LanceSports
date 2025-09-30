// src/jobs/fetchFixturesJob.js
import cron from "node-cron";
import { fetchFixturesByDate } from "../services/apiService.js";
import { saveFixtures } from "../services/dbService.js";
import { transformFixture } from "../utils/transform.js";

function formatDate(date) {
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

async function fetchAndCache(date) {
  try {
    console.log(`📅 Fetching fixtures for ${date}...`);
    const apiFixtures = await fetchFixturesByDate(date);
    const mapped = apiFixtures.map(transformFixture);
    await saveFixtures(mapped);
    console.log(`✅ Fixtures cached for ${date}`);
  } catch (err) {
    console.error(`❌ Failed to fetch fixtures for ${date}:`, err.message);
  }
}

// Schedule the job
export async function scheduleFixtureJob() {
  // Runs every day at 02:00 UTC
  cron.schedule("0 2 * * *", async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await fetchAndCache(formatDate(today));
    await fetchAndCache(formatDate(tomorrow));
  });
}


