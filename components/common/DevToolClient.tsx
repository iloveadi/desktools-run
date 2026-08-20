"use client";

import Link from "next/link";
import { ArrowLeft, Hammer, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

export default function DevToolClient({ title }: { title: string }) {
  const { t } = useLocale();

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            Back to All Tools
          </Link>
        </section>

        {/* Dev Status Banner */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 40px" }}>
          <div
            className="glass-card"
            style={{
              padding: "48px 32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              background: "rgba(245, 158, 11, 0.04)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fbbf24",
              }}
            >
              <Hammer size={32} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "100px",
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "12px",
                color: "#fbbf24",
                fontWeight: 700,
              }}
            >
              <Clock size={12} />
              🚧 출시 준비 중 (Under Active Development)
            </div>

            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                {title} 도구 준비 중입니다
              </h1>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
                현재 {title} 기능의 클라이언트 보안 모듈과 렌더링 엔진을 열심히 개발하고 있습니다. 곧 최상의 성능으로 찾아뵙겠습니다!
              </p>
            </div>

            {/* Checklist Preview */}
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                textAlign: "left",
                marginTop: "8px",
              }}
            >
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "2px" }}>
                개발 진행 현황 (Development Status)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-primary)" }}>
                <CheckCircle2 size={15} style={{ color: "#34d399" }} />
                <span>웹 브라우저 100% 로컬 연산 엔진 설계 완료</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-primary)" }}>
                <CheckCircle2 size={15} style={{ color: "#34d399" }} />
                <span>개인정보보호 및 메모리 최적화 검증 중</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                <Sparkles size={15} style={{ color: "#fbbf24" }} />
                <span>최종 UI/UX 마감 및 정밀 테스트 진행 중</span>
              </div>
            </div>

            <Link
              href="/"
              className="btn-glow"
              style={{
                padding: "12px 28px",
                fontSize: "14px",
                textDecoration: "none",
                marginTop: "12px",
              }}
            >
              <span>메인으로 돌아가기</span>
            </Link>
          </div>
        </section>

        {/* Unified Tool Guide */}
        <ToolGuide
          badgeText="100% Free & Browser-Native"
          aboutTitle={`${title} 도구란 무엇인가요?`}
          aboutDesc={`사용자의 브라우저에서 서버로 데이터를 전송하지 않고 100% 로컬 메모리에서 ${title} 작업을 처리할 수 있도록 개발 중인 유틸리티 도구입니다.`}
          howTitle="사용 방법 (출시 예정)"
          steps={[
            "원하는 파일이나 데이터를 드래그앤드롭하여 업로드합니다.",
            "상세 옵션을 설정하고 변환 버튼을 클릭합니다.",
            "결과물을 서버 전송 없이 즉시 브라우저에서 다운로드합니다.",
          ]}
          faqs={[
            { q: "언제쯤 사용할 수 있나요?", a: "현재 최종 검증 단계에 있으며 곧 서비스에 정식 적용될 예정입니다." },
            { q: "데이터 보안은 안전한가요?", a: "모든 처리가 사용자의 기기 내부 메모리에서만 수행되므로 데이터 유출 우려가 전혀 없습니다." },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
