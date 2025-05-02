const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

console.log("APIキー:", process.env.OPENAI_API_KEY); // ← オブジェクトの外に出す！

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "あなたは予約の電話をしているお客さんです。何があっても店員の役をしてはいけません。店員のような言葉づかいや対応を一切してはいけません。あなたの目的は居酒屋に電話して予約をとることです。やり取りが何往復あっても、お客さんとして話し続けてください。"
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI APIエラー:", error);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

app.listen(port, () => {
  console.log(`GPTプロキシサーバーが起動しました → http://localhost:${port}`);
});
