import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Phone, Globe, Send, Facebook,
  ShieldCheck, ArrowUp, Copy, Check,
  Building2, Key, ChevronRight
} from "lucide-react";
import { Tooltip, message } from "antd";
import { useTheme } from "../../App";
import { useLanguage } from "../../context/LanguageContext";
import OfficeDirectoryModal from "../Pages/OfficeDirectoryModal";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [verifyIdInput, setVerifyIdInput] = useState("");
  const [officeOpen, setOfficeOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyIdInput.trim()) {
      message.warning(
        language === 'am'
          ? 'እባክዎ የማጣሪያ መለያ ቁጥር ያስገቡ'
          : 'Please enter a Certificate ID or Student ID'
      );
      return;
    }
    navigate(`/verify-certificate?id=${encodeURIComponent(verifyIdInput.trim())}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    message.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      {/* ETHIOPIAN NATIONAL TRICOLOR ACCENT */}
      <div className="footer-national-ribbon" />

      {/* COMPACT MAIN FOOTER CONTENT */}
      <div className="footer-compact-container">
        {/* COL 1: UNIVERSITY BRAND & CONTACT */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            {/* ✅ Logo — no box, matching the header style */}
            <img
              src="/mau_logo.jpg"
              alt="MAU Emblem"
              className="footer-brand-logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/32x32/2563eb/ffffff?text=MAU";
              }}
            />
            <div>
              <h4 className="footer-brand-name">Mekdela Amba University</h4>
              <p className="footer-brand-sub">
                {language === 'am'
                  ? 'ዲጂታል የተማሪዎች ማጣሪያ ፖርታል'
                  : 'Digital Clearance Directorate'}
              </p>
            </div>
          </div>

          <div className="footer-contact-inline">
            <div className="contact-tag">
              <Phone size={12} className="contact-icon" />
              <a href="tel:+251921459991">+251 921 459 991</a>
              <Tooltip title="Copy Phone">
                <button
                  type="button"
                  className="copy-tiny-btn"
                  onClick={() => handleCopy("+251921459991", "Phone")}
                >
                  {copiedText === "Phone" ? (
                    <Check size={11} color="#10b981" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </Tooltip>
            </div>

            <div className="contact-tag">
              <Mail size={12} className="contact-icon" />
              <a href="mailto:info@mau.edu.et">info@mau.edu.et</a>
              <Tooltip title="Copy Email">
                <button
                  type="button"
                  className="copy-tiny-btn"
                  onClick={() => handleCopy("info@mau.edu.et", "Email")}
                >
                  {copiedText === "Email" ? (
                    <Check size={11} color="#10b981" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* COL 2: QUICK SERVICES */}
        <div className="footer-col nav-col">
          <span className="footer-col-heading">
            {language === 'am' ? 'ፈጣን አገልግሎቶች' : 'Quick Services'}
          </span>
          <div className="footer-link-group">
            <Link to="/student" className="footer-link-item">
              <ChevronRight size={11} />
              <span>
                {language === 'am' ? 'የተማሪ ዳሽቦርድ' : 'Student Dashboard'}
              </span>
            </Link>
            <Link to="/clearance-form" className="footer-link-item">
              <ChevronRight size={11} />
              <span>
                {language === 'am' ? 'ማጣሪያ ማመልከቻ' : 'Clearance Form'}
              </span>
            </Link>
            <Link to="/payment" className="footer-link-item">
              <ChevronRight size={11} />
              <span>
                {language === 'am' ? 'የወጪ መጋራት (Telebirr)' : 'Telebirr Payment'}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOfficeOpen(true)}
              className="footer-link-item directory-link"
            >
              <Building2 size={11} />
              <span>
                {language === 'am' ? 'የቢሮዎች ማውጫ' : 'Offices Directory'}
              </span>
            </button>
          </div>
        </div>

        {/* COL 3: PORTALS & DEVELOPER */}
        <div className="footer-col nav-col">
          <span className="footer-col-heading">
            {language === 'am' ? 'ፖርታሎች እና ኤፒአይ' : 'Portals & Developer'}
          </span>
          <div className="footer-link-group">
            <Link to="/registrar" className="footer-link-item">
              <ChevronRight size={11} />
              <span>
                {language === 'am' ? 'የሬጅስትራር ዳይሬክቶሬት' : 'Registrar Office'}
              </span>
            </Link>
            <Link to="/librarian" className="footer-link-item">
              <ChevronRight size={11} />
              <span>{language === 'am' ? 'ዋና ቤተ-መጽሐፍት' : 'Main Library'}</span>
            </Link>
            {/* ✅ Fixed path */}
            <Link to="/settings/api-keys" className="footer-link-item">
              <Key size={11} />
              <span>
                {language === 'am'
                  ? 'ዴቨሎፐር API እና ሴቲንግ'
                  : 'API Keys & Settings'}
              </span>
            </Link>
            <Link to="/developer-api" className="footer-link-item">
              <ChevronRight size={11} />
              <span>
                {language === 'am' ? 'ኤፒአይ ዶክመንቴሽን' : 'REST API Docs'}
              </span>
            </Link>
          </div>
        </div>

        {/* COL 4: INSTANT VERIFICATION WIDGET */}
        <div className="footer-col verify-col">
          <div className="verify-heading-row">
            <span className="footer-col-heading">
              <ShieldCheck size={13} className="verify-icon" />
              {language === 'am'
                ? 'ፈጣን ሰርተፊኬት ማረጋገጫ'
                : 'Instant Verification'}
            </span>
            <div className="status-indicator">
              <span className="status-dot" />
              <span className="status-label">11 Offices Online</span>
            </div>
          </div>

          <form onSubmit={handleQuickVerify} className="compact-verify-form">
            <input
              type="text"
              placeholder={
                language === 'am'
                  ? 'መለያ ቁጥር (ምሳሌ፡ AAA1234)'
                  : 'ID (e.g. AAA1234 or MAU-CLR)'
              }
              value={verifyIdInput}
              onChange={(e) => setVerifyIdInput(e.target.value)}
              className="compact-verify-input"
            />
            <button type="submit" className="compact-verify-btn">
              {language === 'am' ? 'ፈትሽ' : 'Verify'}
            </button>
          </form>

          <p className="compact-verify-hint">
            {language === 'am'
              ? 'በክሪፕቶግራፊክ ፊርማ የተረጋገጠ'
              : 'Cryptographically signed QR & SHA-256 seal check'}
          </p>
        </div>
      </div>

      {/* COMPACT BOTTOM BAR */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="bottom-left-group">
            <span className="copyright-span">
              © {currentYear} Mekdela Amba University
            </span>
            <div className="bottom-social-links">
              <a
                href="https://www.mkau.edu.et/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="MAU Website"
              >
                <Globe size={13} />
              </a>
              <a
                href="https://t.me/mekdelauniversity"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="Telegram Channel"
              >
                <Send size={13} />
              </a>
              <a
                href="https://www.facebook.com/Mekdela.Amba.University/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="Facebook Page"
              >
                <Facebook size={13} />
              </a>
            </div>
          </div>

          <div className="bottom-right-group">
            {/* LANGUAGE TOGGLE */}
            <button
              type="button"
              className="bottom-pill-btn"
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              title="Change Language"
            >
              <span>{language === 'en' ? '🇪🇹 አማርኛ' : '🇬🇧 English'}</span>
            </button>

            {/* THEME TOGGLE */}
            <button
              type="button"
              className="bottom-pill-btn"
              onClick={() => {
                const next = theme === 'light' ? 'dark' : 'light';
                setTheme(next);
                localStorage.setItem('theme', next);
              }}
              title="Toggle Theme"
            >
              <span>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</span>
            </button>

            {/* SCROLL TO TOP */}
            <button
              type="button"
              className="bottom-pill-btn top-btn"
              onClick={scrollToTop}
              title="Back to Top"
            >
              <ArrowUp size={12} />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>

      {/* OFFICE DIRECTORY MODAL */}
      <OfficeDirectoryModal
        open={officeOpen}
        onClose={() => setOfficeOpen(false)}
      />
    </footer>
  );
}
