// ✅ 전역 캐릭터 배열
let characters = [];

// ✅ 직업 역할 매핑
const roleMap = {
  "힐러": ["힐러", "사제", "음유시인"],
  "탱커": ["전사", "대검전사", "빙결술사", "수도사"],
  "딜러": ["검술사", "대검전사", "궁수", "석궁사수", "장궁병", "화염술사", "빙결술사", "수도사", "댄서", "악사", "마법사"]
};

// ✅ URL에서 호스트 추출 함수
function getHostFromURL() {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  if (params.has("host")) return decodeURIComponent(params.get("host"));

  const parts = pathname.split("/");
  if (pathname.startsWith("/app/partyList/") && parts.length >= 4)
    return decodeURIComponent(parts[3]);

  return null;
}

// ✅ 캐릭터 데이터를 불러오는 함수
function fetchCharacters() {
  return fetch("https://api.sheetbest.com/sheets/776e2812-99b8-4f67-ae74-4b0fa2d6a060")
    .then(res => res.json())
    .then(data => {
      characters = data.map(c => ({
        id: c.id,
        class: c.class,
        power: Number(c.power),
        thumbnail: c.thumbnail || null,
        msg: c.msg || "",
        sp: c.sp || ""
      }));
      console.log("✅ 캐릭터 로딩 완료", characters);
    })
    .catch(err => {
      console.error("❌ 캐릭터 데이터 불러오기 실패", err);
    });
}

// ✅ 특정 호스트의 파티 시각화
function renderHostParty(hostName) {
  console.log("🎯 조회할 호스트:", hostName);

  fetch(`/party/${hostName}`)
    .then(res => {
      if (!res.ok) throw new Error("호스트 파티 없음");
      return res.json();
    })
    .then(partyData => {
      if (!partyData.members || !Array.isArray(partyData.members)) {
        throw new Error("파티 members 형식 오류");
      }

      const ids = partyData.members.map(m => m.trim().toLowerCase());
      const filtered = deduplicateByIdKeepHighestPower(
        characters.filter(c => ids.includes(c.id.trim().toLowerCase()))
      );

      const partyEl = document.getElementById("party");
      partyEl.innerHTML = "";

      const title = document.createElement("h3");
      title.textContent = `👑 ${partyData.host.trim()}님의 파티`;
      title.style.textAlign = "center";

      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexWrap = "wrap";
      container.style.justifyContent = "center";
      container.style.gap = "20px";
      container.style.marginTop = "20px";

      filtered.forEach(c => {
        const card = createCharacterCard(c);
        container.appendChild(card);
      });

      const totalPower = filtered.reduce((sum, c) => sum + c.power, 0);
      const totalEl = document.createElement("p");
      totalEl.innerHTML = `<strong>⚔️ 총 전투력: ${totalPower}</strong>`;
      totalEl.style.textAlign = "center";
      totalEl.style.marginTop = "20px";

      partyEl.appendChild(title);
      partyEl.appendChild(container);
      partyEl.appendChild(totalEl);
    })
    .catch(err => {
      console.error("❌ 파티 조회 실패:", err);
      document.getElementById("party").innerHTML = `
        <p style=\"color:red; text-align:center;\">❌ 파티 데이터를 불러오지 못했습니다.<br>${err.message}</p>`;
      setTimeout(() => {
        window.location.href = "/app/";
      }, 2000);
    });
}

// ✅ 전투력 기준 중복 제거
function deduplicateByIdKeepHighestPower(characters) {
  const map = new Map();
  characters.forEach(c => {
    const existing = map.get(c.id);
    if (!existing || c.power > existing.power) {
      map.set(c.id, c);
    }
  });
  return Array.from(map.values());
}

