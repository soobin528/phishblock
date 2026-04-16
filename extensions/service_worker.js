const API_BASE = "http://127.0.0.1:5000";

function simpleSignals(u){
  const v = (u || "").trim();
  const sig = [];

  if (v.length >= 75) sig.push("URL이 김");
  if ((v.match(/-/g) || []).length >= 3) sig.push("하이픈이 많음");
  if (v.includes("@")) sig.push("@ 포함");
  if ((v.match(/\./g) || []).length >= 4) sig.push("서브도메인이 많음");
  if (/\b\d{1,3}(\.\d{1,3}){3}\b/.test(v)) sig.push("IP 형태");

  return sig.slice(0, 5);
}

/**
 * ✅ 폴백은 "SAFE"가 아니라 "UNKNOWN"이 기본
 * - 서버가 꺼졌는데 SAFE 뜨면 포폴에서 오히려 마이너스임
 * - unknown으로 두고, 규칙이 강하게 의심될 때만 warning/danger로 올림
 */
function fallbackRisk(u){
  const sig = simpleSignals(u);

  let level = "unknown";
  if (sig.includes("IP 형태") || sig.includes("@ 포함")) level = "danger";
  else if (sig.length >= 2) level = "warning";

  return {
    risk_level: level,          // unknown / warning / danger
    probability: null,
    signals: sig,
    source: "fallback"
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "SCAN_URL") return;

  const url = msg.url;

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const sig = simpleSignals(url);
      sendResponse({ ok: true, source: "api", data: { ...data, signals: sig } });
    } catch (e) {
      const fb = fallbackRisk(url);
      sendResponse({ ok: true, source: fb.source, data: fb });
    }
  })();

  return true;
});
