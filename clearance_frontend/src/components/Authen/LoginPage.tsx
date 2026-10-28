import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Select, Alert, Modal, message, Typography } from 'antd';
import {
  GraduationCap, User, Shield, Lock, Unlock, Mail,
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

  // ==========================================
  // LOCK FEATURE STATE
  // ==========================================
  const [clearanceReleased, setClearanceReleased] = useState<boolean>(() => {
    return localStorage.getItem('mau_clearance_released') === 'true';
  });
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [staffBypassMode, setStaffBypassMode] = useState(false);

  const handleToggleRelease = (releaseState: boolean) => {
    setClearanceReleased(releaseState);
    if (releaseState) setStaffBypassMode(false);
    localStorage.setItem('mau_clearance_released', String(releaseState));
    message.success(releaseState ? 'Clearance Window RELEASED by Admin!' : 'Clearance Window Locked.');
  };

  const isStudent = selectedRole === 'student';

  const roles = [
    { label: '🎓 Student', value: 'student' },
    { label: '🏢 Department Head', value: 'departmenthead' },
    { label: '📚 Librarian', value: 'librarian' },
    { label: '🍽️ Cafeteria Admin', value: 'cafeteria' },
    { label: '🏠 Dormitory Manager', value: 'dormitory' },
    { label: '🧠 Counseling / Psychology', value: 'psychology' },
    { label: '🏆 Sport Master', value: 'sportmaster' },
    { label: '👮 Campus Police', value: 'campuspolice' },
    { label: '🤝 Cooperation & Sharing', value: 'cooperationsharing' },
    { label: '📜 Degree Program Coordinator', value: 'dopcordinator' },
    { label: '🏛️ Student Affairs', value: 'studentaffairs' },
    { label: '🎓 Registrar Office', value: 'registrar' },
    { label: '⚙️ System Administrator', value: 'admin' },
  ];

  const handleFinish = async (values: any) => {
    if (isStudent && !clearanceReleased) {
      message.error('Clearance window is locked. Please wait for Admin release.');
      return;
    }

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
        navigate(roleRoutes[selectedRole] || '/student');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mau-login-wrapper mau-theme-adey-abeba">
      <div className="mau-login-backdrop-glow" aria-hidden="true" />

      <div className="mau-login-card">
        {/* Top Ribbon */}
        <div className="mau-national-ribbon">
          <div className="mau-ribbon-green" />
          <div className="mau-ribbon-yellow" />
          <div className="mau-ribbon-red" />
        </div>

        {/* LEFT PANEL: Hero & Theme */}
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
              <div className={`mau-live-status ${clearanceReleased ? 'status-open' : 'status-locked'}`}>
                {clearanceReleased ? (
                  <><CheckCircle size={14} style={{ color: '#22c55e' }} /> <span>Clearance is RELEASED & OPEN</span></>
                ) : (
                  <><Lock size={14} style={{ color: '#ffd000' }} /> <span>Clearance Window: LOCKED</span></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form OR Lock Cover */}
        <div className="mau-login-form-panel">

          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
             <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>2026/2027 A.Y.</span>
          </div>

          {!clearanceReleased && !staffBypassMode ? (
            // LOCK SCREEN
            <div className="mau-login-lock-cover">
              <div className="mau-cover-icon-circle">
                <Lock size={46} className="mau-cover-lock-icon" />
              </div>

              <h2 className="mau-cover-title">Clearance is Locked</h2>
              <p className="mau-cover-desc">
                The digital graduation clearance portal is officially locked. Access will be unveiled only after the University Administrator releases the session.
              </p>

              <button
                type="button"
                className="mau-cover-release-main-btn"
                onClick={() => setReleaseModalOpen(true)}
              >
                <Key size={18} />
                <span>Admin: Release & Unlock Portal</span>
              </button>

              <div className="mau-cover-staff-switch">
                <span>University Staff? </span>
                <button
                  type="button"
                  className="mau-cover-staff-link"
                  onClick={() => {
                    setSelectedRole('admin');
                    setStaffBypassMode(true);
                  }}
                >
                  Staff Access Login
                </button>
              </div>
            </div>
          ) : (
            // LOGIN FORM
            <div>
              {clearanceReleased && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>✅ Clearance is RELEASED</span>
                  <button onClick={() => handleToggleRelease(false)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Lock</button>
                </div>
              )}

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

      {/* ADMIN RELEASE MODAL */}
      <Modal
        title={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Key size={20} color="#f59e0b"/> <span>Release Clearance Window</span></div>}
        open={releaseModalOpen}
        onCancel={() => setReleaseModalOpen(false)}
        footer={[
          <button key="cancel" onClick={() => setReleaseModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', marginRight: 8 }}>Cancel</button>,
          <button key="release" onClick={() => { handleToggleRelease(true); setReleaseModalOpen(false); }} style={{ padding: '8px 16px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <Unlock size={14} style={{ marginRight: 4 }} /> Confirm & Release
          </button>
        ]}
      >
        <Alert
          message="Official Institutional Action"
          description="Releasing the clearance window unlocks the digital portal for all graduating seniors. All 13 university directorates will be activated for verification."
          type="warning"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      </Modal>
    </div>
  );
}
