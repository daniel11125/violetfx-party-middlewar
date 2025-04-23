// 1. URL 경로에서 호스트명 추출
const pathParts = window.location.pathname.split("/");
const hostName = decodeURIComponent(pathParts[pathParts.length - 1]);

// 2. /app/partyList/xxx 경로일 경우 실행
if (window.location.pathname.startsWith("/app/partyList/")) {

  console.log("🟡 호스트 경로:", hostName);

  // 2-1. 전체 파티 로그도 먼저 확인 (디버깅용)
  fetch("/party")
    .then(res => res.json())
    .then(data => {
      console.log("🧾 전체 파티 리스트:", data);
    });

  // 2-2. 개별 호스트 파티 가져오기
  fetch(`/party/${hostName}`)
    .then(res => {
      if (!res.ok) throw new Error("호스트 파티 없음");
      return res.json();
    })
    .then(partyData => {
      console.log("🎯 대상 파티 데이터:", partyData);

      if (!Array.isArray(partyData.members)) {
        console.error("❌ 형식 오류 - members가 배열이 아님:", partyData);
        return;
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
      document.getElementById("party").innerHTML =
        `<p style="color:red; text-align:center;">❌ 파티 데이터를 불러오지 못했습니다.<br>${err.message}</p>`;
      setTimeout(() => {
        window.location.href = "/app/";
      }, 2000); // 리디렉션 예의상 2초 대기
    });
}
