import joblib
import numpy as np
from scipy.sparse import hstack

def extract_features(url):
    try:
        domain = url.split("//")[1].split("/")[0]
    except:
        domain = url

    return [
        len(url),
        len(domain),
        url.count("."),
        sum(c.isdigit() for c in url),
        url.count("-"),
        sum(not c.isalnum() for c in url),
        int(url.startswith("https")),
        int(domain.replace(".", "").isdigit()),
        int(any(word in url.lower() for word in ["login", "secure", "update", "verify"]))
    ]

vectorizer = joblib.load("vectorizer.pkl")
model = joblib.load("phish_model.pkl")

print("classes_:", model.classes_)

tests = [
    "https://naver.com",
    "https://www.naver.com",
    "https://google.com",
    "https://github.com",
    "http://login-secure-update.xyz",
    "http://verify-account-now.ru",
]

for url in tests:
    X_tfidf = vectorizer.transform([url])
    feats = np.array(extract_features(url)).reshape(1, -1)
    X = hstack([X_tfidf, feats])

    proba_all = model.predict_proba(X)[0]
    classes = list(model.classes_)
    phish_idx = classes.index(1)  # 1=피싱이라고 학습했다면
    p = float(proba_all[phish_idx])

    print(f"{url:40s}  phish_prob={p:.4f}  proba_all={proba_all}")
