import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

let latestParty = null;

app.use(express.json());

app.post("/api/party", (req, res) => {
  latestParty = req.body;
  console.log("📥 파티 수신:", latestParty);
  res.send({ status: "ok" });
});

app.get("/party", (req, res) => {
  res.json(latestParty || { message: "아직 수신된 파티 없음" });
});

app.listen(port, () => {
  console.log(`✅ 미들웨어 서버 실행 중: http://localhost:${port}`);
});
