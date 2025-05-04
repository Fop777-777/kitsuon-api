import { Pool } from "pg";

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

export default async function handler(req, res) {
  const { kana } = req.query;

  if (!kana) {
    return res.status(400).json({ error: "kana is required" });
  }

  try {
    const result = await pool.query(
      "SELECT sentence FROM example_sentences WHERE kana_row = $1 ORDER BY RANDOM() LIMIT 3",
      [kana]
    );
    const sentences = result.rows.map(row => row.sentence);
    res.status(200).json(sentences);
  } catch (err) {
    console.error("PostgreSQL接続エラー:", err);
    res.status(500).json({ error: "DB Error" });
  }
}
