import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Typography, Alert, Row, Col, Space, message } from 'antd';
import { SendOutlined, FileTextOutlined, LockOutlined } from '@ant-design/icons';
import { apiFetch, getSession } from '../../utils/api';

const { Title, Text } = Typography;

interface Props {
  onSubmitted?: () => void;
}

export default function ClearanceFormSubmission({ onSubmitted }: Props) {
  const [loading, setLoading] = useState(false);
  const [portalLocked, setPortalLocked] = useState(false);
  const [portalLockedMessage, setPortalLockedMessage] = useState('');
  const [form] = Form.useForm();
  const user = getSession();

  // ✅ NEW: Check portal status on mount
  useEffect(() => {
    apiFetch('system/settings')
      .then(res => {
        setPortalLocked(!res.is_clearance_open);
        setPortalLockedMessage(res.locked_message || '');
      })
      .catch(() => { /* silent */ });
  }, []);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await apiFetch('forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_level: values.program_level,
          enrollment_type: values.enrollment_type,
          year: values.year,
          semester: values.semester,
          reason: values.reason
        })
      });

      message.success('Clearance application submitted successfully!');
      form.resetFields();
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit clearance form.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: If portal is locked, show lock screen instead of the form
  if (portalLocked) {
    return (
      <Card
        style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          padding: 60,
          borderRadius: 20,
          border: '2px dashed #fbbf24',
          background: '#fffbeb',
        }}
      >
        <LockOutlined style={{ fontSize: 64, color: '#f59e0b', marginBottom: 16 }} />
        <Title level={3} style={{ color: '#92400e' }}>
          Clearance Portal is Currently Locked
        </Title>
        <Text style={{ color: '#78350f', fontSize: 14, display: 'block', maxWidth: 500, margin: '0 auto 24px' }}>
          {portalLockedMessage || 'The administration has temporarily locked the clearance submission portal.'}
        </Text>
        <Button
          type="primary"
          onClick={() => {
            apiFetch('system/settings')
              .then(res => {
                setPortalLocked(!res.is_clearance_open);
                setPortalLockedMessage(res.locked_message || '');
              })
              .catch(() => {});
          }}
          style={{ borderRadius: 10, height: 42, background: '#f59e0b', border: 'none', fontWeight: 700 }}
        >
          Refresh Portal Status
        </Button>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: '#2563eb' }} />
          <span>Apply for Digital Academic Clearance</span>
        </Space>
      }
      style={{ maxWidth: 800, margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: 20 }}
    >
      <Alert
        title="Important Submission Notice"
        description="Your name, ID, college, and department are locked to your official university record. Ensure all your senior thesis papers, library books, dormitory keys, and cafeteria tickets are accounted for before applying."
        type="info"
        showIcon
        style={{ marginBottom: 24, borderRadius: 10 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          full_name: user?.full_name || '---',
          id_number: user?.id_number || '---',
          college: user?.college_name || '---',
          department_name: user?.department_name || '---',
          program_level: 'Undergraduate (B.Sc.)',
          enrollment_type: 'Regular',
          year: '4th Year',
          semester: '2nd Semester',
          reason: 'Graduation Clearance & Degree Completion'
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="full_name" label="Student Full Name" rules={[{ required: true }]}>
              <Input size="large" readOnly style={{ borderRadius: 10, backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600 }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="id_number" label="Student ID Number" rules={[{ required: true }]}>
              <Input size="large" readOnly style={{ borderRadius: 10, backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600 }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="college" label="College" rules={[{ required: true }]}>
              <Input size="large" readOnly style={{ borderRadius: 10, backgroundColor: '#f8fafc', color: '#0f172a' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="department_name" label="Department" rules={[{ required: true }]}>
              <Input size="large" readOnly style={{ borderRadius: 10, backgroundColor: '#f8fafc', color: '#0f172a' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="program_level" label="Program Level" rules={[{ required: true }]}>
              <Select
                size="large"
                options={[
                  { label: 'Undergraduate (B.Sc./B.A.)', value: 'Undergraduate (B.Sc.)' },
                  { label: 'Postgraduate (M.Sc./M.A.)', value: 'Postgraduate' },
                  { label: 'Doctorate (Ph.D.)', value: 'Doctorate' }
                ]}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="enrollment_type" label="Enrollment Mode" rules={[{ required: true }]}>
              <Select
                size="large"
                options={[
                  { label: 'Regular', value: 'Regular' },
                  { label: 'Extension / Evening', value: 'Extension' },
                  { label: 'Summer Program', value: 'Summer' }
                ]}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="year" label="Academic Year" rules={[{ required: true }]}>
              <Select
                size="large"
                options={[
                  { label: '1st Year', value: '1st Year' },
                  { label: '2nd Year', value: '2nd Year' },
                  { label: '3rd Year', value: '3rd Year' },
                  { label: '4th Year', value: '4th Year' },
                  { label: '5th Year', value: '5th Year' }
                ]}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="reason" label="Reason for Seeking Clearance" rules={[{ required: true }]}>
          <Input.TextArea rows={3} placeholder="Describe clearance reason (e.g., Graduation, Withdrawal, Transfer)..." style={{ borderRadius: 10 }} />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
          disabled={portalLocked}
          icon={portalLocked ? <LockOutlined /> : <SendOutlined />}
          style={{
            height: 48,
            borderRadius: 12,
            background: portalLocked
              ? '#94a3b8'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            fontWeight: 700,
            border: 'none',
            boxShadow: portalLocked ? 'none' : '0 6px 16px rgba(37,99,235,0.3)'
          }}
        >
          {portalLocked ? 'Portal is Locked' : 'Submit Application to Department'}
        </Button>
      </Form>
    </Card>
  );
}
