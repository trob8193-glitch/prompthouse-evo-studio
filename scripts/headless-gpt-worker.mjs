import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CrashProofEngine } from '../src/core/autonomy/CrashProofEngine.js';
import { OpenAI } from "openai";
import readline from "readline";
import dotenv from "dotenv";

CrashProofEngine.initialize('HeadlessGptWorker');

const __filename = fileURLToPath(import.meta.url);
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: OPENAI_API_KEY is not set in your .env file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const systemPrompt = `You are the PH Evo Studio Headless Terminal Daemon. 
You live entirely inside the user's local terminal. You act as an autonomous worker daemon that can be summoned directly via the CLI.
You are fully aware of the TriBrain architecture. You represent the "Actions / CLI" brain.
Always provide concise, technical, direct responses. Use terminal-friendly formatting (no heavy markdown that looks bad in raw text).`;

const messages = [
  { role: "system", content: systemPrompt }
];

console.log("\n========================================================");
console.log("🤖 PH EVO STUDIO — HEADLESS TERMINAL DAEMON ACTIVATED");
console.log("========================================================\n");
console.log("Connection established via OpenAI API.");
console.log("Type 'exit' or 'quit' to terminate the daemon loop.\n");

function askQuestion() {
  rl.question("Operator > ", async (input) => {
    const text = input.trim();
    if (text.toLowerCase() === "exit" || text.toLowerCase() === "quit") {
      console.log("Shutting down daemon loop...");
      rl.close();
      return;
    }

    if (!text) {
      askQuestion();
      return;
    }

    messages.push({ role: "user", content: text });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
      });

      const responseMessage = completion.choices[0].message;
      messages.push(responseMessage);

      console.log(`\nDaemon > ${responseMessage.content}\n`);
    } catch (error) {
      console.error("\n❌ API Error:", error.message, "\n");
      messages.pop(); // Remove the failed message
    }

    askQuestion();
  });
}

askQuestion();
