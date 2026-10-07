import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Typography,
  Space,
  Alert,
  Tag,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { apiFetch, setSession } from '../../utils/api';
import type { UserRole } from '../../types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const isStudent = selectedRole === 'student';

  const roles = [
    { label: '🎓 Student', value: 'student' },
    { label: '🏢 Department Head', value: 'departmenthead' },
    { label: '📚 Librarian', value: 'librarian' },
    { label: '🍽️ Cafeteria Admin', value: 'cafeteria' },
    { label: '🏠 Dormitory Manager', value: 'dormitory' },
    { label: '🧠 Counseling / Psychology', value: 'psychology' },
    { label: '🏆 Sport Master', value: 'sportmaster' },
    { label: '👮 Campus Police', value: 'campuspolice' },
    { label: '🤝 Cooperation & Sharing', value: 'cooperationsharing' },
    { label: '📜 Degree Program Coordinator', value: 'dopcordinator' },
    { label: '🏛️ Student Affairs', value: 'studentaffairs' },
    { label: '🎓 Registrar Office', value: 'registrar' },
    { label: '⚙️ System Administrator', value: 'admin' },
  ];

  const handleFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        role: selectedRole,
        username: values.identifier,
        email: isStudent ? values.identifier : undefined,
        password: values.password,
      };

      const res = await apiFetch('login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.user) {
        setSession(res.user);

        const roleRoutes: Record<string, string> = {
          student: '/student',
          departmenthead: '/departmenthead',
          librarian: '/librarian',
          cafeteria: '/cafeteria',
          psychology: '/psychology',
          sportmaster: '/sportmaster',
          campuspolice: '/campuspolice',
          cooperationsharing: '/cooperationsharing',
          dopcordinator: '/dopcordinator',
          studentaffairs: '/studentaffairs',
          dormitory: '/dormitory',
          registrar: '/registrar',
          admin: '/admin',
        };

        navigate(roleRoutes[selectedRole] || '/student');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: UserRole) => {
    if (!import.meta.env.DEV) return;
    setSelectedRole(role);
    if (role === 'student') {
      form.setFieldsValue({
        identifier: 'AAA1234',
        password: 'Password123!',
      });
    } else {
      form.setFieldsValue({
        identifier: `${role}_officer`,
        password: 'Password123!',
      });
    }
  };

  return (
    <div className="auth-page-canvas">
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.8)',
          background: '#ffffff',
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/images/MAU.jpg"
            alt="MAU Logo"
            style={{
              width: 70,
              height: 70,
              borderRadius: 16,
              marginBottom: 12,
              border: '2px solid #0284c7',
              objectFit: 'contain',
              background: '#ffffff',
              padding: 3,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/70x70/2563eb/ffffff?text=MAU';
            }}
          />
          <Title level={3} style={{ marginBottom: 4, fontWeight: 800 }}>
            Welcome Back
          </Title>
          <Text type="secondary">
            Mekdela Amba University Online Clearance System
          </Text>
        </div>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item label="Select Your Portal Role" required>
            <Select
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              options={roles}
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="identifier"
            label={
              isStudent ? 'Student Email or ID Number' : 'Staff / Official Username'
            }
            rules={[
              { required: true, message: 'Please enter your username or email' },
            ]}
          >
            <Input
              size="large"
              prefix={
                isStudent ? (
                  <MailOutlined style={{ color: '#94a3b8' }} />
                ) : (
                  <UserOutlined style={{ color: '#94a3b8' }} />
                )
              }
              placeholder={
                isStudent ? 'e.g. AAA1234 or email@mau.edu.et' : 'e.g. depthead_se'
              }
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="••••••••"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <Link
              to="/forgot-password"
              style={{ fontSize: 13, color: '#2563eb' }}
            >
              Forgot password?
            </Link>
            {isStudent && (
              <Link
                to="/register"
                style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}
              >
                New student? Register here
              </Link>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            style={{
              height: 48,
              borderRadius: 12,
              background:
                'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              boxShadow: '0 6px 16px rgba(37,99,235,0.3)',
            }}
          >
            Sign In to{' '}
            {roles.find((r) => r.value === selectedRole)?.label.split(' ')[1] ||
              'Portal'}
          </Button>
        </Form>

        {/* QUICK DEMO LOGIN SHORTCUTS — DEV ONLY */}
        {import.meta.env.DEV && (
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px dashed #e2e8f0',
              textAlign: 'center',
            }}
          >
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                fontWeight: 600,
                display: 'block',
                marginBottom: 10,
              }}
            >
              ⚡ QUICK DEMO LOGINS (1-CLICK TEST)
            </Text>
            <Space wrap size={[6, 6]} style={{ justifyContent: 'center', width: '100%' }}>
              <Tag
                color="blue"
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                onClick={() => fillQuickDemo('student')}
              >
                🎓 Student
              </Tag>
              <Tag
                color="purple"
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                onClick={() => fillQuickDemo('departmenthead')}
              >
                🏢 Dept Head
              </Tag>
              <Tag
                color="cyan"
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                onClick={() => fillQuickDemo('librarian')}
              >
                📚 Librarian
              </Tag>
              <Tag
                color="green"
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                onClick={() => fillQuickDemo('dormitory')}
              >
                🏠 Dormitory
              </Tag>
              <Tag
                color="gold"
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                onClick={() => fillQuickDemo('registrar')}
              >
                🎓 Registrar
              </Tag>
              <Tag
                color="red"
                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                onClick={() => fillQuickDemo('admin')}
              >
                ⚙️ Admin
              </Tag>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
}
