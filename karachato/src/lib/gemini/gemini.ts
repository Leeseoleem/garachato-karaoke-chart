import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiInstance: GoogleGenerativeAI | null = null;

export const getGemini = () => {
  if (!geminiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing env: GEMINI_API_KEY");
    }
    geminiInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiInstance;
};
