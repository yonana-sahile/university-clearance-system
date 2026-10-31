import React from 'react';
import { Card, Typography, Row, Col, Divider, Tag, Space, Statistic, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BankOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 16px' }}>
      {/* HERO */}
      <Card
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          border: 'none',
          marginBottom: 24,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
        }}
        styles={{ body: { padding: 40 } }}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src="/mau_logo.jpg"
            alt="Mekdela Amba University"
            style={{
              width: 90,
              height: 90,
              borderRadius: 20,
              objectFit: 'contain',
              marginBottom: 16,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/90x90/2563eb/ffffff?text=MAU';
            }}
          />
          <Title level={1} style={{ color: '#ffffff', margin: 0, fontWeight: 900 }}>
            Mekdela Amba University
          </Title>
          <Text style={{ color: '#cbd5e1', fontSize: 16, display: 'block', marginTop: 8 }}>
            Online Clearance System — About the Platform
          </Text>
        </div>
      </Card>

      {/* ✅ NEW: PLATFORM STATISTICS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 16, textAlign: 'center' }} styles={{ body: { padding: '20px 10px' } }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>CLEARED GRADUATES</span>}
              value="5,000+"
              styles={{ content: { color: '#10b981', fontWeight: 900, fontSize: 24 } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 16, textAlign: 'center' }} styles={{ body: { padding: '20px 10px' } }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>CAMPUS OFFICES</span>}
              value="11"
              styles={{ content: { color: '#2563eb', fontWeight: 900, fontSize: 24 } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 16, textAlign: 'center' }} styles={{ body: { padding: '20px 10px' } }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>AVG. CLEARANCE TIME</span>}
              value="1.5"
              suffix="Days"
              styles={{ content: { color: '#f59e0b', fontWeight: 900, fontSize: 24 } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderRadius: 16, textAlign: 'center' }} styles={{ body: { padding: '20px 10px' } }}>
            <Statistic
              title={<span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>ACTIVE STUDENTS</span>}
              value="2,500+"
              styles={{ content: { color: '#8b5cf6', fontWeight: 900, fontSize: 24 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* ✅ NEW: HOW IT WORKS FOR STUDENTS */}
      <Card style={{ borderRadius: 20, marginBottom: 24 }} styles={{ body: { padding: 32 } }}>
        <Title level={3} style={{ marginTop: 0, textAlign: 'center' }}>
          How The Clearance System Works
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Complete your graduation clearance in three simple steps.
        </Text>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ background: '#eff6ff', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileTextOutlined style={{ fontSize: 28, color: '#2563eb' }} />
              </div>
              <Title level={4} style={{ margin: '0 0 8px' }}>1. Apply Online</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Log in, fill out your clearance form, and select your department. Your request is instantly sent to the Department Head.
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ background: '#fffbeb', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CreditCardOutlined style={{ fontSize: 28, color: '#d97706' }} />
              </div>
              <Title level={4} style={{ margin: '0 0 8px' }}>2. Track & Pay</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Monitor your progress in real-time. If you have library or dorm fines, pay instantly via Telebirr or CBE Birr.
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ background: '#f0fdf4', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <TrophyOutlined style={{ fontSize: 28, color: '#16a34a' }} />
              </div>
              <Title level={4} style={{ margin: '0 0 8px' }}>3. Get Certified</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Once the Registrar grants final approval, download your tamper-proof, QR-verified digital clearance certificate.
              </Text>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* HELPFUL TIP FOR STUDENTS */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, borderLeft: '4px solid #3b82f6', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: 18, marginTop: 2 }} />
          <div>
            <Text strong style={{ display: 'block', color: '#0f172a' }}>Pro-Tip to Avoid Delays</Text>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Before applying, make sure you have returned all library books, dormitory keys, and cafeteria items. The clearance form must be approved by your Department Head *first* before it moves to the next office.
            </Text>
          </div>
        </div>
      </Card>

      {/* ABOUT THE UNIVERSITY */}
      <Card style={{ borderRadius: 20, marginBottom: 24 }} styles={{ body: { padding: 32 } }}>
        <Title level={3} style={{ marginTop: 0 }}>
          <BankOutlined style={{ color: '#2563eb', marginRight: 10 }} />
          About the University
        </Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#334155' }}>
          Mekdela Amba University is a public higher education institution located in Tulu
          Awulia, Amhara Region, Ethiopia. Established to serve the growing demand for
          accessible higher education in the region, the university offers undergraduate and
          postgraduate programs across multiple colleges including Computing & Informatics,
          Engineering & Technology, Natural Sciences, Business & Economics, and Social
          Sciences & Humanities.
        </Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <div style={{ background: '#eff6ff', padding: 20, borderRadius: 14, height: '100%' }}>
              <Title level={4} style={{ marginTop: 0, color: '#1e3a8a' }}>
                🎯 Our Mission
              </Title>
              <Text style={{ color: '#334155' }}>
                To provide quality, accessible, and relevant higher education that empowers
                graduates to contribute meaningfully to national and regional development
                through teaching, research, and community service.
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 14, height: '100%' }}>
              <Title level={4} style={{ marginTop: 0, color: '#14532d' }}>
                🌟 Our Vision
              </Title>
              <Text style={{ color: '#334155' }}>
                To be a leading Ethiopian university recognized for academic excellence,
                innovative research, and impactful community engagement that transforms
                lives and drives sustainable development.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ABOUT THE CLEARANCE SYSTEM */}
      <Card style={{ borderRadius: 20, marginBottom: 24 }} styles={{ body: { padding: 32 } }}>
        <Title level={3} style={{ marginTop: 0 }}>
          <SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 10 }} />
          Platform Features
        </Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#334155' }}>
          The Mekdela Amba University Online Clearance System (UCS) replaces the traditional manual paperwork with a fully digital, automated workflow.
        </Paragraph>

        <Divider />

        <Row gutter={[16, 16]}>
          {[
            { icon: <TeamOutlined style={{ color: '#2563eb', fontSize: 22 }} />, title: '11-Office Integrated Workflow', desc: 'Every clearing office connected in one sequence.' },
            { icon: <SafetyCertificateOutlined style={{ color: '#10b981', fontSize: 22 }} />, title: 'QR-Verified Certificates', desc: 'Tamper-proof digital certificate with QR authenticity check.' },
            { icon: <GlobalOutlined style={{ color: '#8b5cf6', fontSize: 22 }} />, title: 'Real-Time Tracking', desc: 'Watch your clearance progress update live at every stage.' },
            { icon: <BankOutlined style={{ color: '#d97706', fontSize: 22 }} />, title: 'Digital Payments', desc: 'Settle fines via Telebirr or CBE Birr with receipt upload.' },
          ].map((feature, idx) => (
            <Col xs={24} sm={12} key={idx}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 14, background: '#f8fafc', borderRadius: 12 }}>
                <div>{feature.icon}</div>
                <div>
                  <Text strong style={{ display: 'block', color: '#0f172a' }}>{feature.title}</Text>
                  <Text style={{ fontSize: 13, color: '#64748b' }}>{feature.desc}</Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* CONTACT & SUPPORT */}
      <Card style={{ borderRadius: 20 }} styles={{ body: { padding: 32 } }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Title level={3} style={{ marginTop: 0 }}>
              <MailOutlined style={{ color: '#2563eb', marginRight: 10 }} />
              Need Help?
            </Title>
            <Paragraph type="secondary">
              If you encounter any technical issues during your clearance, please contact the ICT Directorate or visit the Office of the Registrar.
            </Paragraph>
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <EnvironmentOutlined style={{ color: '#e11d48' }} />
                <Text>Tulu Awulia, Amhara Region, Ethiopia</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneOutlined style={{ color: '#16a34a' }} />
                <Text>+251 58 111 2000</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MailOutlined style={{ color: '#8b5cf6' }} />
                <Text>info@mau.edu.et</Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/login')}
                style={{ borderRadius: 12, height: 48, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', fontWeight: 700 }}
              >
                Go to Login Portal
              </Button>
            </div>
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Tag color="blue" style={{ borderRadius: 12, padding: '4px 14px', fontWeight: 700 }}>
            © {new Date().getFullYear()} Mekdela Amba University
          </Tag>
        </div>
      </Card>
    </div>
  );
}
