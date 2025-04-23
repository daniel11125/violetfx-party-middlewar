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
  const partyEl = document.getElementById("party");
  partyEl.innerHTML = "<div id='all-card-container' style='display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;'></div>";
  const container = document.getElementById("all-card-container");
  characters.forEach((c, i) => {
    const card = createCharacterCard(c);
    container.appendChild(card);
  });
}

function generatePartyFromDisplayedCards() {
  if (!characters.length) return alert("⏳ 캐릭터 데이터를 아직 불러오지 못했습니다.");
  const dealerList = filterByRole("딜러");
  const tankList = filterByRole("탱커");
  const healerList = filterByRole("힐러");
  const selected = [...getRandomUnique(dealerList, 2)];
  selected.push(getRandomUnique(tankList, 1, selected.map(c => c.id))[0]);
  selected.push(getRandomUnique(healerList, 1, selected.map(c => c.id))[0]);
  const selectedIds = selected.map(c => c.id);
  const cardContainer = document.getElementById("card-container") || document.getElementById("all-card-container");
  if (!cardContainer) return alert("카드 컨테이너를 찾을 수 없습니다.");
  const allCards = Array.from(cardContainer.querySelectorAll(".card"));
  const selectedCardElements = [];
  allCards.forEach((cardEl) => {
    const idText = cardEl.querySelector("div[style*='right: 15px']").textContent.trim();
    if (!selectedIds.includes(idText)) {
      cardEl.style.transition = "transform 0.6s ease, opacity 0.6s ease";
      cardEl.style.transform = "translateY(100px)";
      cardEl.style.opacity = "0";
      setTimeout(() => cardEl.parentElement.remove(), 600);
    } else {
      selectedCardElements.push(cardEl);
      cardEl.style.opacity = "0";
      cardEl.style.transform = "scale(0.9)";
      cardEl.style.transition = "all 0.6s ease";
    }
  });
  selectedCardElements.forEach((cardEl, i) => {
    setTimeout(() => {
      cardEl.style.opacity = "1";
      cardEl.style.transform = "scale(1.05) rotateY(360deg)";
      cardEl.style.zIndex = "10";
      cardEl.style.border = "1px solid white";
      cardEl.style.boxShadow = `0 0 10px rgba(255,255,255,0.4), 0 0 30px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.1)`;
      cardEl.style.animation = "glowPulse 3s ease-in-out infinite";
    }, 600 + i * 200);
  });
  const totalPower = selected.reduce((sum, c) => sum + c.power, 0);
  document.querySelector("#total-power-text")?.remove();
  const totalEl = document.createElement("p");
  totalEl.id = "total-power-text";
  totalEl.style.marginTop = "30px";
  totalEl.style.textAlign = "center";
  totalEl.innerHTML = `<strong>⚔️ 총 전투력: ${totalPower}</strong>`;
  setTimeout(() => cardContainer.parentElement.appendChild(totalEl), 600 + selectedCardElements.length * 200);
  showRecallButtonOnly();
}

function generateParty() {
  const dealerList = filterByRole("딜러");
  const tankList = filterByRole("탱커");
  const healerList = filterByRole("힐러");
  const selected = [...getRandomUnique(dealerList, 2)];
  selected.push(getRandomUnique(tankList, 1, selected.map(c => c.id))[0]);
  selected.push(getRandomUnique(healerList, 1, selected.map(c => c.id))[0]);
  const container = document.getElementById("party");
  container.innerHTML = "";
  selected.forEach(c => container.appendChild(createCharacterCard(c)));
}

function generatePartythree() {
  generateParty();
  setTimeout(() => generateParty(), 1000);
  setTimeout(() => generateParty(), 2000);
}

async function generatePartyKakao() {
  try {
    const res = await fetch("/party");
    const data = await res.json();
    const container = document.getElementById("party");
    container.innerHTML = "";
    data.forEach(party => {
      const ids = party.members.map(m => m.trim());
      const filtered = deduplicateByIdKeepHighestPower(characters.filter(c => ids.includes(c.id)));
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.flexWrap = "wrap";
      row.style.justifyContent = "center";
      row.style.gap = "20px";
      filtered.forEach(c => row.appendChild(createCharacterCard(c)));
      container.appendChild(row);
    });
  } catch (err) {
    console.error("❌ 카카오 파티 데이터 로딩 실패", err);
  }
}

function createCharacterCard(c) {
  const wrapper = document.createElement("div");
  wrapper.style.border = "1px solid #ccc";
  wrapper.style.borderRadius = "8px";
  wrapper.style.width = "200px";
  wrapper.style.padding = "10px";
  wrapper.style.textAlign = "center";
  wrapper.className = "card";
  wrapper.innerHTML = `
    <div><strong>${c.id}</strong> (${c.class})</div>
    <div>⚔️ ${c.power}</div>
    <div>${c.msg ? `"${c.msg}"` : ""}</div>
    <div>${getGoldStars(c.power >= 23000 ? 6 : c.power >= 21000 ? 5 : c.power >= 19000 ? 4 : 3)}</div>
  `;
  return wrapper;
}

function getGoldStars(count) {
  return Array.from({ length: count }, () => `<span style='color:gold'>★</span>`).join('');
}

function filterByRole(role) {
  return characters.filter(c => roleMap[role]?.includes(c.class));
}

function getRandomUnique(arr, count, excluded = []) {
  const available = arr.filter(c => !excluded.includes(c.id));
  return available.sort(() => 0.5 - Math.random()).slice(0, count);
}

function getHostFromURL() {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  if (params.has("host")) return decodeURIComponent(params.get("host"));
  const parts = pathname.split("/");
  if (pathname.startsWith("/app/partyList/") && parts.length >= 4) return decodeURIComponent(parts[3]);
  return null;
}

function deduplicateByIdKeepHighestPower(arr) {
  const map = new Map();
  arr.forEach(c => {
    const existing = map.get(c.id);
    if (!existing || c.power > existing.power) map.set(c.id, c);
  });
  return Array.from(map.values());
}

function renderHostParty(host) {
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
