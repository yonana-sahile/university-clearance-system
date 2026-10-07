import React from 'react';
import { Card, Typography, Row, Col, Divider, Tag, Space } from 'antd';
import {
  BankOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function AboutPage() {
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
            src="/images/MAU.jpg"
            alt="MAU"
            style={{
              width: 90,
              height: 90,
              borderRadius: 20,
              border: '3px solid #f59e0b',
              objectFit: 'contain',
              background: '#ffffff',
              padding: 4,
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
          About the Online Clearance System
        </Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#334155' }}>
          The Mekdela Amba University Online Clearance System (UCS) is a paperless digital
          platform that replaces the traditional manual clearance workflow. Graduating
          students can submit a single digital application which is routed automatically
          through all 11 campus offices in sequence — from the Department Head and Library
          to the University Registrar.
        </Paragraph>

        <Divider />

        <Title level={4}>Key Features</Title>
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

      {/* CONTACT */}
      <Card style={{ borderRadius: 20 }} styles={{ body: { padding: 32 } }}>
        <Title level={3} style={{ marginTop: 0 }}>
          <MailOutlined style={{ color: '#2563eb', marginRight: 10 }} />
          Contact Us
        </Title>
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
