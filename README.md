# 🛡️ PhishBlock  
ML 기반 하이브리드 피싱 URL 탐지 시스템

---

## 📌 프로젝트 개요
피싱 URL 탐지 과정에서 발생하는 **한국 도메인 오탐 문제를 해결하기 위해**,  
데이터 보정과 Feature Engineering을 적용하여 모델 성능을 개선하고,  
Flask API와 Chrome Extension을 통해 **실시간 분석이 가능한 서비스로 구현**

---

## 🛠 기술 스택
- **Language**: Python, JavaScript  
- **ML**: Scikit-learn (TF-IDF, Logistic Regression), Pandas, Joblib  
- **Backend**: Flask (REST API)  
- **Frontend**: Chrome Extension, Chart.js  

---

## 🧠 모델 구조
- TF-IDF 기반 문자 n-gram (3~5)
- URL 구조 Feature 9개 추가
  - URL 길이, 도메인 길이  
  - 숫자 개수, 특수문자 개수  
  - HTTPS 여부, IP 주소 여부 등  
- TF-IDF + 구조 Feature 결합 (**하이브리드 모델**)

---

## 🚀 모델 개선 (V1 → V2)

### 🔵 V1
- TF-IDF 기반 문자열 패턴만 사용  
- 한국 URL 오탐 발생  
- 짧은 URL 분류 불안정  

### 🟣 V2
- 한국 정상 URL 500건 추가 (**데이터 보정**)  
- 구조 Feature 9개 추가 (**Feature Engineering**)  
- TF-IDF + Feature 결합  
- Threshold 조정  

👉 **데이터 편향 + 모델 구조 한계를 동시에 개선**

---

## 📊 성능
- Accuracy: **97%**  
- Precision: **0.98**  
- Recall: **0.96**  
- F1-score: **0.97**

---

## ⚠️ 트러블슈팅

### 1. 일부 피싱 URL이 낮은 위험도로 판단되는 문제
- **문제 상황**  
일부 피싱 URL이 정상으로 분류되거나 낮은 위험도로 출력됨  

- **원인 분석**
  - TF-IDF가 특정 문자열 패턴에 과도하게 의존  
  - URL 전체 구조 반영 부족  
  - 특정 피싱 도메인 패턴 데이터 부족  

- **개선 방향**
  - 도메인 기반 Feature 강화  
  - keyword 가중치 조정  
  - threshold 및 앙상블 모델 적용 고려  

- **결론**  
👉 모델 성능은 **데이터와 Feature 설계에 크게 의존**함을 확인  

---

### 2. 한국형 정상 URL 오탐 및 짧은 URL 판별 오류 (V1 → V2 개선)
- **문제 상황**
  - `naver.com`, `daum.net` 등 정상 URL 오탐 발생  
  - 짧은 URL 분류 불안정  

- **원인 분석**
  - 해외 데이터 중심 → 한국 도메인 학습 부족  
  - TF-IDF는 구조 정보 반영 불가  
  - 짧은 URL은 Feature 부족  

- **해결 방안**
  - 한국 정상 URL 500건 추가  
  - 구조 Feature 9개 추가  
  - TF-IDF + Feature 결합  

- **결과**
  - 한국 URL 오탐 해결  
  - 짧은 URL 안정성 개선  
  - Precision / Recall 개선  

---

## 💡 인사이트
- 도메인 특화 데이터가 모델 성능에 큰 영향  
- Feature Engineering이 성능 개선의 핵심  
- 단순 모델보다 데이터 설계가 중요함  

---

## 🎯 한 줄 요약
TF-IDF 기반 모델의 한계를 **Feature Engineering과 데이터 보정으로 개선한 피싱 URL 탐지 시스템**