
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testSimple() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log('Response:', response.text());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSimple();
