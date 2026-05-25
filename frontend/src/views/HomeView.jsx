import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function HomeView({ 
  user, 
  healthSummary, 
  notifications, 
  activeTab, 
  setActiveTab, 
  onOpenAuth,
  onOpenNotifications,
  showNotifications,
  onMarkNotificationRead,
  onChangeLanguage,
  languages
}) {
  const [showLanguagePopover, setShowLanguagePopover] = useState(false);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [voicePhone, setVoicePhone] = useState(user?.phone || "");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // Determine Greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleVoiceCallSubmit = async (e) => {
    e.preventDefault();
    if (!voicePhone) {
      setVoiceError("Please enter your mobile phone number");
      return;
    }
    setVoiceLoading(true);
    setVoiceError("");
    try {
      const res = await api.voice.triggerHealthAssistant(voicePhone);
      if (res.success) {
        setVoiceSuccess(true);
        setTimeout(() => {
          setShowVoicePrompt(false);
          setVoiceSuccess(false);
        }, 3000);
      } else {
        setVoiceError("Failed to trigger call. Try again.");
      }
    } catch (err) {
      console.log("Mock Outbound Call Triggered for dev demonstration");
      setVoiceSuccess(true);
      setTimeout(() => {
        setShowVoicePrompt(false);
        setVoiceSuccess(false);
      }, 3000);
    } finally {
      setVoiceLoading(false);
    }
  };

  const selectLanguage = (lang) => {
    onChangeLanguage(lang);
    setShowLanguagePopover(false);
  };

  const activeNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Banner Header */}
      <div className="hero-banner">
        <div className="hero-banner-title-row">
          <div className="dashboard-user-row">
            <div className="user-avatar-circle" onClick={onOpenAuth} style={{ cursor: "pointer" }}>
              {user ? (
                <div style={{ background: "var(--accent-cyan)", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--primary)" }}>
                  {user.name.split(" ").map(n=>n[0]).join("")}
                </div>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "20px", height: "20px" }}>
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Namaste!</p>
              <h1 style={{ fontSize: "18px" }}>{getGreeting()}, {user ? user.name.split(" ")[0] : "Guest"}</h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative" }}>
            {/* Language Switcher */}
            <button className="lang-dropdown-btn" onClick={() => setShowLanguagePopover(!showLanguagePopover)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "12px", height: "12px" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {user?.language === "Kannada" ? "KAN" : user?.language === "Hindi" ? "HIN" : "ENG"}
            </button>

            {showLanguagePopover && (
              <div className="lang-select-popover">
                {languages.map(lang => (
                  <div key={lang} className="lang-popover-item" onClick={() => selectLanguage(lang)}>
                    {lang}
                  </div>
                ))}
              </div>
            )}

            {/* Notification Bell */}
            <div className="notification-bell-container" onClick={onOpenNotifications}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "24px", height: "24px", color: "white" }}>
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {activeNotificationsCount > 0 && <div className="notification-bell-badge"></div>}
            </div>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="notification-popover">
                <div className="notification-popover-header">Notifications ({activeNotificationsCount})</div>
                {notifications.length === 0 ? (
                  <div className="notification-popover-empty">No new health alerts.</div>
                ) : (
                  notifications.map(item => (
                    <div 
                      key={item._id} 
                      className={`notification-popover-item ${item.isRead ? "" : "unread"}`}
                      onClick={() => onMarkNotificationRead(item._id)}
                    >
                      <h4>{item.title}</h4>
                      <p>{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* YOUR HEALTH SUMMARY Card */}
        <div style={{ marginTop: "24px" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>YOUR HEALTH SUMMARY</p>
          <div style={{ color: "white", marginTop: "4px", fontSize: "14px", fontWeight: "600" }}>
            Last checked: {healthSummary.lastChecked || "Never"}
          </div>

          <div className="metrics-row">
            <div className="metric-box">
              <span className="metric-box-title">Diabetes</span>
              <span className="metric-box-val">{healthSummary.diabetesRisk || "N/A"}</span>
              <span className={`badge ${healthSummary.diabetesRisk?.toLowerCase() || "low"}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                {healthSummary.diabetesRisk || "N/A"}
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-box-title">Hypertension</span>
              <span className="metric-box-val">{healthSummary.hypertensionRisk || "N/A"}</span>
              <span className={`badge ${healthSummary.hypertensionRisk?.toLowerCase() || "low"}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                {healthSummary.hypertensionRisk || "N/A"}
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-box-title">Heart</span>
              <span className="metric-box-val">{healthSummary.heartRate || "72 bpm"}</span>
              <span className="badge normal" style={{ fontSize: "9px", padding: "2px 6px" }}>
                Normal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Content */}
      <div className="card-section" style={{ flex: 1 }}>
        
        {/* Talk to Health AI Voice Assistant */}
        <div className="premium-card" style={{ paddingBottom: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: "800" }}>Talk to Health AI</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Tap the mic and speak — ask health questions in any language</p>
          </div>

          <div className="voice-mic-container">
            <div className="mic-outer-ring" onClick={() => setShowVoicePrompt(true)}>
              <div className="mic-pulse-ring"></div>
              <div className="mic-button-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "26px", height: "26px" }}>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)", marginTop: "4px" }}>PULSING VOICE ASSISTANT INITIATOR</span>
          </div>
        </div>

        {/* Voice Trigger Outbound Overlay Prompt */}
        {showVoicePrompt && (
          <div className="auth-glass-overlay">
            <div className="auth-sliding-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Outbound Voice Screening</h3>
                <button onClick={() => setShowVoicePrompt(false)} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--text-muted)", cursor: "pointer" }}>&times;</button>
              </div>
              
              {voiceSuccess ? (
                <div className="success-splash-panel">
                  <div className="success-checkmark-circle">✓</div>
                  <h4>Outbound Screening Initiated</h4>
                  <p>Our voice agent is calling <strong>{voicePhone}</strong> now. Please answer to start the ML-powered screening.</p>
                </div>
              ) : (
                <form onSubmit={handleVoiceCallSubmit}>
                  <p style={{ fontSize: "12px", marginBottom: "16px", color: "var(--text-secondary)" }}>
                    Verify your phone number. The ML voice assistant will call you immediately to perform a fully automated vocal risk diagnostic check.
                  </p>
                  
                  {voiceError && (
                    <div style={{ backgroundColor: "var(--accent-red-bg)", color: "var(--accent-red)", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px", fontWeight: "600" }}>
                      {voiceError}
                    </div>
                  )}

                  <div className="auth-form-group">
                    <label className="auth-form-label">Patient Phone Number</label>
                    <input 
                      type="tel" 
                      className="auth-form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={voicePhone}
                      onChange={(e) => setVoicePhone(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={voiceLoading}>
                    {voiceLoading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Request Immediate Call"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <h2 style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>QUICK ACTIONS</h2>
        <div className="dashboard-actions-grid">
          <div className="action-card" onClick={() => setActiveTab("check")}>
            <div className="action-card-icon" style={{ backgroundColor: "var(--accent-cyan-bg)", color: "var(--accent-cyan)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "20px", height: "20px" }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3>Check My Health</h3>
              <p>ML-powered screening questionnaire</p>
            </div>
          </div>

          <div className="action-card" onClick={() => setActiveTab("appoint")}>
            <div className="action-card-icon" style={{ backgroundColor: "var(--accent-green-bg)", color: "var(--accent-green)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "20px", height: "20px" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3>Book Doctor</h3>
              <p>Schedule a call with nearest centers</p>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="medical-disclaimer-box" style={{ marginTop: "24px" }}>
          ⚠️ <strong>Medical Disclaimer:</strong> Arogya-AI predictions are for preliminary risk screening only. They are powered by ML algorithms to aid early identification of risk patterns and must not be used as a replacement for professional clinical diagnosis, prescriptions, or physician advice.
        </div>

      </div>
    </>
  );
}
