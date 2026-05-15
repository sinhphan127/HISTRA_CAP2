
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiDirect() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "hi" }] }]
    });
    console.log('Success with V1 API and gemini-1.5-flash!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error with V1 API:', error.response ? error.response.data : error.message);
  }
}

testGeminiDirect();
