#  PhishBlock: ML 기반 피싱 URL 탐지 서비스

##  프로젝트 개요
피싱 URL 탐지 과정에서 발생하는 한국 도메인 오탐 문제를 해결하기 위해  
데이터 보정과 Feature Engineering을 적용하여 모델 성능을 개선하고,  
Flask API와 Chrome Extension을 통해 실시간 분석이 가능한 서비스로 구현한 프로젝트

---

##  기술 스택
- Python, JavaScript  
- Scikit-learn (TF-IDF, Logistic Regression), Pandas, Joblib  
- Flask (REST API)  
- Chrome Extension, Chart.js  

---

##  모델 구조

- TF-IDF 기반 문자 n-gram (3~5)
- URL 구조 Feature 9개 추가
  - URL 길이, 도메인 길이
  - 숫자 개수, 특수문자 개수
  - HTTPS 여부, IP 주소 여부 등
- TF-IDF + 구조 Feature 결합 (하이브리드 모델)

---

## 모델 개선 (V1 → V2)

### V1 (기본 모델)  
- TF-IDF 기반 문자열 패턴만 활용
- 한국 URL 오탐 발생
- 짧은 URL 분류 불안정

### V2 (개선 모델)
- 한국 정상 URL 500건 추가 (데이터 보정)
- URL 구조 Feature 9개 추가 (Feature Engineering)
- TF-IDF + Feature 결합
- threshold 조정

=> 데이터 편향 + 모델 구조 한계 동시에 개선

---

##  성능

- Accuracy: 97%
- Precision: 0.98
- Recall: 0.96
- F1-score: 0.97