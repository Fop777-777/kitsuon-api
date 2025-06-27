const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


// OpenAI初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 例文データ（リスト管理）
const sentencesData = {
  あ: [
    "あさがおが咲いた。",
    "あめがふってきた。",
    "あかいふうせんが飛んでいった。",
    "あんぱんを食べた。",
    "あの山を越えて行こう。",
  ],
  か: [
    "かさを忘れた。",
    "かみなりが鳴っている。",
    "かいものに行こう。",
    "かぜがつよい日だった。",
    "かべに絵をかざった。",
  ],
  さ: [
    "さかなをつった。",
    "さくらが満開になった。",
    "さむい朝だった。",
    "さんぽに出かけよう。",
    "さるが木にのぼった。",
  ],
  // 他の行も必要に応じて追加
};

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

// 例文取得API（リスト版）
app.get("/api/sentences", (req, res) => {
  const kana = req.query.kana;

  if (!kana) {
    return res.status(400).json({ error: "かな行を指定してください（例: あ, か）" });
  }

  const list = sentencesData[kana];

  if (!list || list.length === 0) {
    return res.status(404).json({ error: "例文が見つかりませんでした" });
  }

  // ランダムに3件選んで返す
  const shuffled = list.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  res.json(selected);
});

app.listen(port, () => {
  console.log(`✅ サーバー起動済み → http://localhost:${port}`);
});
