// ✅ 전역 캐릭터 배열
let characters = [];

// ✅ 직업 역할 매핑
const roleMap = {
  "힐러": ["힐러", "사제", "음유시인"],
  "탱커": ["전사", "대검전사", "빙결술사", "수도사"],
  "딜러": ["검술사", "대검전사", "궁수", "석궁사수", "장궁병", "화염술사", "빙결술사", "수도사", "댄서", "악사", "마법사"]
};

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

function showRecallButtonOnly() {
  const newBtn = document.querySelector(".newparty");
  const recallBtn = document.querySelector(".recall");
  const recallThreeBtn = document.querySelector(".recallthree");
  if (newBtn) newBtn.style.display = "none";
  if (recallBtn) recallBtn.style.display = "inline-block";
  if (recallThreeBtn) recallThreeBtn.style.display = "inline-block";
}

function showAllMembers() {
  if (!characters || characters.length === 0) {
    alert("⏳ 캐릭터 데이터를 아직 불러오지 못했습니다.");
    return;
  }
  const partyEl = document.getElementById("party");
  partyEl.innerHTML = "<div id='all-card-container' style='display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;'></div>";
  const container = document.getElementById("all-card-container");
  characters.forEach((c, i) => {
    const card = createCharacterCard(c);
    container.appendChild(card);
  });
}

function filterByRole(role) {
  return characters.filter(c => roleMap[role]?.includes(c.class));
}

function getRandomUnique(arr, count, excluded = []) {
  const available = arr.filter(c => !excluded.includes(c.id));
  return available.sort(() => 0.5 - Math.random()).slice(0, count);
}

function getGoldStars(count) {
  return Array.from({ length: count }, () => `<span style='color:gold'>★</span>`).join('');
}

function deduplicateByIdKeepHighestPower(arr) {
  const map = new Map();
  arr.forEach(c => {
    const existing = map.get(c.id);
    if (!existing || c.power > existing.power) map.set(c.id, c);
  });
  return Array.from(map.values());
}

function getHostFromURL() {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  if (params.has("host")) return decodeURIComponent(params.get("host"));
  const parts = pathname.split("/");
  if (pathname.startsWith("/app/partyList/") && parts.length >= 4) return decodeURIComponent(parts[3]);
  return null;
}

function createCharacterCard(c) {
  const role = Object.keys(roleMap).find(r => roleMap[r].includes(c.class)) || "기타";
  const roleIcon = role === "딜러" ? "🗡️" : role === "탱커" ? "🛡️" : "✨";

  let stars = 3;
  if (c.power >= 19000) stars = 4;
  if (c.power >= 21000) stars = 5;
  if (c.power >= 23000) stars = 6;

  const starOverlay = c.sp === 'use'
    ? `<span class="rainbow-stars">${'★'.repeat(stars)}</span>`
    : getGoldStars(stars);

  const cardWrapper = document.createElement("div");
  cardWrapper.style.width = "200px";
  cardWrapper.style.display = "flex";
  cardWrapper.style.flexDirection = "column";
  cardWrapper.style.alignItems = "center";

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
    : `<div style="width: 100%; height: 100%; background: #eee; display: flex; justify-content: center; align-items: center;">
        <img src="./img/logo.svg" alt="default-logo" style="width: 100px; height: auto;">
      </div>`;

  const topLeft = `<div style="position: absolute; top: 12px; left: 15px; background: rgba(0,0,0,0.5); color: white; font-size: 13px; padding: 2px 6px; border-radius: 4px;">${c.class}</div>`;
  const topRight = `<div style="position: absolute; top: 12px; right: 15px; background: rgba(0,0,0,0.5); color: white; font-size: 13px; padding: 2px 6px; border-radius: 4px;">${c.id}</div>`;

  const messageText = (c.msg && c.msg.trim() !== "") ? c.msg.replaceAll('\n', '<br>') : '....';
  const messageCenter = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);  color: white; font-size: 14px; padding: 6px 10px; border-radius: 6px; text-align: center; max-width: 90%; font-family: 'Nanum Myeongjo', serif;">&quot;${messageText}&quot;</div>`;

  const bottomOverlay = `
    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 140px; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); display: flex; align-items: flex-end; justify-content: space-between; padding: 10px 15px 15px; box-sizing: border-box; font-size: 12px; font-weight: bold;">
      <div style="color: white; font-size: 13px;">${roleIcon} ${role}</div>
      <div style="color: gold; text-align: right; line-height: 1.3;">
        <div style="font-size: 20px; font-style: italic; font-family: 'Nanum Myeongjo';">${c.power}</div>
        <div>${starOverlay}</div>
      </div>
    </div>
  `;

  card.innerHTML = inner + topLeft + topRight + messageCenter + bottomOverlay;
  cardWrapper.appendChild(card);

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

  return cardWrapper;
}

