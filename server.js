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





// ✅ CORS 허용
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});


// ✅ JSON 바디 파서
app.use(express.json());

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

import puppeteer from 'puppeteer';

app.post("/rankget", async (req, res) => {
  const { id, className } = req.body;

  if (!id || !className) {
    return res.status(400).json({ error: "id, className 파라미터가 필요합니다." });
  }

  try {
    const browser = await puppeteer.launch({ 
		headless: true,			
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});

    const page = await browser.newPage();

    await page.goto("https://mabinogimobile.nexon.com/Ranking/List?t=1", { waitUntil: "networkidle0" });

    await page.type('input[name="search"]', id);
    await page.click('.search_button');

    await page.waitForSelector('li.item', { timeout: 5000 });

    const result = await page.evaluate(() => {
      const item = document.querySelector("li.item");
      if (!item) return null;

      const name = item.querySelector('dd[data-charactername]')?.textContent.trim();
      const power = [...item.querySelectorAll("dl")]
        .find(dl => dl.querySelector("dt")?.textContent.includes("전투력"))
        ?.querySelector("dd")?.textContent.trim().replace(/,/g, "");

      return { name, power };
    });

    await browser.close();

    if (!result) return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다." });

    return res.json({ id: result.name, class: className, power: result.power });

  } catch (err) {
    console.error("🛑 Puppeteer 에러:", err);
    return res.status(500).json({ error: "Puppeteer 실패", detail: err.message });
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
  console.log(`✅ 미들웨어 서버 실행 중: http://port:${port}`);
});
