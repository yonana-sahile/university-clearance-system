import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function VerifyOTP() {
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'user@mau.edu.et';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.otp === '123456' || values.otp.length === 6) {
        navigate('/reset-password', { state: { email, otp: values.otp } });
      } else {
        setError('Invalid OTP code. Try entering 123456.');
      }
    }, 600);
  };

  return (
    <div className="auth-page-canvas">
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyOutlined style={{ fontSize: 48, color: '#2563eb', marginBottom: 12 }} />
          <Title level={3} style={{ marginBottom: 4 }}>Enter Verification OTP</Title>
          <Text type="secondary">Sent code to <strong>{email}</strong>. (Demo Code: 123456)</Text>
        </div>

        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 20 }} />}

        <Form layout="vertical" onFinish={handleFinish} initialValues={{ otp: '123456' }}>
          <Form.Item
            name="otp"
            label="6-Digit OTP Code"
            rules={[{ required: true, len: 6, message: 'Please enter 6-digit OTP' }]}
          >
            <Input
              size="large"
              placeholder="123456"
              maxLength={6}
              style={{
                borderRadius: 10,
                textAlign: 'center',
                letterSpacing: 8,
                fontSize: 22,
                fontWeight: 'bold'
              }}
            />
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
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              fontWeight: 700,
              border: 'none',
              marginTop: 8
            }}
          >
            Verify OTP
          </Button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {timer > 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>Resend OTP in {timer}s</Text>
            ) : (
              <Button type="link" onClick={() => setTimer(60)} style={{ padding: 0 }}>
                Resend OTP Code
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
}
