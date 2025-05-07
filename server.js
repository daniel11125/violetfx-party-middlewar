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

// ✅ 마비노기 모바일 랭킹 프록시 API
app.post("/rankget", async (req, res) => {
  const { serverid, classid, t } = req.body;

  if (!serverid || !classid || !t) {
    return res.status(400).json({ error: "serverid, classid, t 파라미터가 필요합니다." });
  }

  const formData = new URLSearchParams();
  formData.append("serverid", serverid);
  formData.append("classid", classid);
  formData.append("t", t);

  try {
    const response = await fetch("https://mabinogimobile.nexon.com/Ranking/GetRankList", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0", // 브라우저 흉내
        "Referer": "https://mabinogimobile.nexon.com/Ranking/List?t=1" // 요청 출처 지정
      }
    });

    const rawText = await response.text();

    // 응답이 HTML일 경우 JSON 파싱 전에 필터
    if (rawText.trim().startsWith("<")) {
      return res.status(502).json({
        error: "마비노기 서버에서 HTML 응답이 반환되었습니다.",
        detail: "로그인 또는 접근 차단일 수 있습니다.",
        preview: rawText.slice(0, 300)
      });
    }

    // JSON으로 파싱
    const data = JSON.parse(rawText);
    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: "마비노기 서버 요청 실패",
      detail: error.message
    });
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
