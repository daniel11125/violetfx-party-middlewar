import fs from "fs";
import path from "path";

// 🔧 저장된 JSON 경로
const filePath = path.resolve("db", "rank_data.json");

// 🔄 변환 및 저장
try {
  const raw = fs.readFileSync(filePath, "utf8");
  const original = JSON.parse(raw);

  const flattened = original
    .map(entry => entry.results?.[0])
    .filter(item => item && !item.error); // ❌ 에러 응답 제외

  fs.writeFileSync(filePath, JSON.stringify(flattened, null, 2), "utf8");
  console.log(`✅ 변환 완료: ${flattened.length}개 항목 저장됨`);
} catch (err) {
  console.error("❌ JSON 정리 실패:", err);
}
