import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const filePath = path.resolve("db", "rank_data.json");

router.post("/", async (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data 배열이 필요합니다." });
  }

  try {
    // ✅ power가 있는 정상 결과만 저장
    const cleaned = data.filter(entry => entry && entry.power);

    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), "utf8");
    res.json({ message: "✅ 저장 완료", count: cleaned.length });

  } catch (err) {
    console.error("❌ 저장 실패:", err);
    res.status(500).json({ error: "저장 실패", detail: err.message });
  }
});

export default router;
