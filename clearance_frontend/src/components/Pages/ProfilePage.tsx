import React, { useState } from 'react';
import { Card, Avatar, Typography, Row, Col, Tag, Button, Space, Modal, Form, Input, message, Timeline } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, EditOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import { getSession, setSession } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

export default function ProfilePage() {
  const user = getSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Title level={4}>Please log in to view profile.</Title>
      </div>
    );
  }

  const handleSaveProfile = (values: any) => {
    const updated = {
      ...user,
      first_name: values.first_name,
      last_name: values.last_name,
      full_name: `${values.first_name} ${values.last_name}`,
      email: values.email,
      phone: values.phone
    };
    setSession(updated);
    message.success('Profile updated successfully!');
    setIsEditModalOpen(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      <Row gutter={[24, 24]}>
        {/* USER CARD */}
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 20 }} styles={{ body: { textAlign: 'center', padding: '32px 20px' } }}>
            <Avatar size={96} icon={<UserOutlined />} src={user.profile_picture_url} style={{ marginBottom: 16, border: '3px solid #2563eb' }} />
            <Title level={3} style={{ margin: 0 }}>{user.full_name || `${user.first_name} ${user.last_name}`}</Title>
            <Tag color="blue" style={{ marginTop: 8, fontSize: 13, padding: '2px 12px', borderRadius: 10 }}>
              {user.role.toUpperCase()}
            </Tag>

            <div style={{ marginTop: 24, textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>ID NUMBER / USERNAME</Text>
                  <div style={{ fontWeight: 600 }}>{user.id_number || user.username}</div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>EMAIL ADDRESS</Text>
                  <div style={{ fontWeight: 600 }}>{user.email}</div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>DEPARTMENT</Text>
                  <div style={{ fontWeight: 600 }}>{user.department_name || 'Software Engineering'}</div>
                </div>
              </Space>
            </div>

            <Button
              type="primary"
              icon={<EditOutlined />}
              block
              style={{ marginTop: 24, borderRadius: 10 }}
              onClick={() => {
                form.setFieldsValue({
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  phone: user.phone || '0921459991'
                });
                setIsEditModalOpen(true);
              }}
            >
              Edit Profile Info
            </Button>
          </Card>
        </Col>

        {/* ACTIVITY TIMELINE & DETAILS */}
        <Col xs={24} md={16}>
          <Card title="ACCOUNT ACTIVITY TIMELINE" style={{ borderRadius: 20 }}>
            <Timeline
              items={[
                {
                  color: 'green',
                  content: (
                    <div>
                      <Text strong>Current Session Active</Text>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Logged in as {user.role} role</div>
                    </div>
                  )
                },
                {
                  color: 'blue',
                  content: (
                    <div>
                      <Text strong>Clearance Form Stage Update</Text>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Form tracked in Online Clearance Portal</div>
                    </div>
                  )
                },
                {
                  color: 'gray',
                  content: (
                    <div>
                      <Text strong>Account Registered</Text>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Verified against Mekdela Amba University Database</div>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* EDIT MODAL */}
      <Modal
        title="Edit Profile Information"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block style={{ borderRadius: 10, height: 44, marginTop: 12 }}>
            Save Changes
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
