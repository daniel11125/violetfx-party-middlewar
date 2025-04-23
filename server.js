import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

let latestParty = [];

// JSON 바디 파서
app.use(express.json());

// ✅ CORS 허용 미들웨어
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ✅ 루트 상태 확인
app.get("/", (req, res) => {
  res.send("✅ Violet FX 파티 미들웨어 서버가 정상 실행 중입니다.");
});

// ✅ 전체 파티 조회
app.get("/party", (req, res) => {
  res.json(latestParty || { message: "아직 수신된 파티 없음" });
});

// ✅ 특정 호스트의 파티 조회
app.get("/party/:host", (req, res) => {
  const hostName = decodeURIComponent(req.params.host).trim();
  const result = (latestParty || []).find(p => p.host.trim() === hostName);

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: `호스트 "${hostName}"의 파티를 찾을 수 없습니다.` });
  }
});

// ✅ 파티 정보 수신 (POST)
app.post("/api/party", (req, res) => {
  latestParty = req.body;
  console.log("📥 파티 수신:", latestParty);
  res.send({ status: "ok" });
});

// ✅ 서버 시작
app.listen(port, () => {
  console.log(`✅ 미들웨어 서버 실행 중: http://localhost:${port}`);
});
