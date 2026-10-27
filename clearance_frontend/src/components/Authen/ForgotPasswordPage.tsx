import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api'; // ✅ IMPORT API

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = await apiFetch('forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
      });

      setSent(true);
      message.success('OTP sent successfully!');

      // Pass dev_otp to the next page so you can test easily
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: values.email, dev_otp: data.dev_otp } });
      }, 1500);

    } catch (err: any) {
      message.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-canvas">
      <Card style={{ width: '100%', maxWidth: 440, borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} styles={{ body: { padding: '36px 32px' } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <KeyOutlined style={{ fontSize: 48, color: '#2563eb', marginBottom: 12 }} />
          <Title level={3} style={{ marginBottom: 4 }}>Reset Your Password</Title>
          <Text type="secondary">Enter your registered email address to receive a 6-digit verification code.</Text>
        </div>

        {sent && (
          <Alert title="Verification Code Sent!" description="Check your email for the 6-digit OTP code." type="success" showIcon style={{ marginBottom: 20 }} />
        )}

        <Form layout="vertical" onFinish={handleFinish} initialValues={{ email: 'yonassahile8@gmail.com' }}>
          <Form.Item name="email" label="Registered University Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="name@mau.edu.et" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', fontWeight: 700, border: 'none', marginTop: 8 }}>
            Send OTP Code
          </Button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/login" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>
              <ArrowLeftOutlined /> Back to Sign In
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
