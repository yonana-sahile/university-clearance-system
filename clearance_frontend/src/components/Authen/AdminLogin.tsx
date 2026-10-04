import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { SafetyCertificateOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { apiFetch, setSession } from '../../utils/api';

const { Title, Text } = Typography;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'admin',
          username: values.username,
          password: values.password
        })
      });

      if (res.user) {
        setSession(res.user);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.25) 0%, transparent 70%), #0b0f19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#0f172a',
          color: '#f8fafc'
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#ec4899', marginBottom: 12 }} />
          <Title level={3} style={{ color: '#ffffff', marginBottom: 4 }}>System Administrator</Title>
          <Text style={{ color: '#94a3b8' }}>Restricted MAU Clearance Console</Text>
        </div>

        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 20 }} />}

        <Form layout="vertical" onFinish={handleFinish} initialValues={{ username: 'admin_root', password: 'Password123!' }}>
          <Form.Item name="username" label={<span style={{ color: '#cbd5e1' }}>Admin Username</span>} rules={[{ required: true }]}>
            <Input size="large" prefix={<UserOutlined />} style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="password" label={<span style={{ color: '#cbd5e1' }}>Secret Key / Password</span>} rules={[{ required: true }]}>
            <Input.Password size="large" prefix={<LockOutlined />} style={{ borderRadius: 10 }} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              fontWeight: 700,
              border: 'none',
              marginTop: 12
            }}
          >
            Authenticate Administrator
          </Button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/login" style={{ color: '#94a3b8', fontSize: 13 }}>
              Return to Standard Portal Login
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
