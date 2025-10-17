"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const process_1 = __importDefault(require("process"));
exports.ENV = {
    OPENAI_API_KEY: process_1.default.env.OPENAI_API_KEY ?? "",
    PORT: Number(process_1.default.env.PORT ?? 5174),
};
//console.log(ENV);
if (!exports.ENV.OPENAI_API_KEY) {
    console.warn("⚠️  OPENAI_API_KEY is missing. Set it in api/.env");
}
