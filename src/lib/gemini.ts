import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const isGeminiConfigured = (): boolean => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes("your-gemini"));
};
