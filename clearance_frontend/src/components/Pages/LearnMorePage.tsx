import React from 'react';
import { Card, Typography, Row, Col, Statistic, Avatar, Tag, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, ThunderboltOutlined, SafetyOutlined, UserOutlined, CodeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function LearnMorePage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ fontWeight: 800, marginBottom: 8 }}>
          University Clearance Platform Statistics & System Features
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Fast, reliable, and transparent digital clearance infrastructure
        </Text>
      </div>

      {/* STATS COUNTER GRID */}
      <Row gutter={[16, 16]} style={{ marginBottom: 36 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Active Students" value={4850} styles={{ content: { color: '#2563eb', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Cleared Graduates" value={3420} styles={{ content: { color: '#10b981', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Campus Offices" value={11} styles={{ content: { color: '#8b5cf6', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Avg. Clearance Time" value="1.5 Days" styles={{ content: { color: '#f59e0b', fontWeight: 800 } }} />
          </Card>
        </Col>
      </Row>

      {/* STRENGTHS GRID */}
      <Row gutter={[24, 24]} style={{ marginBottom: 36 }}>
        <Col xs={24} md={8}>
          <Card title="⚡ Instant Processing" style={{ borderRadius: 16 }}>
            <Paragraph style={{ color: '#64748b' }}>
              No physical form delays. Officers receive instant notifications when student requests reach their clearance stage.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="💳 Telebirr & Bank Payments" style={{ borderRadius: 16 }}>
            <Paragraph style={{ color: '#64748b' }}>
              Integrated payment tracking for library book fines, meal tickets, or room damage fees with receipt upload and 1-click verification.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="🔒 Secure Audit Logs" style={{ borderRadius: 16 }}>
            <Paragraph style={{ color: '#64748b' }}>
              Every approval, rejection note, and status change is timestamped with officer credentials for maximum institutional accountability.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* DEVELOPER CARD */}
      <Card
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: 12
        }}
        styles={{ body: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' } }}
      >
        <Avatar size={72} icon={<CodeOutlined />} style={{ background: '#3b82f6' }} />
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ color: '#ffffff', margin: 0 }}>
            Mekdela Amba University ICT Directorate
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Developed and maintained for academic clearance excellence.
          </Text>
        </div>
        <Button
          type="primary"
          onClick={() => navigate('/login')}
          style={{
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            fontWeight: 700
          }}
        >
          Sign In Now
        </Button>
      </Card>
    </div>
  );
}
