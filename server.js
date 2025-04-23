import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

let latestParty = [];

// ✅ ESM 환경에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ JSON 바디 파서
app.use(express.json());

// ✅ CORS 허용
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ✅ 파티 수신 API (Violet FX 봇에서 사용)
app.post("/api/party", (req, res) => {
  latestParty = req.body;
  console.log("📥 파티 수신:", latestParty);
  res.send({ status: "ok" });
});

// ✅ 전체 파티 목록 조회
app.get("/party", (req, res) => {
  res.json(latestParty || { message: "아직 수신된 파티 없음" });
});

// ✅ 특정 호스트 파티 조회
app.get("/party/:host", (req, res) => {
  const hostName = decodeURIComponent(req.params.host).trim();
  const result = (latestParty || []).find(p => p.host.trim() === hostName);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: `호스트 "${hostName}"의 파티를 찾을 수 없습니다.` });
  }
});

// ✅ 정적 HTML/JS/CSS 제공
app.use("/app", express.static(path.join(__dirname, "public/app")));

// ✅ /app/* → 항상 index.html 반환 (SPA 대응)
app.get("/app/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/app/index.html"));
});

// ✅ 루트 페이지
app.get("/", (req, res) => {
  res.send("✅ Violet FX 파티 미들웨어 서버 정상 실행 중입니다.");
});

// ✅ 서버 시작
app.listen(port, () => {
  console.log(`✅ 미들웨어 서버 실행 중: http://localhost:${port}`);
});
