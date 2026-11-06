import React, { useState, useEffect } from 'react';
import {
  Modal, Input, Card, Tag, Typography, Space, Row, Col, Button, Empty, Divider
} from 'antd';
import {
  SearchOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined,
  ClockCircleOutlined, UserOutlined, ArrowLeftOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import CampusMap from '../Common/CampusMap';

const { Title, Text, Paragraph } = Typography;

interface OfficeDirectoryModalProps {
  open: boolean;
  onClose: () => void;
}

interface Office {
  id: string;
  name: string;
  building: string;
  hours: string;
  officer: string;
  phone: string;
  email: string;
  requirements: string;
  lat: number;
  lng: number;
}

const OFFICES: Office[] = [
  {
    id: 'departmenthead',
    name: 'Department Head Office',
    building: 'Engineering Block 03, Room 102',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Dr. Aster Alemayehu',
    phone: '+251 58 111 2011',
    email: 'depthead.eng@mau.edu.et',
    requirements: 'Senior project submission, grade reports clearance, laboratory gear return',
    lat: 10.985390405193206, lng: 39.2638088707218
  },
  {
    id: 'librarian',
    name: 'University Main Library',
    building: 'Central Library Complex',
    hours: 'Mon - Sat: 8:00 AM - 8:00 PM',
    officer: 'Mulugeta Yilma',
    phone: '+251 58 111 2012',
    email: 'library@mau.edu.et',
    requirements: 'Return all borrowed books, settle overdue fines via Telebirr or CBE Birr',
    lat: 10.987089453980092, lng: 39.262882820886034
  },
  {
    id: 'cafeteria',
    name: 'Student Cafeteria & Dining',
    building: 'Student Dining Hall A',
    hours: 'Mon - Sun: 6:30 AM - 7:30 PM',
    officer: 'Bekele Desta',
    phone: '+251 58 111 2013',
    email: 'cafeteria@mau.edu.et',
    requirements: 'Hand in monthly dining coupon booklet and meal ID badge',
    lat: 10.988058412759827, lng: 39.262367836784854
  },
  {
    id: 'dormitory_a',
    name: 'Dormitory Block A',
    building: 'Residence Block A',
    hours: '24/7',
    officer: 'Block Proctor',
    phone: '+251 58 111 2014',
    email: 'dormitory@mau.edu.et',
    requirements: 'Room inspection clearance, return room keys and mattress',
    lat: 10.986247321046395, lng: 39.26120192938775 // ✅ UPDATED
  },
  {
    id: 'dormitory_b',
    name: 'Dormitory Block B',
    building: 'Residence Block B',
    hours: '24/7',
    officer: 'Block Proctor',
    phone: '+251 58 111 2014',
    email: 'dormitory@mau.edu.et',
    requirements: 'Room inspection clearance, return room keys and mattress',
    lat: 10.98563358426923, lng: 39.261284502190186 // ✅ UPDATED
  },
  {
    id: 'dormitory_c',
    name: 'Dormitory Block C',
    building: 'Residence Block C',
    hours: '24/7',
    officer: 'Block Proctor',
    phone: '+251 58 111 2014',
    email: 'dormitory@mau.edu.et',
    requirements: 'Room inspection clearance, return room keys and mattress',
    lat: 10.985002476252415, lng: 39.26138476916457 // ✅ UPDATED
  },
  {
    id: 'dormitory_d',
    name: 'Dormitory Block D',
    building: 'Residence Block D',
    hours: '24/7',
    officer: 'Block Proctor',
    phone: '+251 58 111 2014',
    email: 'dormitory@mau.edu.et',
    requirements: 'Room inspection clearance, return room keys and mattress',
    lat: 10.98464349677841, lng: 39.261396565279206 // ✅ UPDATED
  },
  {
    id: 'dormitory_e',
    name: 'Dormitory Block E',
    building: 'Residence Block E',
    hours: '24/7',
    officer: 'Block Proctor',
    phone: '+251 58 111 2014',
    email: 'dormitory@mau.edu.et',
    requirements: 'Room inspection clearance, return room keys and mattress',
    lat: 10.985639374244787, lng: 39.260594429484115 // ✅ UPDATED
  },
  {
    id: 'psychology',
    name: 'Student Counseling & Psychology',
    building: 'Student Health & Wellness Center',
    hours: 'Mon - Fri: 8:30 AM - 4:30 PM',
    officer: 'Dr. Samuel Kassa',
    phone: '+251 58 111 2015',
    email: 'counseling@mau.edu.et',
    requirements: 'Counseling exit feedback form',
    lat: 10.985390405193206, lng: 39.2638088707218
  },
  {
    id: 'sportmaster',
    name: 'Sports & Athletics Master',
    building: 'MAU Sports Gymnasium',
    hours: 'Mon - Fri: 9:00 AM - 5:00 PM',
    officer: 'Coach Yosef Kebede',
    phone: '+251 58 111 2016',
    email: 'sports@mau.edu.et',
    requirements: 'Return university jerseys, sports equipment, and gym locker key',
    lat: 10.985390405193206, lng: 39.2638088707218
  },
  {
    id: 'campuspolice',
    name: 'Campus Security & Police',
    building: 'Main Gate Security Office',
    hours: '24/7 Operational',
    officer: 'Commander Firew Worku',
    phone: '+251 58 111 2017',
    email: 'security@mau.edu.et',
    requirements: 'Clearance of campus conduct and parking/vehicle permits',
    lat: 10.984707186694326, lng: 39.26200406516722
  },
  {
    id: 'cooperationsharing',
    name: 'Cooperation & Cost-Sharing Office',
    building: 'Administration Building, Floor 2',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Tigist Wondimu',
    phone: '+251 58 111 2018',
    email: 'costsharing@mau.edu.et',
    requirements: 'Signed Ministry of Education cost-sharing agreement contract',
    lat: 11.5940, lng: 37.3862 // ⚠️ STILL OLD COORDINATE - Waiting for your data
  },
  {
    id: 'dopcordinator',
    name: 'Degree Program (DOP) Coordinator',
    building: 'Academic Affairs Wing',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Prof. Girma Bedada',
    phone: '+251 58 111 2019',
    email: 'dop@mau.edu.et',
    requirements: 'Curriculum course credit verification and thesis audit',
    lat: 10.984261356839378, lng: 39.262387438923724
  },
  {
    id: 'studentaffairs',
    name: 'Student Affairs Directorate',
    building: 'Student Center, Room 204',
    hours: 'Mon - Fri: 8:30 AM - 5:00 PM',
    officer: 'Eleni Haile',
    phone: '+251 58 111 2020',
    email: 'studentaffairs@mau.edu.et',
    requirements: 'Student union and campus club conduct clearance',
    lat: 10.984261356839378, lng: 39.262387438923724
  },
  {
    id: 'registrar',
    name: 'Office of the University Registrar',
    building: 'Main Senate Building, Floor 1',
    hours: 'Mon - Fri: 8:00 AM - 5:30 PM',
    officer: 'Dr. Worku Tesfaye',
    phone: '+251 58 111 2000',
    email: 'registrar@mau.edu.et',
    requirements: 'Final official digital clearance seal & degree parchment processing',
    lat: 10.984261356839378, lng: 39.262387438923724
  }
];

export const OfficeDirectoryModal: React.FC<OfficeDirectoryModalProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  );

  // Track viewport for responsive switching
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select first office on desktop (only when transitioning from mobile → desktop)
  useEffect(() => {
    if (!isMobile && !selectedOffice && OFFICES.length > 0) {
      setSelectedOffice(OFFICES[0]);
    }
  }, [isMobile]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      if (isMobile) setSelectedOffice(null);
    }
  }, [open, isMobile]);

  const filtered = OFFICES.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.officer.toLowerCase().includes(search.toLowerCase()) ||
    o.building.toLowerCase().includes(search.toLowerCase())
  );

  const showList = !isMobile || !selectedOffice;
  const showDetail = !isMobile || !!selectedOffice;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 1280, top: 20 }}
      styles={{ body: { padding: '20px 24px' } }}
      title={
        <Space align="center">
          <EnvironmentOutlined style={{ color: '#2563eb', fontSize: 20 }} />
          <span style={{ fontWeight: 800, fontSize: 18 }}>MAU Campus Directory & Navigation</span>
        </Space>
      }
      destroyOnClose
    >
      <Row gutter={[20, 20]}>
        {/* ─── LEFT PANEL: OFFICE LIST ─────────────────────────── */}
        {showList && (
          <Col xs={24} lg={9}>
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                height: '100%',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Search office, officer, or building..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ marginBottom: 16, borderRadius: 12 }}
              />

              <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
                {filtered.length === 0 ? (
                  <Empty description="No offices matched your search" style={{ marginTop: 40 }} />
                ) : (
                  filtered.map((office) => {
                    const isSelected = selectedOffice?.id === office.id;
                    return (
                      <div
                        key={office.id}
                        onClick={() => setSelectedOffice(office)}
                        style={{
                          padding: 14,
                          marginBottom: 10,
                          borderRadius: 12,
                          cursor: 'pointer',
                          border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <Text strong style={{ fontSize: 14, color: isSelected ? '#1e3a8a' : '#0f172a', flex: 1 }}>
                            {office.name}
                          </Text>
                          {isSelected && (
                            <CheckCircleOutlined style={{ color: '#2563eb', fontSize: 16, marginLeft: 8 }} />
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                          <UserOutlined style={{ marginRight: 6 }} />{office.officer}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          <EnvironmentOutlined style={{ marginRight: 6 }} />{office.building}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </Col>
        )}

        {/* ─── RIGHT PANEL: DETAILS + MAP ──────────────────────── */}
        {showDetail && (
          <Col xs={24} lg={15}>
            {selectedOffice ? (
              <Card
                style={{
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  height: '100%',
                }}
                styles={{ body: { padding: 20 } }}
              >
                {/* Mobile Back Button */}
                {isMobile && (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setSelectedOffice(null)}
                    style={{ marginBottom: 16, borderRadius: 10 }}
                  >
                    Back to Offices
                  </Button>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#1e3a8a', fontWeight: 800 }}>
                      {selectedOffice.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {selectedOffice.building}
                    </Text>
                  </div>
                  <Tag color="blue" style={{ borderRadius: 8, fontWeight: 700, padding: '4px 12px' }}>
                    {selectedOffice.id.split('_')[0].toUpperCase()}
                  </Tag>
                </div>

                {/* Contact Info Grid */}
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12}>
                    <InfoCard
                      icon={<UserOutlined />}
                      label="Officer In-Charge"
                      value={selectedOffice.officer}
                      color="#2563eb"
                      bg="#eff6ff"
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <InfoCard
                      icon={<ClockCircleOutlined />}
                      label="Office Hours"
                      value={selectedOffice.hours}
                      color="#d97706"
                      bg="#fffbeb"
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <InfoCard
                      icon={<PhoneOutlined />}
                      label="Phone"
                      value={selectedOffice.phone}
                      color="#16a34a"
                      bg="#f0fdf4"
                      href={`tel:${selectedOffice.phone}`}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <InfoCard
                      icon={<MailOutlined />}
                      label="Email"
                      value={selectedOffice.email}
                      color="#8b5cf6"
                      bg="#f5f3ff"
                      href={`mailto:${selectedOffice.email}`}
                    />
                  </Col>
                </Row>

                {/* Requirements Callout */}
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 16,
                  }}
                >
                  <Text strong style={{ fontSize: 12, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Clearance Requirements
                  </Text>
                  <Paragraph style={{ margin: '4px 0 0', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                    {selectedOffice.requirements}
                  </Paragraph>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* ✅ LIVE MAP (taller for professional look) */}
                <CampusMap
                  lat={selectedOffice.lat}
                  lng={selectedOffice.lng}
                  name={selectedOffice.name}
                  address={selectedOffice.building}
                  height={isMobile ? 300 : 420}
                />
              </Card>
            ) : (
              // Desktop fallback when nothing is selected
              <Card
                style={{
                  borderRadius: 16,
                  height: '100%',
                  minHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <EnvironmentOutlined style={{ fontSize: 56, color: '#94a3b8', marginBottom: 12 }} />
                  <Title level={4} style={{ color: '#64748b', margin: 0 }}>
                    Select an Office
                  </Title>
                  <Text type="secondary">
                    Pick an office from the list to view contact info and live navigation.
                  </Text>
                </div>
              </Card>
            )}
          </Col>
        )}
      </Row>
    </Modal>
  );
};

// ─── Reusable Info Card ──────────────────────────────────────
const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
  href?: string;
}> = ({ icon, label, value, color, bg, href }) => (
  <div
    style={{
      background: bg,
      border: `1px solid ${color}20`,
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    }}
  >
    <div style={{ color, fontSize: 16, marginTop: 2 }}>{icon}</div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <Text style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>
        {href ? (
          <a href={href} style={{ color: '#0f172a', textDecoration: 'none' }}>
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  </div>
);

export default OfficeDirectoryModal;
