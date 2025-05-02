import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const { kana } = req.query;

  if (!kana) {
    return res.status(400).json({ error: "kana is required" });
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,     // ŠÂ‹«•Ï”‚ÉVercel‚ÅÝ’è
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows] = await connection.execute(
      "SELECT sentence FROM example_sentences WHERE kana_row = ? ORDER BY RAND() LIMIT 3",
      [kana]
    );
    const sentences = rows.map(row => row.sentence);
    res.status(200).json(sentences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  } finally {
    connection.end();
  }
}
