import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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
  const { serverid, classid } = req.body;

  if (!serverid || !classid) {
    return res.status(400).json({ error: "serverid, classid 파라미터가 필요합니다." });
  }

  const formData = new URLSearchParams();
  formData.append("serverid", serverid);
  formData.append("classid", classid);
  formData.append("t", "1"); // 고정값

  try {
    const response = await fetch("https://mabinogimobile.nexon.com/Ranking/GetRankList", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://mabinogimobile.nexon.com/Ranking/List?t=1"
      }
    });

    const rawText = await response.text();

    // HTML일 경우 cheerio로 크롤링
    if (rawText.trim().startsWith("<")) {
      const $ = cheerio.load(rawText);
      const rows = [];

      $("table tbody tr").each((i, el) => {
        const columns = $(el).find("td").map((i, td) => $(td).text().trim()).get();
        if (columns.length) {
          rows.push(columns);
        }
      });

      return res.json({ type: "html", rows });
    }

    // JSON일 경우 그대로 전달
    const data = JSON.parse(rawText);
    res.json({ type: "json", ...data });

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
