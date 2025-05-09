// routes/rank.js
import express from "express";
import puppeteer from "puppeteer-core"; // puppeteer-core로 변경

const router = express.Router();

router.post("/", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id 파라미터가 필요합니다." });

  const ids = Array.isArray(id) ? id : [id];
  const results = [];

  let browser;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: "wss://browserless-production-41dc.up.railway.app?token=t0vxqo3K5L60pRMaNf6Tol9fnueqPTBtv0BNMetIQ0UCX1of"
    });

    const page = await browser.newPage();

    for (const targetId of ids) {
      await page.goto("https://mabinogimobile.nexon.com/Ranking/List?t=1", {
        waitUntil: "domcontentloaded",
        timeout: 0
      });

      await page.waitForSelector(".select_server .select_box", { timeout: 10000 });
      await page.evaluate(() => {
        const el = document.querySelector(".select_server .select_box");
        if (el) el.click();
      });
      await page.waitForTimeout(300);

      await page.waitForSelector('.server_class_wrap li[data-serverid="3"]', { timeout: 10000 });
      await page.evaluate(() => {
        const server = document.querySelector('.server_class_wrap li[data-serverid="3"]');
        if (server) server.click();
      });
      await page.waitForTimeout(300);

      await page.waitForSelector(".search_character input[name='search']", { timeout: 10000 });
      await page.evaluate(() => {
        const input = document.querySelector(".search_character input[name='search']");
        if (input) input.value = "";
      });
      await page.type(".search_character input[name='search']", targetId);

      await page.waitForSelector(".search_character button.search_button", { timeout: 10000 });
      await Promise.all([
        page.waitForResponse(res =>
          res.url().includes("/Ranking/List/rankdata") && res.status() === 200
        ),
        page.evaluate(() => {
          const btn = document.querySelector(".search_character button.search_button");
          if (btn) btn.click();
        })
      ]);

      try {
        await page.waitForSelector(".ranking_list_wrap ul.list", { timeout: 10000 });
      } catch (e) {
        results.push({ id: targetId, error: "❌ 캐릭터를 찾을 수 없습니다." });
        continue;
      }

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
