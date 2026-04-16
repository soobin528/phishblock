import React from "react";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <main id="home" className="lp">
      <section className="hero">
        <h1 className="title">URL 피싱 위험도 검사</h1>
        <p className="sub">
          URL을 입력하면 머신러닝 모델을 통해 피싱 위험도를 빠르게 분석합니다.
        </p>
      </section>

      <section id="features" className="grid">
        <article className="card">
          <h3>이 서비스는 무엇을 하나요?</h3>
          <p>
            의심스러운 URL을 분석해 피싱 및 가짜 웹사이트 공격 가능성을 탐지합니다.
          </p>
        </article>

        <article className="card">
          <h3>왜 중요한가요?</h3>
          <p>
            한 번의 클릭만으로도 개인정보 유출이나 금융 사기로 이어질 수 있습니다.
            접속 전에 반드시 확인하세요.
          </p>
        </article>

        <article className="card">
          <h3>악성 URL이란?</h3>
          <p>
            신뢰할 수 있는 사이트를 가장해 정보를 탈취하거나 악성 프로그램 유포를
            유도하도록 설계된 웹 주소입니다.
          </p>
        </article>
      </section>

      <section id="howto" className="section">
        <div className="sectionHead">
          <h2>사용 방법</h2>
          <p>아래 세 단계로 간단하게 확인할 수 있습니다.</p>
        </div>

        <div className="steps">
          <div className="step">
            <span>01</span> URL을 붙여넣으세요.
          </div>
          <div className="step">
            <span>02</span> AI가 분석을 실행합니다.
          </div>
          <div className="step">
            <span>03</span> 결과를 확인하세요.
          </div>
        </div>
      </section>

      <section id="contact" className="section">
        <div className="sectionHead">
          <h2>Dev</h2>
          <p> URL 구조 분석과 머신러닝 모델을 결합한 피싱 탐지 실험 프로젝트입니다.</p>
        </div>

        <div className="card">
          <p className="contact">
             Junior Developer. soobin <br/>
            
              </p>
        </div>
      </section>
    </main>
  );
}
