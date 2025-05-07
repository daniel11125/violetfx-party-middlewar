// ✅ 전역 캐릭터 배열
let characters = [];

// ✅ 직업 역할 매핑
const roleMap = {
  "힐러": ["힐러", "사제", "음유시인"],
  "탱커": ["전사", "대검전사", "빙결술사", "수도사"],
  "딜러": ["검술사", "대검전사", "궁수", "석궁사수", "장궁병", "화염술사", "빙결술사", "수도사", "댄서", "악사", "마법사", "도적", "격투가", "듀얼블레이드"]
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
    .then(party => {
      const filtered = deduplicateByIdKeepHighestPower(
        characters.filter(c =>
          party.members.some(m => hasMinimumSubstringMatch(m, c.id, 2))
        )
      );

      const container = document.getElementById("party");
      container.innerHTML = "";

      // 🎉 제목
      const title = document.createElement("h3");
      title.innerText = `🎉 ${host}님의 파티`;
      title.style.textAlign = "center";
      title.style.marginBottom = "20px";
      title.style.fontSize = "20px";
      title.style.color = "#fff";
      title.style.fontFamily = "'Nanum Gothic', sans-serif";
      container.appendChild(title);

      // 🧑‍✈️ 파티장 찾기
      const hostCharacter = filtered.find(c =>
        hasMinimumSubstringMatch(party.host, c.id, 2)
      );

      if (hostCharacter) {
        // 전체 카드 래퍼
        const horizontalRow = document.createElement("div");
        horizontalRow.style.display = "flex";
        horizontalRow.style.flexWrap = "wrap";
        horizontalRow.style.justifyContent = "center";
        horizontalRow.style.alignItems = "flex-start";
        horizontalRow.style.gap = "30px";
        horizontalRow.style.width = "100%";

        // 파티장 카드 먼저
        const hostWrapper = document.createElement("div");
        hostWrapper.appendChild(createCharacterCard(hostCharacter));
        horizontalRow.appendChild(hostWrapper);

        // 파티원 그룹
        const memberContainer = document.createElement("div");
        memberContainer.style.display = "flex";
        memberContainer.style.flexWrap = "wrap";
        memberContainer.style.gap = "30px";
        memberContainer.style.justifyContent = "center";

        filtered
          .filter(c => !hasMinimumSubstringMatch(party.host, c.id, 2)) // 파티장 제외
          .forEach(c => memberContainer.appendChild(createCharacterCard(c)));

        horizontalRow.appendChild(memberContainer);

        // 파티 그룹 묶기
        const partyGroup = document.createElement("div");
        partyGroup.style.marginBottom = "60px";
        partyGroup.appendChild(horizontalRow);

        container.appendChild(partyGroup);
      }
    })
    .catch(err => {
      console.error("❌ 호스트 파티 로딩 실패", err);
      document.getElementById("party").innerHTML =
        `<p style='color:red;text-align:center;'>호스트 파티를 불러오지 못했습니다.<br>${err.message}</p>`;
      setTimeout(() => window.location.href = "/app/", 2000);
    });
}



