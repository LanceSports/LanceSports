import process from "process";

export const ENV = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ?? "",
  PORT: Number(process.env.PORT ?? 5174),
};

//console.log(ENV);

if (!ENV.DEEPSEEK_API_KEY) {
  console.warn("⚠️  DEEPSEEK_API_KEY is missing. Set it in api/.env");
}
