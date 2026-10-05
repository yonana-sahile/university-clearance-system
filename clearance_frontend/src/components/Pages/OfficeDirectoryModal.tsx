import React, { useState } from 'react';
import { Modal, Input, Card, Tag, Typography, Space, Row, Col, Badge } from 'antd';
import { SearchOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OfficeDirectoryModalProps {
  open: boolean;
  onClose: () => void;
}

const OFFICES = [
  {
    id: 'departmenthead',
    name: 'Department Head Office',
    building: 'Engineering Block 03, Room 102',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Dr. Aster Alemayehu',
    phone: '+251 58 111 2011',
    email: 'depthead.eng@mau.edu.et',
    requirements: 'Senior project submission, grade reports clearance, laboratory gear return'
  },
  {
    id: 'librarian',
    name: 'University Main Library',
    building: 'Central Library Complex',
    hours: 'Mon - Sat: 8:00 AM - 8:00 PM',
    officer: 'Mulugeta Yilma',
    phone: '+251 58 111 2012',
    email: 'library@mau.edu.et',
    requirements: 'Return all borrowed books, settle overdue fines via Telebirr or CBE Birr'
  },
  {
    id: 'cafeteria',
    name: 'Student Cafeteria & Dining',
    building: 'Student Dining Hall A',
    hours: 'Mon - Sun: 6:30 AM - 7:30 PM',
    officer: 'Bekele Desta',
    phone: '+251 58 111 2013',
    email: 'cafeteria@mau.edu.et',
    requirements: 'Hand in monthly dining coupon booklet and meal ID badge'
  },
  {
    id: 'dormitory',
    name: 'Dormitory & Residence Service',
    building: 'Proctor Office Block 12',
    hours: 'Mon - Fri: 8:00 AM - 5:30 PM',
    officer: 'Almaz Tadesse',
    phone: '+251 58 111 2014',
    email: 'dormitory@mau.edu.et',
    requirements: 'Room inspection clearance, return room keys and mattress'
  },
  {
    id: 'psychology',
    name: 'Student Counseling & Psychology',
    building: 'Student Health & Wellness Center',
    hours: 'Mon - Fri: 8:30 AM - 4:30 PM',
    officer: 'Dr. Samuel Kassa',
    phone: '+251 58 111 2015',
    email: 'counseling@mau.edu.et',
    requirements: 'Counseling exit feedback form'
  },
  {
    id: 'sportmaster',
    name: 'Sports & Athletics Master',
    building: 'MAU Sports Gymnasium',
    hours: 'Mon - Fri: 9:00 AM - 5:00 PM',
    officer: 'Coach Yosef Kebede',
    phone: '+251 58 111 2016',
    email: 'sports@mau.edu.et',
    requirements: 'Return university jerseys, sports equipment, and gym locker key'
  },
  {
    id: 'campuspolice',
    name: 'Campus Security & Police',
    building: 'Main Gate Security Office',
    hours: '24/7 Operational',
    officer: 'Commander Firew Worku',
    phone: '+251 58 111 2017',
    email: 'security@mau.edu.et',
    requirements: 'Clearance of campus conduct and parking/vehicle permits'
  },
  {
    id: 'cooperationsharing',
    name: 'Cooperation & Cost-Sharing Office',
    building: 'Administration Building, Floor 2',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Tigist Wondimu',
    phone: '+251 58 111 2018',
    email: 'costsharing@mau.edu.et',
    requirements: 'Signed Ministry of Education cost-sharing agreement contract'
  },
  {
    id: 'dopcordinator',
    name: 'Degree Program (DOP) Coordinator',
    building: 'Academic Affairs Wing',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Prof. Girma Bedada',
    phone: '+251 58 111 2019',
    email: 'dop@mau.edu.et',
    requirements: 'Curriculum course credit verification and thesis audit'
  },
  {
    id: 'studentaffairs',
    name: 'Student Affairs Directorate',
    building: 'Student Center, Room 204',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Eleni Haile',
    phone: '+251 58 111 2020',
    email: 'studentaffairs@mau.edu.et',
    requirements: 'Student union and campus club conduct clearance'
  },
  {
    id: 'registrar',
    name: 'Office of the University Registrar',
    building: 'Main Senate Building, Floor 1',
    hours: 'Mon - Fri: 8:00 AM - 5:30 PM',
    officer: 'Dr. Worku Tesfaye',
    phone: '+251 58 111 2000',
    email: 'registrar@mau.edu.et',
    requirements: 'Final official digital clearance seal & degree parchment processing'
  }
];

export const OfficeDirectoryModal: React.FC<OfficeDirectoryModalProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = OFFICES.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.officer.toLowerCase().includes(search.toLowerCase()) ||
    o.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <Space align="center">
          <EnvironmentOutlined style={{ color: '#2563eb' }} />
          <span style={{ fontWeight: 800, fontSize: 18 }}>MAU Clearance Offices Directory & Helplines</span>
        </Space>
      }
      style={{ top: 20 }}
    >
      <Input
        size="large"
        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        placeholder="Search office by name, building location, or officer name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 20, borderRadius: 12 }}
      />

      <Row gutter={[16, 16]} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
        {filtered.map(office => (
          <Col xs={24} md={12} key={office.id}>
            <Card
              size="small"
              style={{ borderRadius: 14, height: '100%', borderLeft: '4px solid #2563eb' }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0, color: '#1e3a8a', fontWeight: 800 }}>{office.name}</Title>
                <Tag color="blue">{office.id}</Tag>
              </div>

              <Space direction="vertical" size={4} style={{ width: '100%', fontSize: 13, color: '#475569' }}>
                <div><UserOutlined style={{ color: '#2563eb', marginRight: 6 }} /><strong>Officer:</strong> {office.officer}</div>
                <div><EnvironmentOutlined style={{ color: '#e11d48', marginRight: 6 }} /><strong>Location:</strong> {office.building}</div>
                <div><ClockCircleOutlined style={{ color: '#d97706', marginRight: 6 }} /><strong>Hours:</strong> {office.hours}</div>
                <div><PhoneOutlined style={{ color: '#16a34a', marginRight: 6 }} /><strong>Phone:</strong> {office.phone}</div>
                <div><MailOutlined style={{ color: '#8b5cf6', marginRight: 6 }} /><strong>Email:</strong> {office.email}</div>
              </Space>

              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed #e2e8f0', fontSize: 12, color: '#64748b' }}>
                <strong>Clearance Requirements:</strong> {office.requirements}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default OfficeDirectoryModal;
