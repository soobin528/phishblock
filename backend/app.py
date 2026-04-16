from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from scipy.sparse import hstack
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

# ✅ V2 모델/벡터
vectorizer = joblib.load("vectorizer.pkl")
model = joblib.load("phish_model.pkl")

API_VERSION = "V2-FINAL-2026-01-31"

print("✅ API_VERSION =", API_VERSION)
print("✅ model.classes_ =", model.classes_)  # 보통 [0 1]


# -----------------------------
# URL 정규화: 입력을 최대한 "같은 형태"로 맞춤
# -----------------------------
def normalize_url(raw: str) -> str:
    u = (raw or "").strip().lower()
    if not u.startswith(("http://", "https://")):
        u = "https://" + u

    p = urlparse(u)
    host = (p.netloc or "").lower()
    if host.startswith("www."):
        host = host[4:]

    path = p.path or ""
    return f"{host}{path}"


# -----------------------------
# 구조 기반 피처 (V2에서 쓴 9개)
# -----------------------------
def extract_features(url: str):
    try:
        domain = url.split("//")[1].split("/")[0]
    except:
        domain = url

    return [
        len(url),                                  # URL 길이
        len(domain),                               # 도메인 길이
        url.count("."),                            # 점 개수
        sum(c.isdigit() for c in url),             # 숫자 개수
        url.count("-"),                            # 하이픈 개수
        sum(not c.isalnum() for c in url),         # 특수문자 개수
        int(url.startswith("https")),              # https 여부
        int(domain.replace(".", "").isdigit()),    # IP 기반 URL 여부
        int(any(w in url.lower() for w in ["login", "secure", "update", "verify"]))
    ]


@app.route("/predict", methods=["POST"])
def predict():
    # ✅ None 방지 (프론트가 뭘 보내든 서버가 터지지 않게)
    data = request.get_json(silent=True) or {}
    raw_url = (data.get("url") or "").strip()

    if not raw_url:
        return jsonify({
            "error": "URL이 비어 있습니다.",
            "api_version": API_VERSION
        }), 400

    # 1) 정규화 (www 제거 + 소문자 + 스킴 보정)
    norm = normalize_url(raw_url)

    # 2) ⭐ 핵심: 모델 입력(TF-IDF)은 www를 "항상 붙여서" 통일
    #    → www 있냐 없냐로 결과 갈리던 편향을 서비스 단계에서 제거
    norm_for_model = "www." + norm if not norm.startswith("www.") else norm

    # 3) TF-IDF + 구조 피처 결합
    X_tfidf = vectorizer.transform([norm_for_model])
    feats = np.array(extract_features("https://" + norm)).reshape(1, -1)
    X = hstack([X_tfidf, feats])

    # 4) 피싱(라벨=1) 확률 정확히 추출
    proba_all = model.predict_proba(X)[0]
    classes = list(model.classes_)

    if 1 not in classes:
        return jsonify({
            "error": f"모델 classes_에 1(피싱)이 없습니다. classes={classes}",
            "api_version": API_VERSION
        }), 500

    phish_idx = classes.index(1)
    proba = float(proba_all[phish_idx])

    # 5) 서비스용 기준 (너가 원했던 safe/warning/danger 구간)
    if proba < 0.3:
        risk_level = "safe"
    elif proba < 0.6:
        risk_level = "warning"
    else:
        risk_level = "danger"

    prediction = int(proba >= 0.6)

    return jsonify({
        "prediction": prediction,
        "probability": round(proba, 4),
        "risk_level": risk_level,

        # ✅ 디버그(반영 확인용) - 나중에 빼도 됨
        "api_version": API_VERSION,
        "normalized": norm,
        "normalized_for_model": norm_for_model
    })


if __name__ == "__main__":
    print("🚀 Flask phishing detection API 서버 실행 중…")
    app.run(host="0.0.0.0", port=5000)
