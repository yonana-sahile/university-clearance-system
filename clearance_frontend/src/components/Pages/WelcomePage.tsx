import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Input,
  Statistic,
  Collapse,
  Alert,
} from 'antd';
import {
  ArrowRightOutlined,
  SearchOutlined,
  ApartmentOutlined,
  QuestionCircleOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { getSession, getStoredForms } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StarryFlag from '../Common/StarryFlag';

const { Title, Text, Paragraph } = Typography;

const DEPARTMENTS_INFO = [
  { key: 'dept', title: '1. Department Head', icon: '🎓', desc: 'Grade reports, senior research thesis clearance, lab tools check.' },
  { key: 'library', title: '2. Main Library', icon: '📚', desc: 'Return of borrowed books, clearing e-library accounts & fines.' },
  { key: 'cafe', title: '3. Student Cafeteria', icon: '🍱', desc: 'Return of dining coupons & meal pass badges.' },
  { key: 'dorm', title: '4. Dormitory Proctor', icon: '🏠', desc: 'Room condition inspection, room key & mattress return.' },
  { key: 'psychology', title: '5. Student Counseling', icon: '🧠', desc: 'Exit wellness questionnaire & psychological clearance.' },
  { key: 'sports', title: '6. Sports & Athletics', icon: '⚽', desc: 'Return of sports uniforms, gym gear & locker keys.' },
  { key: 'police', title: '7. Campus Police', icon: '🛡️', desc: 'Conduct clearance, vehicle/parking permits validation.' },
  { key: 'costshare', title: '8. Cost-Sharing Office', icon: '📄', desc: 'Signed Ministry of Education cost-sharing service agreement.' },
  { key: 'dop', title: '9. DOP Coordinator', icon: '📜', desc: 'Academic credit audit & degree program requirement check.' },
  { key: 'affairs', title: '10. Student Affairs', icon: '🤝', desc: 'Student union & campus organization conduct review.' },
  { key: 'registrar', title: '11. University Registrar', icon: '🏛️', desc: 'Final Cryptographic Digital Seal & Degree Parchment release.' },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const user = getSession();

  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState<ClearanceForm | null | 'not_found'>(null);
  const [tracking, setTracking] = useState(false);

  const handleTrack = () => {
    if (!trackInput.trim()) return;
    setTracking(true);
    setTimeout(() => {
      const forms = getStoredForms();
      const match = forms.find(
        (f) =>
          f.id_number.toLowerCase() === trackInput.trim().toLowerCase() ||
          f.full_name.toLowerCase().includes(trackInput.trim().toLowerCase())
      );
      setTrackResult(match || 'not_found');
      setTracking(false);
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        background: 'transparent',
        color: 'inherit',
        padding: '36px 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ANNOUNCEMENT BANNER */}
      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(30, 58, 138, 0.15)',
          borderRadius: 40,
          padding: '10px 24px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(30, 58, 138, 0.05)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Tag color="blue" style={{ borderRadius: 12, fontWeight: 800 }}>
            FDRE MINISTRY OF EDUCATION
          </Tag>
          🌟 እንኳን ወደ መቅደላ አምባ ዩኒቨርሲቲ ኦንላይን ክሊራንስ ሲስተም በደህና መጡ!! 🎓 Official Paperless Clearance Portal
        </div>
      </div>

      {/* MAIN HERO CARD */}
      <Card
        style={{
          width: '100%',
          maxWidth: 1000,
          borderRadius: 28,
          background: '#ffffff',
          borderColor: '#e2e8f0',
          boxShadow:
            '0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.03)',
          textAlign: 'center',
        }}
        styles={{ body: { padding: '48px 36px' } }}
      >
        {/* DUAL CREST: UNIVERSITY SEAL & OFFICIAL ETHIOPIAN FLAG */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/mau_logo.jpg"
              alt="Mekdela Amba University Logo"
              style={{
                width: 104,
                height: 104,
                borderRadius: 22,
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
              }}
              onClick={() => navigate('/intro-slides')}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/110x110/1e3a8a/ffffff?text=MAU';
              }}
            />
            <span
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
              }}
            >
              University Seal
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <StarryFlag scale={0.46} showText={true} />
          </div>
        </div>

        <div style={{ display: 'inline-block', marginBottom: 12 }}>
          <Tag
            color="gold"
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
              letterSpacing: 1.5,
              color: '#92400e',
              background: '#fef3c7',
              borderColor: '#fde047',
            }}
          >
            MEKDELA AMBA UNIVERSITY • EST. 2015 E.C.
          </Tag>
        </div>

        <Title
          level={1}
          style={{
            color: '#0f172a',
            fontWeight: 900,
            marginBottom: 8,
            fontSize: 36,
            letterSpacing: -0.5,
          }}
        >
          Mekdela Amba University
        </Title>
        <Text style={{ color: '#1d4ed8', fontSize: 18, fontWeight: 700 }}>
          Digital Academic Clearance System (UCS)
        </Text>

        <Paragraph
          style={{
            color: '#475569',
            fontSize: 15,
            maxWidth: 720,
            margin: '20px auto 32px',
            lineHeight: 1.7,
          }}
        >
          Streamlining traditional paper clearance forms into an instant,
          multi-department digital workflow. Real-time approval tracking across
          Department Head, Library, Cafeteria, Dormitory, and Registrar offices
          with QR-verified certificate issuance.
        </Paragraph>

        {/* HERO CTA BUTTONS */}
        <Space size={16} wrap style={{ justifyContent: 'center', marginBottom: 36 }}>
          {user ? (
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => {
                const roleRoutes: Record<string, string> = {
                  student: '/student',
                  departmenthead: '/departmenthead',
                  librarian: '/librarian',
                  cafeteria: '/cafeteria',
                  dormitory: '/dormitory',
                  registrar: '/registrar',
                  admin: '/admin',
                };
                navigate(roleRoutes[user.role] || '/student');
              }}
              style={{
                height: 52,
                borderRadius: 14,
                padding: '0 36px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                boxShadow: '0 10px 25px rgba(30,58,138,0.25)',
              }}
            >
              Enter {user.role.toUpperCase()} Portal
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/login')}
                style={{
                  height: 52,
                  borderRadius: 14,
                  padding: '0 36px',
                  background:
                    'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(30,58,138,0.25)',
                }}
              >
                Sign In to Portal
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/verify-certificate')}
                style={{
                  height: 52,
                  borderRadius: 14,
                  padding: '0 28px',
                  borderColor: '#a7f3d0',
                  color: '#047857',
                  background: '#ecfdf5',
                  fontWeight: 700,
                }}
              >
                🛡️ Verify Certificate
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/intro-slides')}
                style={{
                  height: 52,
                  borderRadius: 14,
                  padding: '0 28px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  background: '#f8fafc',
                  fontWeight: 600,
                }}
              >
                Explore Tour
              </Button>
            </>
          )}
        </Space>

        {/* LIVE UNIVERSITY STATISTICS METRICS */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 20,
            padding: '24px 16px',
            border: '1px solid #e2e8f0',
            marginBottom: 36,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                    GRADUATING STUDENTS
                  </span>
                }
                value="14,850+"
                styles={{ content: { color: '#1e3a8a', fontWeight: 900, fontSize: 24 } }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                    CAMPUS OFFICES
                  </span>
                }
                value="11"
                suffix="Integrated"
                styles={{ content: { color: '#047857', fontWeight: 900, fontSize: 24 } }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                    PAPERLESS RATE
                  </span>
                }
                value="99.4%"
                styles={{ content: { color: '#6d28d9', fontWeight: 900, fontSize: 24 } }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                    AVG CLEARANCE SPEED
                  </span>
                }
                value="< 24 Hrs"
                styles={{ content: { color: '#b45309', fontWeight: 900, fontSize: 24 } }}
              />
            </Col>
          </Row>
        </div>

        {/* FEATURE CARD 1: PUBLIC INSTANT STATUS TRACKER */}
        <Card
          style={{
            background: '#ffffff',
            borderRadius: 20,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            marginBottom: 36,
            textAlign: 'left',
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <SearchOutlined style={{ fontSize: 22, color: '#1d4ed8' }} />
            <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
              Quick Student Clearance Status Tracker
            </Title>
          </div>
          <Text
            type="secondary"
            style={{ color: '#334155', fontSize: 13, display: 'block', marginBottom: 16 }}
          >
            Type your Student ID Number (e.g. <strong>UGR/1234/14</strong> or
            student name) to check your real-time 11-stage clearance progress
            without signing in.
          </Text>

          <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <Input
              size="large"
              placeholder="Enter Student ID Number (e.g. UGR/1234/14)..."
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              onPressEnter={handleTrack}
              style={{
                borderRadius: '12px 0 0 12px',
                background: '#ffffff',
                color: '#0f172a',
                borderColor: '#94a3b8',
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleTrack}
              loading={tracking}
              style={{
                borderRadius: '0 12px 12px 0',
                background: '#1e3a8a',
                fontWeight: 700,
              }}
            >
              Track Now
            </Button>
          </Space.Compact>

          {trackResult && trackResult !== 'not_found' && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #86efac',
                borderRadius: 14,
                padding: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text strong style={{ color: '#0f172a', fontSize: 16 }}>
                  {trackResult.full_name}
                </Text>
                <Tag color="green">{trackResult.status}</Tag>
              </div>
              <Text style={{ color: '#475569', fontSize: 13, display: 'block' }}>
                ID:{' '}
                <strong style={{ color: '#1d4ed8' }}>{trackResult.id_number}</strong>{' '}
                | Department: {trackResult.department_name}
              </Text>
              <div style={{ marginTop: 12 }}>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => navigate('/login')}
                  style={{ borderRadius: 8, background: '#1e3a8a' }}
                >
                  Log In to View Full Clearance Details & Certificate →
                </Button>
              </div>
            </div>
          )}

          {trackResult === 'not_found' && (
            <Alert
              type="info"
              showIcon
              message="No Clearance Application Record Found"
              description="No active clearance form matches this ID yet. Please log in to submit your official clearance application form."
              style={{
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #bfdbfe',
              }}
            />
          )}
        </Card>

        {/* FEATURE CARD 2: 11-DEPARTMENT WORKFLOW MAP */}
        <div style={{ textAlign: 'left', marginBottom: 36 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <ApartmentOutlined style={{ fontSize: 22, color: '#047857' }} />
            <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
              The 11 Integrated University Clearance Departments
            </Title>
          </div>

          <Row gutter={[12, 12]}>
            {DEPARTMENTS_INFO.map((dept) => (
              <Col xs={24} sm={12} md={8} key={dept.key}>
                <Card
                  size="small"
                  style={{
                    background: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: 14,
                    height: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                  styles={{ body: { padding: 14 } }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{dept.icon}</div>
                  <Text
                    strong
                    style={{
                      color: '#1d4ed8',
                      fontSize: 13,
                      display: 'block',
                    }}
                  >
                    {dept.title}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>{dept.desc}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* UPGRADED: FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <div style={{
          textAlign: 'left',
          background: 'linear-gradient(to bottom right, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)',
          padding: '32px',
          borderRadius: '24px',
          border: '1px solid #bfdbfe',
          boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.1)'
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#dbeafe', color: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22
            }}>
              <QuestionCircleOutlined />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1e3a8a', fontWeight: 900 }}>
                Frequently Asked Questions
              </Title>
              <Text style={{ color: '#475569', fontSize: 14 }}>
                Quick answers to help you navigate your clearance journey.
              </Text>
            </div>
          </div>

          <Collapse
            ghost
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <div style={{
                background: isActive ? '#1e3a8a' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ fontSize: 14 }} />
              </div>
            )}
            items={[
              {
                key: '1',
                label: <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>📝 How do I apply for digital clearance at Mekdela Amba University?</span>,
                children: (
                  <p style={{ color: '#475569', margin: '8px 0 16px 0', lineHeight: 1.6, fontSize: 14 }}>
                    Log in to your Student Account, navigate to <strong>'Apply Clearance'</strong>, fill in your department and ID details, and click Submit. Your clearance request will automatically broadcast to all 11 campus offices simultaneously!
                  </p>
                ),
                style: {
                  marginBottom: 16,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.3s ease'
                }
              },
              {
                key: '2',
                label: <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>💳 How can I pay library or cafeteria fines online?</span>,
                children: (
                  <p style={{ color: '#475569', margin: '8px 0 16px 0', lineHeight: 1.6, fontSize: 14 }}>
                    Go to the <strong>'Payments'</strong> page in your dashboard, select Telebirr Mobile Money or CBE Birr, send payment to the MAU Official Merchant account, and submit your transaction reference number for instant digital clearance.
                  </p>
                ),
                style: {
                  marginBottom: 16,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.3s ease'
                }
              },
              {
                key: '3',
                label: <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>🎓 When do I get my official digital clearance certificate?</span>,
                children: (
                  <p style={{ color: '#475569', margin: '8px 0 16px 0', lineHeight: 1.6, fontSize: 14 }}>
                    Once all 10 preliminary departments approve your record, the University Registrar grants final seal approval. A downloadable PDF certificate complete with QR verification code will immediately generate in your dashboard!
                  </p>
                ),
                style: {
                  marginBottom: 0,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: '16px 24px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.3s ease'
                }
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
