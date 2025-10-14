// src/app.js
import express from "express";
import fixturesRoutes from "./routes/fixturesRoutes.js";
import leagueFixturesRoutes from "./routes/leagueFixturesRoutes.js";


const app = express();

app.use(express.json());
app.use("/fixtures", fixturesRoutes);
app.use("/leagueFixtures", leagueFixturesRoutes);

export default app;
