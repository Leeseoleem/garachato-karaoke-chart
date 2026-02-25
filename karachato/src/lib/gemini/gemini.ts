import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing env: GEMINI_API_KEY");
}

// 초기화 된 인스턴스 생성
export const gemini = new GoogleGenerativeAI(apiKey);
