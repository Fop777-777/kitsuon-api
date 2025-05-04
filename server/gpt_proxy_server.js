const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { OpenAI } = require("openai");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// OpenAI初期化
console.log("APIキー:", process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// PostgreSQL接続プール
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GPTとの対話API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "あなたは予約の電話をしているお客さんです。何があっても店員の役をしてはいけません。店員のような言葉づかいや対応を一切してはいけません。あなたの目的は居酒屋に電話して予約をとることです。やり取りが何往復あっても、お客さんとして話し続けてください。",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI APIエラー:", error);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// 例文取得API（PostgreSQL版）
app.get("/api/sentences", async (req, res) => {
  const kana = req.query.kana;

  if (!kana) {
    return res.status(400).json({ error: "かな行を指定してください（例: あ, か）" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT sentence FROM example_sentences WHERE kana_row = $1 ORDER BY RANDOM() LIMIT 3",
      [kana]
    );

    const sentences = rows.map((row) => row.sentence);
    res.json(sentences);
  } catch (error) {
    console.error("PostgreSQL接続エラー:", error);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

app.listen(port, () => {
  console.log(`✅ サーバー起動済み → http://localhost:${port}`);
});
