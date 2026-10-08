import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Dropdown,
  Tag,
  Space,
  Avatar,
  Tooltip,
  Badge,
  Modal,
  Input,
  Alert,
} from "antd";
import type { MenuProps } from "antd";
import {
  Sun,
  Moon,
  User,
  LogOut,
  ShieldAlert,
  GraduationCap,
  Building2,
  BookOpen,
  Coffee,
  Home,
  Shield,
  Scale,
  Sparkles,
  Bell,
  Globe,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { clearSession, getSession, setSession } from "../../utils/api";
import { useTheme } from "../../App";
import { useLanguage } from "../../context/LanguageContext";
import type { UserRole } from "../../types";
import NotificationDrawer from "./NotificationDrawer";
import type { NotificationItem } from "./NotificationDrawer";
import OfficeDirectoryModal from "../Pages/OfficeDirectoryModal";
import "./Header.css";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [officeOpen, setOfficeOpen] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");

  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const user = getSession();

  const handleAdminAuthSubmit = async () => {
    const enteredUser = adminUsernameInput.trim();
    if (!enteredUser || !adminPasswordInput) {
      setAdminAuthError("Please enter both username and password.");
      return;
    }
    setAdminAuthError(
      "Real admin authentication is not yet wired to the backend."
    );
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "Library Clearance Approved",
      message: "Mulugeta Yilma (Main Library) approved your textbook clearance.",
      type: "success",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 2,
      title: "Payment Receipt Verified",
      message: "Telebirr 350 ETB payment for cafeteria dues has been verified.",
      type: "success",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "System Notice",
      message:
        "Registrar digital seals are now cryptographically signed and downloadable.",
      type: "info",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLinkClick = () => setMobileOpen(false);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRoleSwitch = (role: UserRole) => {
    if (!import.meta.env.DEV) return;
    const isStudent = role === "student";
    const demoUser = {
      id: isStudent ? 101 : 99,
      username: isStudent ? "AAA1234" : `${role}_demo`,
      email: `${role}@mau.edu.et`,
      first_name: isStudent ? "Demo" : role,
      last_name: isStudent ? "Student" : "Officer",
      full_name: isStudent ? "Demo Student" : `${role.toUpperCase()} Officer`,
      role,
      token: `demo_token_${role}`,
      id_number: isStudent ? "AAA1234" : undefined,
      department_name: "Software Engineering",
    };
    setSession(demoUser);

    const routes: Record<string, string> = {
      student: "/student",
      departmenthead: "/departmenthead",
      librarian: "/librarian",
      cafeteria: "/cafeteria",
      psychology: "/psychology",
      sportmaster: "/sportmaster",
      campuspolice: "/campuspolice",
      cooperationsharing: "/cooperationsharing",
      dopcordinator: "/dopcordinator",
      studentaffairs: "/studentaffairs",
      dormitory: "/dormitory",
      registrar: "/registrar",
      admin: "/admin",
    };
    navigate(routes[role] || "/");
  };

  const roleMenuItems: MenuProps["items"] = [
    {
      key: "header-role-title",
      label: (
        <span style={{ fontWeight: "bold", fontSize: "11px", color: "#888" }}>
          DEMO ROLE SWITCHER
        </span>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "student",
      label: "🎓 Student Portal",
      onClick: () => handleRoleSwitch("student"),
    },
    {
      key: "departmenthead",
      label: "🏢 Dept. Head Portal",
      onClick: () => handleRoleSwitch("departmenthead"),
    },
    {
      key: "librarian",
      label: "📚 Librarian Portal",
      onClick: () => handleRoleSwitch("librarian"),
    },
    {
      key: "cafeteria",
      label: "🍽️ Cafeteria Portal",
      onClick: () => handleRoleSwitch("cafeteria"),
    },
    {
      key: "dormitory",
      label: "🏠 Dormitory Portal",
      onClick: () => handleRoleSwitch("dormitory"),
    },
    {
      key: "registrar",
      label: "🎓 Registrar Portal",
      onClick: () => handleRoleSwitch("registrar"),
    },
    {
      key: "admin",
      label: "⚙️ Admin Dashboard",
      onClick: () => handleRoleSwitch("admin"),
    },
  ];

  const langMenuItems: MenuProps["items"] = [
    { key: "en", label: "🇬🇧 English", onClick: () => setLanguage("en") },
    { key: "am", label: "🇪🇹 አማርኛ (Amharic)", onClick: () => setLanguage("am") },
  ];

  const isPathActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  const NavLinkItem = ({
    to,
    label,
    icon,
    highlight,
  }: {
    to: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    highlight?: boolean;
  }) => {
    const active = isPathActive(to);
    return (
      <Link
        to={to}
        onClick={handleLinkClick}
        className={`nav-link ${active ? "active" : ""}`}
        style={highlight ? { fontWeight: 700 } : undefined}
      >
        <span className="nav-link-content">
          {icon && <span className="nav-link-icon">{icon}</span>}
          <span>{label}</span>
        </span>
      </Link>
    );
  };

  const renderAdminLink = () => {
    const active = currentPath === "/admin";
    return (
      <a
        href="#admin"
        onClick={(e) => {
          e.preventDefault();
          handleLinkClick();
          if (user?.role === "admin") {
            navigate("/admin");
          } else {
            setAdminAuthOpen(true);
          }
        }}
        className={`nav-link ${active ? "active" : ""}`}
        style={{ fontWeight: 700 }}
      >
        <span className="nav-link-content">
          <span className="nav-link-icon">
            <Shield size={15} style={{ color: "#f59e0b" }} />
          </span>
          <span>Admin</span>
        </span>
      </a>
    );
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* BRAND LOGO & TITLE */}
        <Link to="/" onClick={handleLinkClick} className="header-logo">
          <img
            className="logo-img"
            src="/mau_logo.jpg"
            alt="Mekdela Amba University Logo"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/80x80/2563eb/ffffff?text=MAU";
            }}
          />
          <div className="logo-text-wrapper">
            <span className="logo-title">{t("system_title")}</span>
            <span className="logo-subtitle">{t("system_subtitle")}</span>
          </div>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className="menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✖" : "☰"}
        </button>

        {/* NAVIGATION LINKS */}
        <nav className={`nav ${mobileOpen ? "open" : ""}`}>
          {/* MOBILE ONLY MENU HEADER */}
          <div className="mobile-menu-header mobile-only">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <img
                src="/mau_logo.jpg"
                alt="MAU Logo"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: "2px solid #f59e0b",
                  objectFit: "contain",
                  background: "#ffffff",
                  padding: 2,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/38x38/2563eb/ffffff?text=MAU";
                }}
              />
              <div>
                <div className="mobile-menu-title">University Navigation</div>
                <div className="mobile-menu-subtitle">{t("system_title")}</div>
              </div>
            </div>
            {user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: "rgba(37, 99, 235, 0.08)",
                  borderRadius: 8,
                  marginTop: 4,
                }}
              >
                <Avatar
                  size="small"
                  icon={<User size={14} />}
                  src={user.profile_picture_url}
                />
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  {user.first_name || user.username}
                </span>
                <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                  {user.role}
                </Tag>
              </div>
            )}
          </div>

          {!user && (
            <>
              <NavLinkItem to="/" label={t("home")} icon={<Home size={15} />} />
              <NavLinkItem
                to="/about"
                label={t("about")}
                icon={<Building2 size={15} />}
              />
              <NavLinkItem
                to="/learn-more"
                label={t("learn_more")}
                icon={<BookOpen size={15} />}
              />
              <NavLinkItem
                to="/verify-certificate"
                label="Verify Clearance"
                icon={<CheckCircle size={15} />}
              />
              {renderAdminLink()}
              <NavLinkItem
                to="/register"
                label={t("register")}
                icon={<User size={15} />}
              />
              {/* Sign In link removed — duplicate of the blue button on the right */}
            </>
          )}

          {user && user.role !== "admin" && renderAdminLink()}

          {user?.role === "student" && (
            <>
              <NavLinkItem
                to="/student"
                label={t("dashboard")}
                icon={<GraduationCap size={15} />}
              />
              <NavLinkItem
                to="/payment"
                label={t("payments")}
                icon={<Scale size={15} />}
              />
              <NavLinkItem
                to="/clearance-form"
                label={t("apply_clearance")}
                icon={<CheckCircle size={15} />}
              />
              <NavLinkItem
                to="/verify-certificate"
                label="Verify Certificate"
                icon={<CheckCircle size={15} />}
              />
            </>
          )}

          {user?.role === "departmenthead" && (
            <NavLinkItem
              to="/departmenthead"
              label="Dept Head Dashboard"
              icon={<Building2 size={15} />}
            />
          )}
          {user?.role === "librarian" && (
            <NavLinkItem
              to="/librarian"
              label="Library Portal"
              icon={<BookOpen size={15} />}
            />
          )}
          {user?.role === "cafeteria" && (
            <NavLinkItem
              to="/cafeteria"
              label="Cafeteria Portal"
              icon={<Coffee size={15} />}
            />
          )}
          {user?.role === "dormitory" && (
            <NavLinkItem
              to="/dormitory"
              label="Dormitory Portal"
              icon={<Home size={15} />}
            />
          )}
          {user?.role === "psychology" && (
            <NavLinkItem
              to="/psychology"
              label="Psychology Portal"
              icon={<User size={15} />}
            />
          )}
          {user?.role === "sportmaster" && (
            <NavLinkItem
              to="/sportmaster"
              label="Sport Portal"
              icon={<Sparkles size={15} />}
            />
          )}
          {user?.role === "campuspolice" && (
            <NavLinkItem
              to="/campuspolice"
              label="Police Portal"
              icon={<ShieldAlert size={15} />}
            />
          )}
          {user?.role === "cooperationsharing" && (
            <NavLinkItem
              to="/cooperationsharing"
              label="Cooperation Portal"
              icon={<Globe size={15} />}
            />
          )}
          {user?.role === "dopcordinator" && (
            <NavLinkItem
              to="/dopcordinator"
              label="DOP Portal"
              icon={<CheckCircle size={15} />}
            />
          )}
          {user?.role === "studentaffairs" && (
            <NavLinkItem
              to="/studentaffairs"
              label="Affairs Portal"
              icon={<GraduationCap size={15} />}
            />
          )}
          {user?.role === "registrar" && (
            <NavLinkItem
              to="/registrar"
              label="Registrar Portal"
              icon={<GraduationCap size={15} />}
            />
          )}
          {user?.role === "admin" && (
            <NavLinkItem
              to="/admin"
              label="Admin Portal"
              icon={<Shield size={15} />}
            />
          )}

          {/* MOBILE ONLY FOOTER ACTION BAR */}
          <div className="mobile-nav-divider mobile-only" />
          <div className="mobile-action-bar mobile-only">
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <Button
                size="middle"
                icon={<MapPin size={15} style={{ color: "#0284c7" }} />}
                onClick={() => {
                  setMobileOpen(false);
                  setOfficeOpen(true);
                }}
                style={{ flex: 1, borderRadius: 10, fontWeight: 600 }}
              >
                Offices Directory
              </Button>
              <Button
                size="middle"
                icon={<Globe size={15} style={{ color: "#2563eb" }} />}
                onClick={() => setLanguage(language === "en" ? "am" : "en")}
                style={{ flex: 1, borderRadius: 10, fontWeight: 600 }}
              >
                {language === "en" ? "🇪🇹 አማርኛ" : "🇬🇧 English"}
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                width: "100%",
                marginTop: 4,
              }}
            >
              <Button
                size="middle"
                icon={theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
                onClick={toggleTheme}
                style={{ flex: 1, borderRadius: 10, fontWeight: 600 }}
              >
                {theme === "light" ? "Dark Theme" : "Light Theme"}
              </Button>
              {user ? (
                <Button
                  size="middle"
                  danger
                  icon={<LogOut size={15} />}
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  style={{ flex: 1, borderRadius: 10, fontWeight: 600 }}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="middle"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* RIGHT ACTION BUTTONS */}
        <div className="header-right">
          <Tooltip title="Clearance Offices Directory">
            <Button
              size="small"
              icon={<MapPin size={15} style={{ color: "#0284c7" }} />}
              onClick={() => setOfficeOpen(true)}
              style={{ borderRadius: 20, fontSize: 12, fontWeight: 600 }}
              className="desktop-only"
            >
              Offices
            </Button>
          </Tooltip>

          <Dropdown menu={{ items: langMenuItems }} placement="bottomRight">
            <Button
              size="small"
              icon={<Globe size={15} style={{ color: "#2563eb" }} />}
              style={{ borderRadius: 20, fontSize: 12, fontWeight: 600 }}
            >
              {language === "en" ? "EN" : "አማ"}
            </Button>
          </Dropdown>

          <Tooltip title="Clearance Notifications">
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                shape="circle"
                icon={<Bell size={18} style={{ color: "#475569" }} />}
                onClick={() => setNotifOpen(true)}
              />
            </Badge>
          </Tooltip>

          <Dropdown menu={{ items: roleMenuItems }} placement="bottomRight">
            <Button
              size="small"
              icon={<Sparkles size={14} style={{ color: "#8b5cf6" }} />}
              style={{
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                borderColor: "#c084fc",
              }}
            >
              Demo Roles
            </Button>
          </Dropdown>

          {user ? (
            <Space>
              <Button
                type="text"
                onClick={() => navigate("/profile")}
                style={{ padding: "0 8px", height: "auto" }}
              >
                <Space size={6}>
                  <Avatar
                    size="small"
                    icon={<User size={14} />}
                    src={user.profile_picture_url}
                  />
                  <span
                    style={{ fontWeight: 600, fontSize: 13 }}
                    className="desktop-only"
                  >
                    {user.first_name || user.username}
                  </span>
                  <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                    {user.role}
                  </Tag>
                </Space>
              </Button>

              <Tooltip title="Logout">
                <Button
                  type="text"
                  danger
                  icon={<LogOut size={16} />}
                  onClick={handleLogout}
                />
              </Tooltip>
            </Space>
          ) : (
            <Link to="/login" className="desktop-only">
              <Button
                type="primary"
                style={{
                  borderRadius: 20,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Link>
          )}

          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* DRAWERS & MODALS */}
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      <OfficeDirectoryModal
        open={officeOpen}
        onClose={() => setOfficeOpen(false)}
      />

      {/* ADMIN PASSWORD MODAL */}
      <Modal
        title={
          <Space>
            <ShieldAlert size={20} style={{ color: "#2563eb" }} />
            <span>University Admin Security Gate</span>
          </Space>
        }
        open={adminAuthOpen}
        onCancel={() => {
          setAdminAuthOpen(false);
          setAdminAuthError("");
          setAdminUsernameInput("");
          setAdminPasswordInput("");
        }}
        onOk={handleAdminAuthSubmit}
        okText="Unlock Admin Portal"
        okButtonProps={{
          style: {
            background: "#2563eb",
            borderRadius: 8,
            fontWeight: 700,
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <div style={{ padding: "12px 0" }}>
          <p style={{ color: "#475569", marginBottom: 16 }}>
            Enter your administrator credentials to access the University
            Admin Console.
          </p>
          <Input
            placeholder="Admin username"
            value={adminUsernameInput}
            onChange={(e) => {
              setAdminUsernameInput(e.target.value);
              setAdminAuthError("");
            }}
            onPressEnter={handleAdminAuthSubmit}
            style={{
              borderRadius: 8,
              marginBottom: 12,
              padding: "8px 12px",
            }}
          />
          <Input.Password
            placeholder="Admin password"
            value={adminPasswordInput}
            onChange={(e) => {
              setAdminPasswordInput(e.target.value);
              setAdminAuthError("");
            }}
            onPressEnter={handleAdminAuthSubmit}
            style={{
              borderRadius: 8,
              marginBottom: 12,
              padding: "8px 12px",
            }}
          />
          {adminAuthError && (
            <Alert
              type="error"
              message={adminAuthError}
              showIcon
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}
          <Alert
            type="info"
            message="Backend not yet wired"
            description="Admin authentication will be performed server-side once the Django backend is running."
            showIcon
            style={{ borderRadius: 8 }}
          />
        </div>
      </Modal>
    </header>
  );
}
