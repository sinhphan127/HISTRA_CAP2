import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels in the new SDK easily accessible like this
    // but we can try to hit a known model like gemini-pro or gemini-1.0-pro
    console.log("Trying gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("Success with gemini-pro! Response:", response.text());
  } catch (error) {
    console.error("FAILED gemini-pro:", error.message);
  }
}

listModels();
