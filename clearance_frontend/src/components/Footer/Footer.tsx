import React from "react";
import { Mail, Phone, MapPin, Globe, Send, Heart } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { icon: Globe, text: "Official Website", href: "https://www.mkau.edu.et/" },
    { icon: Send, text: "Telegram Channel", href: "https://t.me/mekdelauniversity" },
    { icon: null, text: "Facebook Page", href: "https://www.facebook.com/Mekdela.Amba.University/" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div className="footer-block">
          <div className="brand-mini">
            <img
              src="/images/MAU.jpg"
              alt="MAU"
              className="brand-icon"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/40x40/3b82f6/ffffff?text=MAU";
              }}
            />
            <div>
              <h3 className="brand-mini-title">Mekdela Amba University</h3>
              <p className="brand-mini-sub">Online Clearance System</p>
            </div>
          </div>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "#64748b" }}>
            Streamlining paperless academic clearance for students, faculty,
            and administration.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-block">
          <h4 className="block-title">Quick Links</h4>
          <div className="mini-links">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="mini-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon ? (
                  <link.icon size={14} />
                ) : (
                  /* Facebook brand SVG (lucide removed it) */
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                  </svg>
                )}
                <span>{link.text}</span>
              </a>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div className="footer-block">
          <h4 className="block-title">Contact Us</h4>
          <div className="mini-contact">
            <div className="mini-contact-item">
              <Mail size={14} />
              <a href="mailto:info@mau.edu.et">info@mau.edu.et</a>
            </div>
            <div className="mini-contact-item">
              <Phone size={14} />
              <a href="tel:+251921459991">+251 921 459 991</a>
            </div>
            <div className="mini-contact-item">
              <MapPin size={14} />
              <span>Tulu Awulia, Ethiopia</span>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="footer-block copyright-block">
          <p className="copyright-text">
            © {currentYear} Mekdela Amba University. All rights reserved.
          </p>
          <p className="powered-mini">
            Built with <Heart size={12} className="heart-mini" /> for academic
            excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
