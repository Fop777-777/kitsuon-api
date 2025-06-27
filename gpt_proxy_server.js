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

const mysql = require("mysql2/promise");

// MySQL接続設定（.envから取得）
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// 例文取得API
app.get("/api/sentences", async (req, res) => {
  const kana = req.query.kana;

  if (!kana) {
    return res.status(400).json({ error: "かな行を指定してください（例: あ, か）" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT sentence FROM example_sentences WHERE kana_row = ? ORDER BY RAND() LIMIT 3",
      [kana]
    );
    await connection.end();

    const sentences = rows.map(row => row.sentence);
    res.json(sentences);
  } catch (error) {
    console.error("MySQL接続エラー:", error);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});


app.listen(port, () => {
  console.log(`GPTプロキシサーバーが起動しました → http://localhost:${port}`);
});