function renderHostParty(host) {
  if (host === "all") {
    generatePartyKakao();
    return;
  }

  fetch(`/party/${host}`)
    .then(res => res.json())
    .then(data => {
      const ids = data.members.map(m => m.trim());
      const filtered = deduplicateByIdKeepHighestPower(characters.filter(c => ids.includes(c.id)));
      const container = document.getElementById("party");
      container.innerHTML = "";
      filtered.forEach(c => container.appendChild(createCharacterCard(c)));
    })
    .catch(err => {
      console.error("❌ 호스트 파티 로딩 실패", err);
      document.getElementById("party").innerHTML = `<p style='color:red;text-align:center;'>호스트 파티를 불러오지 못했습니다.<br>${err.message}</p>`;
      setTimeout(() => window.location.href = "/app/", 2000);
    });
}

function generatePartyKakao() {
  fetch("/party")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("party");
      container.innerHTML = "";

      data.forEach(party => {
        const ids = party.members.map(m => m.trim());
        const filtered = deduplicateByIdKeepHighestPower(
          characters.filter(c => ids.includes(c.id))
        );

        const partyGroup = document.createElement("div");
        partyGroup.style.marginBottom = "60px";

        // 🏷️ 파티 제목
        const title = document.createElement("h3");
        title.innerText = `🎉 ${party.host}님의 파티`;
        title.style.textAlign = "center";
        title.style.marginBottom = "20px";
        title.style.fontSize = "20px";
        title.style.color = "#fff";
        title.style.fontFamily = "'Nanum Gothic', sans-serif";
        partyGroup.appendChild(title);

        // 🧑‍✈️ 파티장 캐릭터 카드
        const hostCharacter = filtered.find(c => c.id === party.host);
        if (hostCharacter) {
          const hostCardWrapper = document.createElement("div");
          hostCardWrapper.style.display = "flex";
          hostCardWrapper.style.justifyContent = "center";
          hostCardWrapper.style.marginBottom = "50px";
          hostCardWrapper.appendChild(createCharacterCard(hostCharacter));
          partyGroup.appendChild(hostCardWrapper);
        }

        // 👥 나머지 파티원 캐릭터 카드
        const membersRow = document.createElement("div");
        membersRow.style.display = "flex";
        membersRow.style.flexWrap = "wrap";
        membersRow.style.justifyContent = "center";
        membersRow.style.gap = "20px";

        filtered
          .filter(c => c.id !== party.host)
          .forEach(c => membersRow.appendChild(createCharacterCard(c)));

        partyGroup.appendChild(membersRow);
        container.appendChild(partyGroup);
      });
    })
    .catch(err => {
      console.error("❌ 카카오 파티 데이터 로딩 실패", err);
    });
}



window.addEventListener("DOMContentLoaded", () => {
  const host = getHostFromURL();
  fetchCharacters().then(() => {
    if (window.location.pathname === "/app/") {
      showAllMembers();
    } else if (window.location.pathname.startsWith("/app/partyList") && host) {
      renderHostParty(host);
    }
  });
});
