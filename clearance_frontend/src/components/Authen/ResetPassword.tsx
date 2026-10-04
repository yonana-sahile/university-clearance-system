import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Progress } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Password strength logic
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    }, 800);
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
          <LockOutlined style={{ fontSize: 48, color: '#2563eb', marginBottom: 12 }} />
          <Title level={3} style={{ marginBottom: 4 }}>Set New Password</Title>
          <Text type="secondary">Create a strong password for your university clearance account.</Text>
        </div>

        {success && (
          <Alert
            title="Password Reset Successful!"
            description="Redirecting to login page..."
            type="success"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form layout="vertical" onFinish={handleFinish} initialValues={{ password: 'NewPassword123!', confirm: 'NewPassword123!' }}>
          <Form.Item
            name="password"
            label="New Password"
            rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          {password && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>Password Strength</span>
                <span>{strength >= 75 ? 'Strong' : strength >= 50 ? 'Medium' : 'Weak'}</span>
              </div>
              <Progress
                percent={strength}
                showInfo={false}
                strokeColor={strength >= 75 ? '#52c41a' : strength >= 50 ? '#faad14' : '#ff4d4f'}
                size="small"
              />
            </div>
          )}

          <Form.Item
            name="confirm"
            label="Confirm New Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" style={{ borderRadius: 10 }} />
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
            Update Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}
