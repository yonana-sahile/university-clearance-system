import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api'; // ✅ IMPORT API

const { Title, Text } = Typography;

export default function VerifyOTP() {
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const devOtp = location.state?.dev_otp;

  useEffect(() => {
    if (!email) navigate('/forgot-password');

    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, email, navigate]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await apiFetch('verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: values.otp }),
      });

      message.success('OTP verified successfully!');
      navigate('/reset-password', { state: { email, otp: values.otp } });

    } catch (err: any) {
      message.error(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-canvas">
      <Card style={{ width: '100%', maxWidth: 440, borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} styles={{ body: { padding: '36px 32px' } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyOutlined style={{ fontSize: 48, color: '#2563eb', marginBottom: 12 }} />
          <Title level={3} style={{ marginBottom: 4 }}>Enter Verification OTP</Title>
          <Text type="secondary">
            Sent code to <strong>{email}</strong>.
            {devOtp && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>🔧 DEV MODE: Code is {devOtp}</div>}
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleFinish} initialValues={{ otp: devOtp || '' }}>
          <Form.Item name="otp" label="6-Digit OTP Code" rules={[{ required: true, len: 6, message: 'Please enter 6-digit OTP' }]}>
            <Input size="large" placeholder="123456" maxLength={6} style={{ borderRadius: 10, textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: 'bold' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', fontWeight: 700, border: 'none', marginTop: 8 }}>
            Verify OTP
          </Button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {timer > 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>Resend OTP in {timer}s</Text>
            ) : (
              <Button type="link" onClick={() => setTimer(60)} style={{ padding: 0 }}>Resend OTP Code</Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
}
