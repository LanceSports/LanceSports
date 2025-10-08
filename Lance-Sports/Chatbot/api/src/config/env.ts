import dotenv from "dotenv";
import process from "process";

// Load environment variables from .env file
dotenv.config();

export const ENV = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ?? "",
  PORT: Number(process.env.PORT ?? 5174),
};

console.log(ENV.PORT);

if (!ENV) {
  console.warn("⚠️  DEEPSEEK_API_KEY is missing. Set it in api/.env");
}
