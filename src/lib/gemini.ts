import { GoogleGenAI } from "@google/genai";

/**
 * Initializes and returns a GoogleGenAI SDK client with the environment API key.
 *
 * @returns GoogleGenAI client instance
 */
export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

/**
 * Checks whether a valid Gemini API key is configured in the environment.
 *
 * @returns boolean true if real key is available
 */
export const isGeminiConfigured = (): boolean => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes("your-gemini"));
};
