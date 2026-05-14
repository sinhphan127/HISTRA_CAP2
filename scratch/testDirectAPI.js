import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testV1() {
  console.log("--- Testing v1 API ---");
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log("v1 SUCCESS:", response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("v1 FAILED:", error.response ? error.response.status : error.message);
    if (error.response) console.error("v1 Body:", JSON.stringify(error.response.data, null, 2));
  }
}

async function testV1Beta() {
  console.log("\n--- Testing v1beta API ---");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log("v1beta SUCCESS:", response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("v1beta FAILED:", error.response ? error.response.status : error.message);
    if (error.response) console.error("v1beta Body:", JSON.stringify(error.response.data, null, 2));
  }
}

async function run() {
  await testV1();
  await testV1Beta();
}

run();
