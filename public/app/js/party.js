// 1. URL 경로에서 호스트명 추출
const pathParts = window.location.pathname.split("/");
const hostName = decodeURIComponent(pathParts[pathParts.length - 1]);

// 2. 만약 /app/partyList/xxx 경로면 실행
if (window.location.pathname.startsWith("/app/partyList/")) {
  fetch(`/party/${hostName}`)
    .then(res => {
      if (!res.ok) throw new Error("호스트 파티 없음");
      return res.json();
    })
    .then(partyData => {
      if (!Array.isArray(partyData.members)) {
        console.error("파티 형식 오류:", partyData);
        return;
      }

      // 멤버 id 리스트 (공백 제거)
      const ids = partyData.members.map(m => m.trim());

      // characters가 이미 로드된 상태여야 함
      const filtered = deduplicateByIdKeepHighestPower(
        characters.filter(c => ids.includes(c.id))
      );

      const partyEl = document.getElementById("party");
      partyEl.innerHTML = ""; // 기존 제거

      const title = document.createElement("h3");
      title.textContent = `👑 ${partyData.host}님의 파티`;
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
      document.getElementById("party").innerHTML = `<p style="color:red; text-align:center;">❌ 파티 데이터를 불러오지 못했습니다.<br>${err.message}</p>`;
    });
}
