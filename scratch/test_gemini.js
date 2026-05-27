import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = 'gemini-2.5-flash-lite';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

console.log(`🧪 Testing Gemini API with model: ${model}`);

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Say hello in one word.' }] }]
    })
  });
  const data = await res.json();
  if (data.error) {
    console.error('❌ Gemini error:', data.error);
  } else {
    console.log('✅ Gemini response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
  }
} catch (e) {
  console.error('❌ Network error:', e.message);
}
