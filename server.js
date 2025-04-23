import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS 허용 미들웨어 추가
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 도메인 허용 (또는 'http://localhost:포트번호' 식으로 제한 가능)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 허용할 메소드
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

let latestParty = [];

app.post("/api/party", (req, res) => {
  latestParty = req.body;
  console.log("📥 파티 수신:", latestParty);
  res.send({ status: "ok" });
});

app.get("/party", (req, res) => {
  if (!latestParty || latestParty.length === 0) {
    return res.status(200).json({ message: "아직 수신된 파티 없음" });
  }
  res.status(200).json(latestParty);
});

app.listen(port, () => {
  console.log(`✅ 미들웨어 서버 실행 중: http://localhost:${port}`);
});