// ✅ 메인 홈에서 전체 멤버 렌더링
function showAllMembers() {
  if (!characters || characters.length === 0) return;

  const partyEl = document.getElementById("party");
  partyEl.innerHTML = `<div id="all-card-container" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;"></div>`;
  const container = document.getElementById("all-card-container");

  characters.forEach((c, i) => {
    const card = createCharacterCard(c);
    container.appendChild(card);
  });
}

// ✅ 캐릭터 카드 생성 (기초 버전)
function createCharacterCard(c) {
  const wrapper = document.createElement("div");
  wrapper.style.width = "200px";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";

  const card = document.createElement("div");
  card.className = "card";
  card.style.width = "200px";
  card.style.height = "320px";
  card.style.position = "relative";
  card.style.borderRadius = "8px";
  card.style.overflow = "hidden";
  card.style.transition = "all 0.6s ease";
  card.style.opacity = "0";
  card.style.transform = "scale(0.7) translateY(50px)";

  const inner = c.thumbnail
    ? `<img src="${c.thumbnail}" alt="${c.id}" style="width: 100%; height: 100%; object-fit: cover;">`
    : `<div style="width: 100%; height: 100%; background: #eee; display: flex; justify-content: center; align-items: center;"><img src="./img/logo.svg" style="width: 100px; height: auto;"></div>`;

  const topLeft = `<div style="position: absolute; top: 12px; left: 15px; background: rgba(0,0,0,0.5); color: white; font-size: 13px; padding: 2px 6px; border-radius: 4px;">${c.class}</div>`;
  const topRight = `<div style="position: absolute; top: 12px; right: 15px; background: rgba(0,0,0,0.5); color: white; font-size: 13px; padding: 2px 6px; border-radius: 4px;">${c.id}</div>`;

  const msg = c.msg?.trim() ? c.msg.split("\n").join("<br>") : "....";
  const messageCenter = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 14px; padding: 6px 10px; border-radius: 6px; text-align: center; max-width: 90%; font-family: 'Nanum Myeongjo', serif;">&quot;${msg}&quot;</div>`;

  const stars = c.power >= 23000 ? 6 : c.power >= 21000 ? 5 : c.power >= 19000 ? 4 : 3;
  const starOverlay = c.sp === "use"
    ? `<span class="rainbow-stars">${"★".repeat(stars)}</span>`
    : Array.from({ length: stars }, () => `<span style='color: gold;'>★</span>`).join("");

  const bottomOverlay = `<div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 140px; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); display: flex; align-items: flex-end; justify-content: space-between; padding: 10px 15px 15px; box-sizing: border-box; font-size: 12px; font-weight: bold;">
    <div style="color: white; font-size: 13px;">${c.class}</div>
    <div style="color: gold; text-align: right; line-height: 1.3;">
      <div style="font-size: 20px; font-style: italic; font-family: 'Nanum Myeongjo';">${c.power}</div>
      <div>${starOverlay}</div>
    </div>
  </div>`;

  card.innerHTML = inner + topLeft + topRight + messageCenter + bottomOverlay;
  wrapper.appendChild(card);

  setTimeout(() => {
    card.style.opacity = "1";
    card.style.transform = "scale(1.05) rotateY(360deg)";
    card.style.zIndex = "10";
    card.style.border = "1px solid white";
    card.style.boxShadow = `
      0 0 10px rgba(255, 255, 255, 0.4),
      0 0 30px rgba(255, 255, 255, 0.2),
      0 0 60px rgba(255, 255, 255, 0.1)
    `;
  }, 100 + Math.random() * 300);

  return wrapper;
}

// ✅ 페이지 로딩 후 분기 처리
window.addEventListener("DOMContentLoaded", () => {
  const host = getHostFromURL();

  fetchCharacters().then(() => {
    if (window.location.pathname === "/app/") {
      showAllMembers();
    } else if (window.location.pathname.startsWith("/app/partyList") && host) {
      renderHostParty(host);
    } else {
      console.warn("🚫 알 수 없는 경로입니다.");
    }
  });
});
