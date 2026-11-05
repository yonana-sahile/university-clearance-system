import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Select, Alert, message, Typography, Spin } from 'antd';
import {
  GraduationCap, User, Shield, Lock, Mail,
  ArrowRight, CheckCircle, Key
} from 'lucide-react';
import { apiFetch, setSession } from '../../utils/api';
import type { UserRole } from '../../types';
import './LoginPage.css';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // ✅ Dynamic Roles State
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // ✅ Global Lock State
  const [clearanceReleased, setClearanceReleased] = useState<boolean>(false);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);

  const isStudent = selectedRole === 'student';

  // ✅ Helper to format role strings into beautiful labels
  const formatRoleLabel = (roleValue: string) => {
    const roleMap: Record<string, string> = {
      student: '🎓 Student',
      departmenthead: '🏢 Department Head',
      librarian: '📚 Librarian',
      cafeteria: '🍽️ Cafeteria Admin',
      dormitory: '🏠 Dormitory Manager',
      psychology: '🧠 Counseling / Psychology',
      sportmaster: '🏆 Sport Master',
      campuspolice: '👮 Campus Police',
      cooperationsharing: '🤝 Cooperation & Sharing',
      dopcordinator: '📜 Degree Program Coordinator',
      studentaffairs: '🏛️ Student Affairs',
      registrar: '🎓 Registrar Office',
      admin: '⚙️ System Administrator',
    };
    // If it's a known role, use the map. If it's a custom role (like supermarket), format it dynamically.
    return roleMap[roleValue] || `🛡️ ${roleValue.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;
  };

  // ✅ Fetch Global Lock Status & Dynamic Roles
  useEffect(() => {
    // 1. Check Portal Status
    apiFetch('system/settings')
      .then((res) => {
        setClearanceReleased(!!res.is_clearance_open);
      })
      .catch((err) => {
        console.error('Failed to load system settings', err);
      })
      .finally(() => {
        setSettingsLoading(false);
      });

    // 2. Fetch Active Roles from Workflow
    apiFetch('public/roles')
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedRoles = data.map((r: string) => ({
            label: formatRoleLabel(r),
            value: r,
          }));
          setRoles(formattedRoles);
        }
      })
      .catch((err) => {
        console.error('Failed to load roles', err);
        // Fallback to student just in case
        setRoles([{ label: '🎓 Student', value: 'student' }]);
      })
      .finally(() => {
        setRolesLoading(false);
      });
  }, []);

  const handleFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        role: selectedRole,
        username: values.identifier,
        email: isStudent ? values.identifier : undefined,
        password: values.password,
      };

      const res = await apiFetch('login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.user) {
        setSession(res.user);
        const roleRoutes: Record<string, string> = {
          student: '/student',
          departmenthead: '/departmenthead',
          librarian: '/librarian',
          cafeteria: '/cafeteria',
          psychology: '/psychology',
          sportmaster: '/sportmaster',
          campuspolice: '/campuspolice',
          cooperationsharing: '/cooperationsharing',
          dopcordinator: '/dopcordinator',
          studentaffairs: '/studentaffairs',
          dormitory: '/dormitory',
          registrar: '/registrar',
          admin: '/admin',
        };

        // ✅ Navigate based on the ACTUAL backend role, not just the dropdown
        const actualRole = res.user.role || selectedRole;

        // If it's a custom role (e.g., supermarket), send them to the dynamic route
        const destination = roleRoutes[actualRole] || `/${actualRole}`;
        navigate(destination);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Combined Loading state for the initial page load
  const pageLoading = settingsLoading || rolesLoading;

  return (
    <div className="mau-login-wrapper mau-theme-adey-abeba">
      <div className="mau-login-backdrop-glow" aria-hidden="true" />

      <div className="mau-login-card">
        <div className="mau-national-ribbon">
          <div className="mau-ribbon-green" />
          <div className="mau-ribbon-yellow" />
          <div className="mau-ribbon-red" />
        </div>

        {/* LEFT PANEL */}
        <div className="mau-login-hero-panel">
          <div className="mau-hero-overlay" />
          <div className="mau-hero-content">
            <div>
              <div className="mau-institution-brand">
                <img
                  src="/mau_logo.jpg"
                  alt="MAU"
                  className="mau-crest-badge"
                  onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60/2563eb/ffffff?text=MAU'}
                />
                <div className="mau-institution-texts">
                  <span className="mau-amharic-title">መቅደላ አምባ ዩኒቨርሲቲ</span>
                  <span className="mau-english-title">Mekdela Amba University</span>
                  <span className="mau-accreditation-tag">FDRE Ministry of Education</span>
                </div>
              </div>

              <div className="mau-hero-body">
                <h1 className="mau-system-headline">
                  Official Academic <span>Clearance Portal</span>
                </h1>
                <p className="mau-system-desc">
                  Unified institutional digital gateway for graduating seniors and 13 university directorates.
                </p>

                <div className="mau-pillars-list">
                  <div className="mau-pillar-item">
                    <div className="mau-pillar-icon-box"><GraduationCap size={16} /></div>
                    <div className="mau-pillar-text">
                      <span className="mau-pillar-title">100% Paperless Workflow</span>
                      <span className="mau-pillar-subtitle">Clear all 13 academic and financial directorates online.</span>
                    </div>
                  </div>
                  <div className="mau-pillar-item">
                    <div className="mau-pillar-icon-box"><Key size={16} /></div>
                    <div className="mau-pillar-text">
                      <span className="mau-pillar-title">Cryptographic QR Verification</span>
                      <span className="mau-pillar-subtitle">Tamper-proof clearance certificates instantly verifiable.</span>
                    </div>
                  </div>
                  <div className="mau-pillar-item">
                    <div className="mau-pillar-icon-box"><Shield size={16} /></div>
                    <div className="mau-pillar-text">
                      <span className="mau-pillar-title">Secure Dues Settlement</span>
                      <span className="mau-pillar-subtitle">Integrated CBE Birr, Telebirr, and bank receipt reconciliation.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mau-hero-footer">
              {settingsLoading ? (
                <div className="mau-live-status status-loading" style={{ background: 'rgba(12, 8, 2, 0.9)', color: '#ffd000', border: '1.5px solid #ffd000' }}>
                  <Spin size="small" style={{ marginRight: 8 }} /> Checking Portal Status...
                </div>
              ) : (
                <div className={`mau-live-status ${clearanceReleased ? 'status-open' : 'status-locked'}`}>
                  {clearanceReleased ? (
                    <><CheckCircle size={14} style={{ color: '#22c55e' }} /> <span>Clearance is RELEASED & OPEN</span></>
                  ) : (
                    <><Lock size={14} style={{ color: '#ffd000' }} /> <span>Clearance Window: LOCKED</span></>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="mau-login-form-panel">
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
             <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>2026/2027 A.Y.</span>
          </div>

          {pageLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <Spin size="large" />
              <Text type="secondary" style={{ marginTop: 16 }}>Connecting to University Servers...</Text>
            </div>
          ) : !clearanceReleased ? (
            <div className="mau-login-lock-cover">
              <div className="mau-cover-icon-circle">
                <Lock size={46} className="mau-cover-lock-icon" />
              </div>

              <h2 className="mau-cover-title">Clearance is Locked</h2>
              <p className="mau-cover-desc">
                The digital graduation clearance portal is officially locked. Access will be unveiled only after the University Administrator releases the session from the Admin Dashboard.
              </p>
            </div>
          ) : (
            <div>
              <div className="mau-form-header">
                <h2 className="mau-form-title">Sign in to Portal</h2>
                <p className="mau-form-subtitle">Enter your credentials to track or submit clearance</p>
              </div>

              {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

              <Form form={form} layout="vertical" onFinish={handleFinish}>
                <div className="mau-input-group">
                  <label className="mau-input-label">Select Your Portal Role</label>
                  <Select
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val)}
                    options={roles}
                    size="large"
                    style={{ width: '100%', borderRadius: 10 }}
                    placeholder="Select your role"
                  />
                </div>

                <div className="mau-input-group">
                  <label className="mau-input-label">
                    {isStudent ? 'Student Email or ID Number' : 'Staff / Official Username'}
                  </label>
                  <Form.Item name="identifier" noStyle rules={[{ required: true, message: 'Please enter your username or email' }]}>
                    <Input
                      size="large"
                      prefix={isStudent ? <Mail size={16} style={{ color: '#94a3b8', marginRight: 4 }} /> : <User size={16} style={{ color: '#94a3b8', marginRight: 4 }} />}
                      placeholder={isStudent ? 'e.g. MAU1234' : 'e.g. depthead_se'}
                      style={{ borderRadius: 10, height: 46 }}
                    />
                  </Form.Item>
                </div>

                <div className="mau-input-group">
                  <label className="mau-input-label">Password</label>
                  <Form.Item name="password" noStyle rules={[{ required: true, message: 'Please enter your password' }]}>
                    <Input.Password
                      size="large"
                      prefix={<Lock size={16} style={{ color: '#94a3b8', marginRight: 4 }} />}
                      placeholder="••••••••"
                      style={{ borderRadius: 10, height: 46 }}
                    />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <Link to="/forgot-password" style={{ fontSize: 13, color: '#2563eb' }}>
                    Forgot password?
                  </Link>
                  {isStudent && (
                    <Link to="/register" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>
                      New student? Register here
                    </Link>
                  )}
                </div>

                <button type="submit" className="mau-submit-btn" disabled={loading}>
                  {loading ? 'Authenticating...' : (
                    <>Sign In <ArrowRight size={17} /></>
                  )}
                </button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
