import React, { useMemo, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import RiskGauge from "./components/RiskGauge";
import LoaderTyping from "./components/LoaderTyping";

// Flask 주소 (필요하면 여기만 바꾸면 됨)
const API_BASE = "http://127.0.0.1:5000";

function isValidUrlLike(input) {
  // ✅ 버튼 잠금 풀기: https:// 없어도 도메인 형태면 통과
  const v = input.trim();
  if (!v) return false;

  // http(s) 있으면 OK
  if (v.startsWith("http://") || v.startsWith("https://")) return true;

  // 없으면 최소 조건(점 포함 + 공백 없음)만 만족하면 OK
  return v.includes(".") && !v.includes(" ");
}

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // 결과 상태
  const [probability, setProbability] = useState(null); // 0~1
  const [label, setLabel] = useState(""); // "피싱" / "정상" 등
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => isValidUrlLike(url) && !loading, [url, loading]);

  // ✅ “주의 신호(요약)” + “참고” 분리 (과장/단정 방지)
  const reasons = useMemo(() => {
    const v = url.trim();
    if (!v) return { chips: [], notes: [] };

    const chips = [];
    const notes = [];

    // Top3(주의 신호) - “피싱 확정” 같은 단정 표현 금지
    if (v.length >= 75) chips.push("URL이 길어 위장 가능성 ↑");
    if ((v.match(/-/g) || []).length >= 3) chips.push("하이픈(-)이 많아 도메인 위장 가능성");
    if (v.includes("@")) chips.push("@ 포함 (리다이렉트/계정정보 유도 가능성)");
    if ((v.match(/\./g) || []).length >= 4) chips.push("서브도메인이 많음 (위장 가능성)");
    if (/\b\d{1,3}(\.\d{1,3}){3}\b/.test(v)) chips.push("IP 주소 형태 URL (주의)");

    // HTTPS는 “피싱 근거”가 아니라 “보안 참고”
    const isHttps = v.startsWith("https://");
    if (!isHttps) notes.push("HTTPS(암호화) 미사용: 로그인/결제 입력은 특히 주의");

    return { chips: chips.slice(0, 3), notes };
  }, [url]);

  async function handleScan(e) {
    e.preventDefault();
    setError("");
    setLabel("");
    setProbability(null);

    let trimmed = url.trim();

    if (!trimmed) {
      setError("URL을 입력해주세요.");
      return;
    }

    // ✅ https:// 없으면 자동으로 붙여서 서버에 보냄
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      trimmed = `https://${trimmed}`;
    }

    // (이 시점에는 최소한 URL 형태)
    if (!isValidUrlLike(trimmed)) {
      setError("올바른 URL을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 기대: POST /predict  { url: "..." }
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`서버 응답 오류: ${res.status}`);
      }

      const data = await res.json();

      const pRaw =
        data.probability ?? data.prob ?? data.score ?? data.confidence ?? data.risk;

      const labelRaw = data.result ?? data.label ?? data.prediction ?? "";

      let p = null;
      if (typeof pRaw === "number") {
        p = pRaw > 1 ? pRaw / 100 : pRaw;
        p = Math.max(0, Math.min(1, p));
      }

      let niceLabel = "";
      if (typeof labelRaw === "string" && labelRaw) {
        const low = labelRaw.toLowerCase();
        if (low.includes("phish") || low.includes("mal")) niceLabel = "피싱 의심";
        else if (low.includes("safe") || low.includes("benign") || low.includes("normal"))
          niceLabel = "정상 가능성 높음";
        else niceLabel = labelRaw;
      } else {
        if (p === null) niceLabel = "분석 완료";
        else if (p >= 0.7) niceLabel = "피싱 의심";
        else if (p >= 0.2) niceLabel = "주의 필요";
        else niceLabel = "정상 가능성 높음";
      }

      setProbability(p);
      setLabel(niceLabel);
    } catch (err) {
      setError(
        "분석에 실패했습니다. 백엔드(Flask)가 실행 중인지, /predict 엔드포인트가 맞는지 확인해주세요."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="main">
        <section id="scan" className="scanHero">
          <div className="scanHead">
            <h1 className="scanTitle">URL 피싱 위험도 검사</h1>
            <p className="scanSub">
              URL을 붙여넣으면 머신러닝 모델 기반으로 위험도를 예측합니다.
            </p>
          </div>

          <form className="scanBox" onSubmit={handleScan}>
            <div className="scanRow">
              <input
                className="scanInput"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                autoComplete="off"
              />
              <button className="scanBtn" type="submit" disabled={!canSubmit}>
                {loading ? "분석 중..." : "검사하기"}
              </button>
            </div>

            {error && <div className="scanError">{error}</div>}

            {loading && (
              <div className="scanLoading">
                <LoaderTyping />
              </div>
            )}

            {(label || probability !== null) && !loading && (
              <div className="resultCard">
                <div className="resultTop">
                  <div className="resultLabel">{label || "분석 결과"}</div>

                  {probability !== null && (
                    <div className="resultMeta">
                      <span className="metaKey">위험도</span>
                      <span className="metaVal">{(probability * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {probability !== null && <RiskGauge probability={probability} />}

                <div className="reasonArea">
                  <div className="reasonTitle">주의 신호(요약)</div>

                  {reasons.chips.length === 0 ? (
                    <div className="reasonEmpty">
                      뚜렷한 위험 신호가 감지되지 않았습니다.
                    </div>
                  ) : (
                    <div className="reasonChips">
                      {reasons.chips.map((r) => (
                        <span key={r} className="chip">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {reasons.notes?.length > 0 && (
                    <div className="reasonNotes">
                      {reasons.notes.map((n) => (
                        <div key={n} className="note">
                          
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="reasonNote">
                    * 위 항목은 URL 형태 기반 참고 정보이며, 최종 판단은 모델 예측과 사용자 주의를
                    함께 고려하세요.
                  </div>
                </div>
              </div>
            )}
          </form>
        </section>

        <LandingPage />
      </main>
    </div>
  );
}
