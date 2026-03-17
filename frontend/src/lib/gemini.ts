import * as Sentry from "@sentry/react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Google GenAI client
const genAI = new GoogleGenerativeAI(apiKey || "MOCK_KEY");

// Instrument the client with Sentry for agent monitoring
export const geminiClient = Sentry.instrumentGoogleGenAIClient(genAI, {
  recordInputs: true,
  recordOutputs: true,
});

export const getGeminiModel = (modelName: string = "gemini-2.0-flash") => {
  return geminiClient.getGenerativeModel({ model: modelName });
};
