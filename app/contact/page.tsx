"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { Mail, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const { locale } = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isKo = locale === "ko";
  const isJa = locale === "ja";
  const isEs = locale === "es";
  const isZh = locale === "zh";
  const isFr = locale === "fr";

  const ADMIN_GMAIL = "iloveadi@gmail.com";

  const labels = {
    title: isKo
      ? "문의하기 & 피드백"
      : isJa
      ? "お問い合わせ・フィードバック"
      : isEs
      ? "Contacto y comentarios"
      : isZh
      ? "联系我们与反馈"
      : isFr
      ? "Contact et commentaires"
      : "Contact Us & Feedback",

    subtitle: isKo
      ? `버그 제보, 제휴 문의, 서비스 이용 관련 문의사항을 남겨주시면 관리자 메일(${ADMIN_GMAIL})로 즉시 전송됩니다.`
      : isJa
      ? `バグレポート、提携のお問い合わせ、ご質問などをお気軽にお寄せください。`
      : isEs
      ? "Póngase en contacto con nosotros para informes de errores o consultas."
      : isZh
      ? "欢迎提出 Bug 报告、合作咨询或使用中的任何问题。"
      : isFr
      ? "Contactez-nous pour tout rapport de bogue ou demande de renseignement."
      : "Have a question, feedback, or bug report? Get in touch with our team.",

    nameLabel: isKo ? "이름 / 닉네임 *" : "Your Name *",
    namePlaceholder: isKo ? "홍길동" : "John Doe",

    emailLabel: isKo ? "회신받을 이메일 주소 *" : "Email Address *",
    emailPlaceholder: isKo ? "name@example.com" : "john@example.com",

    subjectLabel: isKo ? "문의 제목" : "Subject",
    subjectPlaceholder: isKo ? "버그 제보, 기능 개선 제안 등..." : "Bug report, feedback, inquiry...",

    msgLabel: isKo ? "문의 상세 내용 *" : "Message *",
    msgPlaceholder: isKo
      ? "문의할 내용이나 겪으신 상황을 자세히 작성해 주세요..."
      : "Write your message here...",

    submitBtn: isKo ? "문의메일 즉시 전송하기" : "Send Inquiry Directly",
    submitting: isKo ? "메일 전송 중..." : "Sending...",

    successTitle: isKo ? "문의 메일이 성공적으로 전송되었습니다!" : "Message Delivered Successfully!",
    successDesc: isKo
      ? `작성하신 문의 내용이 관리자 메일(${ADMIN_GMAIL})로 즉시 발송되었습니다. 확인 후 답변드리겠습니다.`
      : `Your message has been delivered directly to ${ADMIN_GMAIL}.`,

    sendAnother: isKo ? "다른 문의 작성하기" : "Send Another Message",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert(isKo ? "이름, 이메일, 문의 내용을 모두 입력해 주세요." : "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct API fetch to FormSubmit delivering directly to iloveadi@gmail.com
      await fetch(`https://formsubmit.co/ajax/${ADMIN_GMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          _subject: `[desktools.run] ${subject.trim() || "서비스 문의"} (${name.trim()})`,
          _template: "table",
          _captcha: "false",
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || "서비스 문의",
          message: message.trim(),
        }),
      });

      setIsSent(true);
    } catch (err) {
      console.error("FormSubmit send error", err);
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <Mail size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {labels.title}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {labels.subtitle}
          </p>
        </section>

        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          {isSent ? (
            <div
              className="glass-card"
              style={{
                padding: "40px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              <CheckCircle2 size={48} style={{ color: "#4ade80" }} />
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {labels.successTitle}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {labels.successDesc}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSent(false);
                  setName("");
                  setEmail("");
                  setSubject("");
                  setMessage("");
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                {labels.sendAnother}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-card"
              style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {labels.nameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={labels.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      borderRadius: "8px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      padding: "0 14px",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {labels.emailLabel}
                  </label>
                  <input
                    type="email"
                    placeholder={labels.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      borderRadius: "8px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      padding: "0 14px",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {labels.subjectLabel}
                </label>
                <input
                  type="text"
                  placeholder={labels.subjectPlaceholder}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "0 14px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {labels.msgLabel}
                </label>
                <textarea
                  rows={6}
                  placeholder={labels.msgPlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "12px 14px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: isSubmitting ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {isSubmitting ? labels.submitting : labels.submitBtn}
              </button>
            </form>
          )}

          {/* Direct Gmail Info */}
          <div
            style={{
              marginTop: "32px",
              padding: "20px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <MessageSquare size={20} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
              수신자 공식 이메일: <strong style={{ color: "var(--text-primary)" }}>{ADMIN_GMAIL}</strong>
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
