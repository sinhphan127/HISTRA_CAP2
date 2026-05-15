
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // List models using the SDK's internal fetch (via a hack or just trying common ones)
    // Actually, the SDK doesn't expose a clean listModels, but we can try a simple generation with a very small prompt.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hi");
    console.log('Success with gemini-1.5-flash!');
  } catch (error) {
    console.log('Error with gemini-1.5-flash:', error.message);
    
    try {
      const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result2 = await model2.generateContent("hi");
      console.log('Success with gemini-2.0-flash-lite!');
    } catch (error2) {
      console.log('Error with gemini-2.0-flash-lite:', error2.message);
    }
  }
}

listModels();
