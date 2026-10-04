import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Card, Select, Steps, Typography, Alert, Row, Col, Space, Progress, Tag
} from 'antd';
import {
  IdcardOutlined, SafetyOutlined, CheckCircleOutlined, UserOutlined,
  LockOutlined, BankOutlined, MailOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { apiFetch, getStoredColleges, getStoredDepartments, getStoredBuildings } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const colleges = getStoredColleges();
  const departments = getStoredDepartments();
  const buildings = getStoredBuildings();

  // Step 1: Verify Student ID Number
  const handleVerifyId = async (values: { id_number: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('verify-student-by-id/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: values.id_number })
      });

      if (res.student) {
        setVerifiedStudent(res.student);
        form.setFieldsValue({
          first_name: res.student.first_name,
          last_name: res.student.last_name,
          email: res.student.email,
          college: res.student.college,
          department_name: res.student.department
        });
        setCurrentStep(1);
      }
    } catch (err: any) {
      setError(err.message || 'Student ID verification failed. Please check your ID number.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete Account Registration
  const handleCompleteRegister = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        id_number: verifiedStudent.id_number,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        college: values.college,
        department_name: values.department_name,
        building_id: values.building_id,
        password: values.password
      };

      await apiFetch('register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-canvas" style={{ padding: '32px 16px' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 640,
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.8)'
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 800 }}>
            Student Account Registration
          </Title>
          <Text type="secondary">Mekdela Amba University Student Clearance Portal</Text>
        </div>

        <Steps
          current={currentStep}
          items={[
            { title: 'ID Check', icon: <IdcardOutlined /> },
            { title: 'Account Setup', icon: <UserOutlined /> },
            { title: 'Complete', icon: <CheckCircleOutlined /> }
          ]}
          style={{ marginBottom: 32 }}
        />

        {error && (
          <Alert title={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 10 }} />
        )}

        {/* STEP 0: ID VERIFICATION */}
        {currentStep === 0 && (
          <Form layout="vertical" onFinish={handleVerifyId} initialValues={{ id_number: 'AAA1234' }}>
            <Alert
              title="University Record Check"
              description="Enter your official Mekdela Amba University Student ID Number (e.g., AAA1234 or STU001) to verify your registration eligibility."
              type="info"
              showIcon
              style={{ marginBottom: 20, borderRadius: 10 }}
            />

            <Form.Item
              name="id_number"
              label="Student ID Number"
              rules={[{ required: true, message: 'Please enter your Student ID number' }]}
            >
              <Input
                size="large"
                prefix={<IdcardOutlined style={{ color: '#2563eb' }} />}
                placeholder="e.g. AAA1234 or STU001"
                style={{ borderRadius: 10 }}
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
                boxShadow: '0 6px 16px rgba(37,99,235,0.3)'
              }}
            >
              Verify University Record
            </Button>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Text type="secondary">Already registered? </Text>
              <Link to="/login" style={{ fontWeight: 600, color: '#2563eb' }}>
                Sign In
              </Link>
            </div>
          </Form>
        )}

        {/* STEP 1: ACCOUNT DETAILS */}
        {currentStep === 1 && verifiedStudent && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCompleteRegister}
            initialValues={{ password: 'Password123!', confirm_password: 'Password123!' }}
          >
            <Alert
              title={`Verified Record: ${verifiedStudent.first_name} ${verifiedStudent.last_name}`}
              description={`ID: ${verifiedStudent.id_number} • College: ${verifiedStudent.college}`}
              type="success"
              showIcon
              style={{ marginBottom: 20, borderRadius: 10 }}
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                  <Input size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                  <Input size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="email" label="University Email Address" rules={[{ required: true, type: 'email' }]}>
              <Input size="large" prefix={<MailOutlined />} style={{ borderRadius: 10 }} />
            </Form.Item>

            <Form.Item name="college" label="College" rules={[{ required: true }]}>
              <Select size="large" options={colleges.map(c => ({ label: c.name, value: c.name }))} style={{ borderRadius: 10 }} />
            </Form.Item>

            <Form.Item name="department_name" label="Department" rules={[{ required: true }]}>
              <Select size="large" options={departments.map(d => ({ label: d.name, value: d.name }))} style={{ borderRadius: 10 }} />
            </Form.Item>

            <Form.Item name="building_id" label="Assigned Dormitory Block (Optional)">
              <Select size="large" options={buildings.map(b => ({ label: b.name, value: b.id }))} placeholder="Select Dormitory Block" style={{ borderRadius: 10 }} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Create Password"
                  rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} style={{ borderRadius: 10 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirm_password"
                  label="Confirm Password"
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
                  <Input.Password size="large" prefix={<LockOutlined />} style={{ borderRadius: 10 }} />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button size="large" onClick={() => setCurrentStep(0)} icon={<ArrowLeftOutlined />} style={{ borderRadius: 10 }}>
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  height: 44,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  fontWeight: 700,
                  border: 'none'
                }}
              >
                Complete Registration
              </Button>
            </div>
          </Form>
        )}

        {/* STEP 2: SUCCESS */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={3}>Account Created Successfully!</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              Your student account has been registered with Mekdela Amba University Clearance System. You can now log in to track or submit your digital clearance.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/login')}
              style={{
                borderRadius: 12,
                height: 48,
                padding: '0 32px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                fontWeight: 700,
                border: 'none'
              }}
            >
              Go to Login Page
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
