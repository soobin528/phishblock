const $ = (id) => document.getElementById(id);

const urlInput = $("url");
const scanBtn = $("scan");
const statusEl = $("status");

const resultBox = $("result");
const badge = $("badge");
const riskText = $("riskText");
const riskSub = $("riskSub");
const probEl = $("prob");
const signalsBox = $("signals");

// 현재 탭 미리보기
const currentHostEl = $("currentHost");

/* utils */
function isHttp(u){
  return u.startsWith("http://") || u.startsWith("https://");
}

function setBadge(level){
  if (level === "safe"){
    badge.textContent = "SAFE";
    badge.style.color = "var(--safe)";
  } else if (level === "warning"){
    badge.textContent = "WARN";
    badge.style.color = "var(--warn)";
  } else if (level === "danger"){
    badge.textContent = "RISK";
    badge.style.color = "var(--danger)";
  } else {
    badge.textContent = "UNKNOWN";
    badge.style.color = "var(--muted)";
  }
}

function setSignals(list){
  signalsBox.innerHTML = "";

  if (!list || list.length === 0){
    const c = document.createElement("div");
    c.className = "chip";
    c.textContent = "뚜렷한 위험 신호 없음";
    signalsBox.appendChild(c);
    return;
  }

  list.forEach((s)=>{
    const c = document.createElement("div");
    c.className = "chip";
    c.textContent = s;
    signalsBox.appendChild(c);
  });
}

function setResult(data){
  const level = data?.risk_level || "unknown";
  setBadge(level);

  if (level === "safe"){
    riskText.textContent = "안전 가능성 높음";
    riskSub.textContent = "머신러닝 모델 기반 참고 결과";
  } else if (level === "warning"){
    riskText.textContent = "주의 필요";
    riskSub.textContent = "로그인/결제 전 추가 확인 권장";
  } else if (level === "danger"){
    riskText.textContent = "위험 신호 감지";
    riskSub.textContent = "접속 및 입력 자제 권장";
  } else {
    riskText.textContent = "판정 불가";
    riskSub.textContent = "서버 응답이 없어 결과를 제공할 수 없습니다.";
  }

  if (typeof data?.probability === "number"){
    probEl.textContent = `위험도 ${(data.probability * 100).toFixed(1)}%`;
    probEl.classList.remove("hidden");
  } else {
    probEl.classList.add("hidden");
  }

  setSignals(data?.signals);
  resultBox.classList.remove("hidden");
}

/* init */
async function init(){
  const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
  const u = tab?.url || "";

  // 현재 탭 도메인 표시
  if (currentHostEl){
    try {
      const p = new URL(u);
      currentHostEl.textContent = p.hostname;
    } catch {
      currentHostEl.textContent = "-";
    }
  }

  // http/https 아닌 페이지 제한
  if (!isHttp(u)){
    statusEl.textContent = "http/https 사이트에서만 사용 가능합니다.";
    scanBtn.disabled = true;
    urlInput.value = u;
    return;
  }

  // 입력창에 자동 채우기
  urlInput.value = u;

  // 초기 상태
  resultBox.classList.add("hidden");
  statusEl.textContent = "";
}

scanBtn.addEventListener("click", ()=>{
  const url = urlInput.value.trim();
  if (!url) return;

  if (!isHttp(url)){
    statusEl.textContent = "http/https 주소만 검사할 수 있어요.";
    return;
  }

  statusEl.textContent = "분석 중…";
  resultBox.classList.add("hidden");

  chrome.runtime.sendMessage({ type:"SCAN_URL", url }, (resp)=>{
    if (!resp || !resp.ok){
      statusEl.textContent = "분석 실패";
      setResult({ risk_level:"unknown", probability:null, signals:[] });
      return;
    }

    statusEl.textContent = resp.source === "api" ? "완료(모델)" : "완료(폴백)";
    setResult(resp.data);
  });
});

init();
