import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const idea = process.argv.slice(2).join(" ");
const API_KEY = process.env.AI_API_KEY;

if (!API_KEY || !idea) { console.error("Missing data"); process.exit(1); }

const rules = fs.readFileSync("rules.txt", "utf8");

async function run() {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: rules },
        { role: "user", content: idea }
      ],
      max_tokens: 3000
    })
  });

  const data = await res.json();
  const text = data.choices[0].message.content;

  const files = text.split("[FILE]").slice(1);

  for (let file of files) {
    const lines = file.trim().split("\n");
    const filePath = lines.shift().trim();
    const content = lines.join("\n");
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  }
}

run();
