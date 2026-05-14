import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing API Key starting with:", apiKey ? apiKey.substring(0, 8) + "..." : "MISSING");

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
    const result = await model.generateContent("Say hello in one word.");
    const response = await result.response;
    console.log("Success! Response:", response.text());
  } catch (error) {
    console.error("FAILED! Error details:");
    console.error("- Message:", error.message);
    if (error.status) console.error("- Status:", error.status);
    if (error.response) {
       // Inspect the full error if possible
       console.error("- Full error body:", JSON.stringify(error.response, null, 2));
    }
  }
}

test();