function generatePartyKakao() {
  fetch("/party")
    .then(res => res.json())
    .then(data => {


      if (!data || data.length === 0) {
        window.location.href = "/app/";
        return;
      }

      const container = document.getElementById("party");
      container.innerHTML = "";

      const urlHost = getHostFromURL();
      const targetParties = urlHost
        ? data.filter(p => p.host.trim() === urlHost.trim())
        : data;

      targetParties.forEach(party => {
        const filtered = deduplicateByIdKeepHighestPower(
          characters.filter(c =>
            party.members.some(m => hasMinimumSubstringMatch(m, c.id, 2))
          )
        );

        // 파티 전체 감싸는 그룹
        const partyGroup = document.createElement("div");
        partyGroup.style.marginBottom = "60px";

        // 🎉 제목
        const title = document.createElement("h3");
        title.innerText = `🎉 ${party.host}님의 파티`;
        title.style.textAlign = "center";
        title.style.marginBottom = "20px";
        title.style.fontSize = "20px";
        title.style.color = "#fff";
        title.style.fontFamily = "'Nanum Gothic', sans-serif";
        partyGroup.appendChild(title);

        // 가로 카드 레이아웃
        const horizontalRow = document.createElement("div");
        horizontalRow.style.display = "flex";
        horizontalRow.style.flexWrap = "wrap";
        horizontalRow.style.justifyContent = "center";
        horizontalRow.style.alignItems = "flex-start";
        horizontalRow.style.gap = "30px";
        horizontalRow.style.width = "100%";

        // 🧑‍✈️ 파티장
        const hostCharacter = filtered.find(c =>
          hasMinimumSubstringMatch(party.host, c.id, 2)
        );
        if (hostCharacter) {
          const hostWrapper = document.createElement("div");
          hostWrapper.appendChild(createCharacterCard(hostCharacter));
          horizontalRow.appendChild(hostWrapper); // 파티장 먼저 추가
        }

        // 👥 파티원
        const memberContainer = document.createElement("div");
        memberContainer.style.display = "flex";
        memberContainer.style.flexWrap = "wrap";
        memberContainer.style.gap = "30px";
        memberContainer.style.justifyContent = "center";

        filtered
          .filter(c => !hasMinimumSubstringMatch(party.host, c.id, 2)) // 파티장 제외
          .forEach(c => memberContainer.appendChild(createCharacterCard(c)));

        horizontalRow.appendChild(memberContainer);
        partyGroup.appendChild(horizontalRow);
        container.appendChild(partyGroup);
      });
    })
    .catch(err => {
      console.error("❌ 카카오 파티 데이터 로딩 실패", err);
    });
}



function hasMinimumSubstringMatch(a, b, minLength = 2) {
  a = a.trim();
  b = b.trim();

  for (let i = 0; i <= a.length - minLength; i++) {
    const substr = a.substring(i, i + minLength);
    if (b.includes(substr)) return true;
  }

  return false;
}

function deduplicateByIdKeepHighestPower(arr) {
  const map = new Map();

  arr.forEach(c => {
    const existing = map.get(c.id);

    if (!existing || c.power > existing.power) {
      map.set(c.id, c); // 전투력이 더 높으면 교체
    }
  });

  return Array.from(map.values());
}


const classIdMap = {
  "전사": 1285686831, "대검전사": 2077040965, "검술사": 958792831, "궁수": 995607437,
  "석궁사수": 1468161402, "장궁병": 1901800669, "마법사": 1876490724, "화염술사": 1452582855,
  "빙결술사": 1262278397, "힐러": 323147599, "사제": 1504253211, "수도사": 204163716,
  "음유시인": 1319349030, "댄서": 413919140, "악사": 956241373, "도적": 1443648579,
  "격투가": 1790463651, "듀얼블레이드": 1957076952, "견습 전사": 33220478,
  "견습 궁수": 1600175531, "견습 마법사": 1497581170, "견습 힐러": 1795991954,
  "견습 음유시인": 2017961297, "견습 도적": 2058842272
};


async function fetchAllRankings() {
	console.log("testcode")
  const serverId = 3;
  for (let c of characters) {
    const classId = classIdMap[c.class];
    if (!classId) {
      console.warn(`❌ 클래스 ID 없음: ${c.class}`);
      continue;
    }

    try {
      const res = await fetch("/rankget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverid: serverId, classid: classId, t: "1" })
      });
      const data = await res.json();

      console.log(`🔍 [${c.id}] (${c.class}) 랭킹 데이터:`, data.rows?.slice(0, 3) || data); // 상위 3명만 출력

    } catch (err) {
      console.error(`❌ 조회 실패: ${c.id} (${c.class})`, err);
    }

    await new Promise(resolve => setTimeout(resolve, 300)); // 서버에 부담 안 주려고 300ms 딜레이
  }
}



window.addEventListener("DOMContentLoaded", () => {
  const host = getHostFromURL();
  const genKakaoBtn = document.querySelector(".genkakaoparty");


 if (host && genKakaoBtn) {
    genKakaoBtn.style.display = "none";
  }


  fetchCharacters().then(() => {
    if (window.location.pathname === "/app/") {
      showAllMembers();
	  fetchAllRankings();

    } else if (window.location.pathname.startsWith("/app/partyList") && host) {
      renderHostParty(host);
    }
  });
});



