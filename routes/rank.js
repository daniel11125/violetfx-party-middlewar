// routes/rank.js
import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id 파라미터가 필요합니다." });

  const ids = Array.isArray(id) ? id : [id];
  const results = [];

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    for (const targetId of ids) {
      await page.goto("https://mabinogimobile.nexon.com/Ranking/List?t=1", {
        waitUntil: "domcontentloaded",
        timeout: 0
      });

      // 서버 선택 박스 클릭 (강제)
      await page.waitForSelector(".select_server .select_box");
      await page.evaluate(() => {
        const el = document.querySelector(".select_server .select_box");
        if (el) el.click();
      });
      await new Promise(resolve => setTimeout(resolve, 300));


      // 던컨 서버 선택 (data-serverid="3") (강제)
      await page.waitForSelector('.server_class_wrap li[data-serverid="3"]');
      await page.evaluate(() => {
        const server = document.querySelector('.server_class_wrap li[data-serverid="3"]');
        if (server) server.click();
      });
      await new Promise(resolve => setTimeout(resolve, 300));


      // 검색어 입력창 채우기 (초기화 후)
      await page.waitForSelector(".search_character input[name='search']");
      await page.evaluate(() => {
        const input = document.querySelector(".search_character input[name='search']");
        if (input) input.value = "";
      });
      await page.type(".search_character input[name='search']", targetId);

      // 검색 버튼 클릭
      await page.waitForSelector(".search_character button.search_button");
      await Promise.all([
        page.waitForResponse(res => res.url().includes("/Ranking/List/rankdata") && res.status() === 200),
        page.evaluate(() => {
          const btn = document.querySelector(".search_character button.search_button");
          if (btn) btn.click();
        })
      ]);

      // 결과 DOM 로딩 대기
      try {
        await page.waitForSelector(".ranking_list_wrap ul.list", { timeout: 10000 });
      } catch (e) {
        results.push({ id: targetId, error: "❌ 캐릭터를 찾을 수 없습니다." });
        continue;
      }

      // 데이터 파싱
      const data = await page.evaluate((id) => {
        const items = document.querySelectorAll(".ranking_list_wrap ul.list > li.item");
        for (const el of items) {
          const nameEl = el.querySelector("dd[data-charactername]");
          const powerEl = el.querySelector("dd.type_1");
          const classEl = el.querySelectorAll("dl")[3]?.querySelector("dd");
          const rankEl = el.querySelectorAll("dl")[0]?.querySelector("dt");

          if (!nameEl || !powerEl || !classEl || !rankEl) continue;
          const name = nameEl.textContent.trim();
          if (name === id.trim()) {
            return {
              id: name,
              power: powerEl.textContent.replace(/,/g, "").trim(),
              className: classEl.textContent.trim(),
              rank: rankEl.textContent.replace("위", "").replace(/,/g, "").trim()
            };
          }
        }
        return { id, error: "❌ 캐릭터를 찾을 수 없습니다." };
      }, targetId);

      results.push(data);
    }

    res.json({ results });
  } catch (err) {
    console.error("❌ Puppeteer 오류:", err);
    res.status(500).json({ error: "Puppeteer 실패", detail: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

export default router;
