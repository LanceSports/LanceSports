// src/app.js
import express from "express";
import fixturesRoutes from "./routes/fixturesRoutes.js";

const app = express();

app.use(express.json());
app.use("/fixtures", fixturesRoutes);

export default app;
