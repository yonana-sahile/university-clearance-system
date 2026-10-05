import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Tag, Button, Modal, Form,
  Select, DatePicker, TimePicker, Space, Badge, Alert, message, Input
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, CalendarOutlined,
  CheckCircleFilled, EnvironmentOutlined, QrcodeOutlined,
  ThunderboltOutlined, PhoneOutlined
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { User, ClearanceForm } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface OfficeQueueProps {
  user: User | null;
  form: ClearanceForm | null;
}

interface Appointment {
  id: string;
  officeName: string;
  location: string;
  date: string;
  timeSlot: string;
  purpose: string;
  tokenNumber: string;
  status: 'Confirmed' | 'Checked In' | 'Completed';
}

export const OfficeQueueBookingSection: React.FC<OfficeQueueProps> = ({ user, form }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APT-901',
      officeName: 'Main Library Circulation',
      location: 'Central Library, Ground Floor Counter 2',
      date: '2026-10-02',
      timeSlot: '10:30 AM - 11:00 AM',
      purpose: 'Book Return & Fine Clearance Receipt Verification',
      tokenNumber: 'LIB-B04',
      status: 'Confirmed'
    }
  ]);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(null);
  const [formInstance] = Form.useForm();

  // 11 Offices Live Status & Queue Counters
  const officeQueueData = [
    { name: '1. Department Head', dept: 'Software Engineering', room: 'Faculty Wing B, Rm 302', queue: 2, estWait: '8 mins', status: 'Active (Open)', color: 'green' },
    { name: '2. Main Library', dept: 'Circulation Desk', room: 'Library Ground Floor', queue: 5, estWait: '15 mins', status: 'Moderate Queue', color: 'orange' },
    { name: '3. Student Cafeteria', dept: 'Meal Verification', room: 'Dining Hall Admin Office', queue: 1, estWait: '4 mins', status: 'Fast Service', color: 'green' },
    { name: '4. Counseling / Psychology', dept: 'Guidance Center', room: 'Student Services Bldg Rm 104', queue: 0, estWait: '0 mins (Walk-in)', status: 'Available Now', color: 'green' },
    { name: '5. Sport Master', dept: 'Gymnasium & Fields', room: 'Athletics Office Desk 1', queue: 1, estWait: '3 mins', status: 'Available', color: 'green' },
    { name: '6. Campus Police', dept: 'Main Gate Security', room: 'Security Directorate Rm 12', queue: 3, estWait: '10 mins', status: 'Open', color: 'green' },
    { name: '7. Cost Sharing Office', dept: 'Finance Directorate', room: 'Administration Block 2', queue: 4, estWait: '12 mins', status: 'Moderate Queue', color: 'orange' },
    { name: '8. DOP Coordinator', dept: 'Dean of Program', room: 'Registrar Annex Rm 204', queue: 2, estWait: '6 mins', status: 'Open', color: 'green' },
    { name: '9. Student Affairs Dean', dept: 'Welfare Services', room: 'Dean of Students Block', queue: 2, estWait: '7 mins', status: 'Open', color: 'green' },
    { name: '10. Dormitory Proctor', dept: 'Housing Management', room: 'Proctor Office Block 14', queue: 1, estWait: '5 mins', status: 'Fast Service', color: 'green' },
    { name: '11. University Registrar', dept: 'Degree Issuance', room: 'Main Administration 1st Fl', queue: 6, estWait: '20 mins', status: 'High Traffic', color: 'volcano' },
  ];

  const handleBook = (values: any) => {
    const newApt: Appointment = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      officeName: values.office,
      location: officeQueueData.find(o => o.name === values.office)?.room || 'University Campus Office',
      date: values.date ? values.date.format('YYYY-MM-DD') : '2026-10-03',
      timeSlot: values.timeSlot,
      purpose: values.purpose,
      tokenNumber: `${values.office.slice(0, 3).toUpperCase()}-T${Math.floor(10 + Math.random() * 89)}`,
      status: 'Confirmed'
    };

    setAppointments([newApt, ...appointments]);
    setIsBookModalOpen(false);
    formInstance.resetFields();
    message.success(`Priority appointment booked successfully! Priority Token: ${newApt.tokenNumber}`);
  };

  return (
    <div>
      <Card
        style={{
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: 24
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col xs={24} sm={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                fontSize: 22
              }}>
                <ClockCircleOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                  Real-Time Office Queues & Express Booking
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Check live desk waiting times across all 11 clearance checkpoints or book priority express clearance slots.
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right', marginTop: 12 }}>
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => setIsBookModalOpen(true)}
              style={{
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                fontWeight: 700
              }}
            >
              Book Express Office Slot
            </Button>
          </Col>
        </Row>

        {/* ACTIVE APPOINTMENTS BANNER */}
        {appointments.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 12 }}>My Priority Appointment Passes</Title>
            <Row gutter={[16, 16]}>
              {appointments.map(apt => (
                <Col xs={24} md={12} key={apt.id}>
                  <Card
                    style={{
                      borderRadius: 14,
                      border: '1px solid #bbf7d0',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
                    }}
                    styles={{ body: { padding: 18 } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Tag color="green" style={{ borderRadius: 8, fontWeight: 700 }}>
                          TOKEN #{apt.tokenNumber}
                        </Tag>
                        <Title level={5} style={{ margin: '6px 0 2px' }}>{apt.officeName}</Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>{apt.location}</Text>
                      </div>
                      <Button
                        size="small"
                        icon={<QrcodeOutlined />}
                        onClick={() => setSelectedTicket(apt)}
                        style={{ borderRadius: 8 }}
                      >
                        View Pass
                      </Button>
                    </div>

                    <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                      <div><strong>Slot:</strong> {apt.date} • {apt.timeSlot}</div>
                      <div><strong>Purpose:</strong> {apt.purpose}</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* LIVE QUEUE STATUS GRID */}
        <Title level={5} style={{ marginBottom: 14 }}>Live 11-Office Queue Counters</Title>
        <Row gutter={[14, 14]}>
          {officeQueueData.map((office, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc'
                }}
                styles={{ body: { padding: '14px 16px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 14, color: '#0f172a' }}>{office.name}</Text>
                  <Tag color={office.color} style={{ margin: 0, borderRadius: 10, fontSize: 11 }}>
                    {office.status}
                  </Tag>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  <EnvironmentOutlined /> {office.room}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, color: '#334155' }}>
                    In Line: <strong style={{ color: '#0f172a' }}>{office.queue} students</strong>
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Est. Wait: <strong>{office.estWait}</strong>
                  </span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* BOOKING MODAL */}
      <Modal
        title="Schedule Priority Clearance Desk Appointment"
        open={isBookModalOpen}
        onCancel={() => setIsBookModalOpen(false)}
        footer={null}
        width={550}
      >
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={handleBook}
          initialValues={{
            office: '2. Main Library',
            timeSlot: '10:30 AM - 11:00 AM',
            purpose: 'Return physical items and collect clearance sign-off.'
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="office" label="Select Office" rules={[{ required: true }]}>
            <Select size="large" style={{ borderRadius: 8 }}>
              {officeQueueData.map(o => (
                <Option key={o.name} value={o.name}>{o.name} - {o.dept}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="timeSlot" label="Preferred Time Slot" rules={[{ required: true }]}>
                <Select size="large" style={{ borderRadius: 8 }}>
                  <Option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</Option>
                  <Option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</Option>
                  <Option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</Option>
                  <Option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="purpose" label="Clearance Task Purpose" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Return books, inspect room..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Button onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: '#10b981', fontWeight: 700, borderRadius: 8 }}
            >
              Confirm Appointment Booking
            </Button>
          </div>
        </Form>
      </Modal>

      {/* PASS MODAL */}
      <Modal
        title="Electronic Express Priority Pass"
        open={!!selectedTicket}
        onCancel={() => setSelectedTicket(null)}
        footer={[
          <Button key="print" type="primary" onClick={() => window.print()} style={{ borderRadius: 8 }}>
            Print Express Pass
          </Button>,
          <Button key="close" onClick={() => setSelectedTicket(null)}>Close</Button>
        ]}
        centered
        width={420}
      >
        {selectedTicket && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <QRCodeSVG value={`PRIORITY-TOKEN-${selectedTicket.tokenNumber}-${user?.id_number || 'AAA1234'}`} size={160} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#15803d', marginTop: 12 }}>
              {selectedTicket.tokenNumber}
            </div>
            <Title level={5} style={{ margin: '4px 0' }}>{selectedTicket.officeName}</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>{selectedTicket.location}</Text>
            <div style={{ marginTop: 14, background: '#f8fafc', padding: 10, borderRadius: 10, fontSize: 12, border: '1px solid #e2e8f0' }}>
              <div><strong>Holder:</strong> {user?.full_name || 'Yonas Sahile'} ({user?.id_number || 'AAA1234'})</div>
              <div><strong>Scheduled Slot:</strong> {selectedTicket.date} • {selectedTicket.timeSlot}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfficeQueueBookingSection;
