import OpenAI from "openai";
import process from "process";
export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ??"",
  PORT: Number(process.env.PORT ?? 5174),
};

//console.log(ENV);

if (!ENV.OPENAI_API_KEY) 
{
  console.warn("⚠️  OPENAI_API_KEY is missing. Set it in api/.env");
}