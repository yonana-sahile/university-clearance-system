import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Space } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, UserAddOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function AuthPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page-canvas" style={{ padding: '32px 16px' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 600,
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <img
          src="/images/MAU.jpg"
          alt="MAU"
          style={{ width: 85, height: 85, borderRadius: 18, marginBottom: 16, border: '3px solid #0284c7', objectFit: 'contain', background: '#ffffff', padding: 4 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/85x85/2563eb/ffffff?text=MAU';
          }}
        />
        <Title level={2} style={{ marginBottom: 4, fontWeight: 800 }}>Mekdela Amba University</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>Online Clearance System Portal Gateway</Text>

        <Paragraph style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
          Welcome to the centralized digital clearance portal. Please select an option below to proceed.
        </Paragraph>

        <Row gutter={[16, 16]} style={{ marginTop: 28 }}>
          <Col span={12}>
            <Button
              type="primary"
              size="large"
              block
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 6px 16px rgba(37,99,235,0.3)'
              }}
            >
              Portal Login
            </Button>
          </Col>

          <Col span={12}>
            <Button
              size="large"
              block
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
              style={{
                height: 52,
                borderRadius: 14,
                borderColor: '#2563eb',
                color: '#2563eb',
                fontWeight: 700
              }}
            >
              Student Register
            </Button>
          </Col>
        </Row>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
          <Link to="/admin-login" style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            <SafetyCertificateOutlined /> System Administrator Access Console
          </Link>
        </div>
      </Card>
    </div>
  );
}
