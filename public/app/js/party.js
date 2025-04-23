// ✅ 캐릭터 데이터 fetch 이후 characters 전역에 저장됨을 가정
let characters = [];

// 🧠 URL에서 호스트 추출 함수
function getHostFromURL() {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // 1순위: 쿼리 파라미터
  if (params.has("host")) {
    return decodeURIComponent(params.get("host"));
  }

  // 2순위: 경로 기반 (예: /app/partyList/꼬꼬먀)
  const pathParts = pathname.split("/");
  if (pathname.startsWith("/app/partyList/") && pathParts.length >= 4) {
    return decodeURIComponent(pathParts[3]);
  }

  return null;
}

// ✅ 특정 호스트의 파티 시각화
function renderHostParty(hostName) {
  console.log("🎯 조회할 호스트:", hostName);

  fetch(`/party/${hostName}`)
    .then((res) => {
      if (!res.ok) throw new Error("호스트 파티 없음");
      return res.json();
    })
    .then((partyData) => {
      console.log("📦 파티 데이터:", partyData);
      if (!partyData.members || !Array.isArray(partyData.members)) {
        throw new Error("파티 members 형식 오류");
      }

      const ids = partyData.members.map((m) => m.trim().toLowerCase());
      const filtered = deduplicateByIdKeepHighestPower(
        characters.filter((c) => ids.includes(c.id.trim().toLowerCase()))
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

      filtered.forEach((c) => {
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
    .catch((err) => {
      console.error("❌ 파티 조회 실패:", err);
      document.getElementById("party").innerHTML = `
        <p style="color:red; text-align:center;">
        ❌ 파티 데이터를 불러오지 못했습니다.<br>${err.message}
        </p>`;
      setTimeout(() => {
        window.location.href = "/app/";
      }, 2000);
    });
}

// ✅ 페이지가 /app/partyList일 경우 자동 실행
if (
  window.location.pathname.startsWith("/app/partyList") &&
  document.getElementById("party")
) {
  const host = getHostFromURL();

  if (!host) {
    document.getElementById("party").innerHTML =
      "<p style='color:red; text-align:center;'>❌ 호스트명이 지정되지 않았습니다.</p>";
  } else {
    // 캐릭터 데이터가 다 로드된 후 실행 보장 필요
    const waitUntilCharactersReady = setInterval(() => {
      if (characters && characters.length > 0) {
        clearInterval(waitUntilCharactersReady);
        renderHostParty(host);
      }
    }, 200);
  }
}
