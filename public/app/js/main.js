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

// ✅ 파워 높은 캐릭터만 남기는 중복 제거
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
