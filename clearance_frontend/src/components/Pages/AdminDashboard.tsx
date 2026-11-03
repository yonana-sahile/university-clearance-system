import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Upload, Typography, Space, Row, Col,
  Statistic, Modal, Form, message, Popconfirm, Switch, Select, Tabs,
  Tooltip, Empty, Divider
} from 'antd';
import {
  UploadOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined,
  SearchOutlined, CodeOutlined, LockOutlined, UnlockOutlined, UserAddOutlined,
  BankOutlined, ApartmentOutlined, TeamOutlined, CheckCircleOutlined,
  UserOutlined, DatabaseOutlined, SafetyCertificateOutlined,
  SafetyOutlined, FileTextOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ValidStudentCSV } from '../../types';

const { Title, Text } = Typography;

// ─── Design tokens ──────────────────────────────────────────────────
const THEME = {
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primaryLight: '#eef2ff',
  success: '#10b981',
  successLight: '#ecfdf5',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
  purple: '#8b5cf6',
  purpleLight: '#f5f3ff',
  blue: '#3b82f6',
  slate: '#64748b',
  slateLight: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  shadowSm: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
  shadowMd: '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
  shadowLg: '0 10px 30px rgba(15, 23, 42, 0.10), 0 4px 8px rgba(15, 23, 42, 0.04)',
};

// ─── Reusable stat card ─────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bg }) => (
  <Card
    style={{ borderRadius: 16, border: `1px solid ${THEME.border}`, boxShadow: THEME.shadowSm, height: '100%' }}
    styles={{ body: { padding: '20px 22px' } }}
    hoverable
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 52, height: 52, borderRadius: 14, background: bg, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <Text style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {label}
        </Text>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, lineHeight: 1.1, marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  </Card>
);

// ─── Section label ──────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
    {children}
  </Text>
);

export default function AdminDashboard() {
  const [students, setStudents] = useState<ValidStudentCSV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm] = Form.useForm();

  const [isAcademicsModalOpen, setIsAcademicsModalOpen] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [clearanceReleased, setClearanceReleased] = useState<boolean>(() => {
    return localStorage.getItem('mau_clearance_released') === 'true';
  });

  const handleToggleClearance = (checked: boolean) => {
    setClearanceReleased(checked);
    localStorage.setItem('mau_clearance_released', String(checked));
    if (checked) message.success('Clearance Portal is now UNLOCKED for students!');
    else message.warning('Clearance Portal is now LOCKED.');
  };

  useEffect(() => {
    loadStudents();
    loadAcademics();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('admin/valid-students');
      setStudents(res.students || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadAcademics = async () => {
    try {
      const c = await apiFetch('admin/colleges');
      const d = await apiFetch('admin/departments');
      setColleges(c || []);
      setDepartments(d || []);
    } catch (err) {
      console.error('Failed to load academics', err);
    }
  };

  const handleAddStaff = async (values: any) => {
    try {
      await apiFetch('admin/create-staff', { method: 'POST', body: JSON.stringify(values) });
      message.success('Staff member created successfully!');
      setIsStaffModalOpen(false);
      staffForm.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Failed to create staff');
    }
  };

  const handleAddCollege = async (values: any) => {
    try {
      await apiFetch('admin/colleges', { method: 'POST', body: JSON.stringify(values) });
      message.success('College added!');
      loadAcademics();
    } catch (err: any) { message.error(err.message || 'Failed to add college'); }
  };

  const handleDeleteCollege = async (id: number) => {
    try {
      await apiFetch(`admin/colleges/${id}`, { method: 'DELETE' });
      message.success('College deleted!');
      loadAcademics();
    } catch (err: any) { message.error(err.message || 'Failed to delete college'); }
  };

  const handleAddDepartment = async (values: any) => {
    try {
      await apiFetch('admin/departments', { method: 'POST', body: JSON.stringify(values) });
      message.success('Department added!');
      loadAcademics();
    } catch (err: any) { message.error(err.message || 'Failed to add department'); }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await apiFetch(`admin/departments/${id}`, { method: 'DELETE' });
      message.success('Department deleted!');
      loadAcademics();
    } catch (err: any) { message.error(err.message || 'Failed to delete department'); }
  };

  const downloadCSVTemplate = () => {
    const csvContent = "id_number,first_name,last_name,college,department,year_of_admission\nAAA1234,Yonas,Sahile,College of Computing & Informatics,Software Engineering,2022\nSTU005,Mamitu,Tadese,College of Engineering & Technology,Civil Engineering,2021";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "MAU_Valid_Students_Template.csv";
    a.click();
    message.success('Downloaded CSV student import template!');
  };

  const exportStudentsCSV = () => {
    const headers = ['ID Number', 'First Name', 'Last Name', 'College', 'Department', 'Admission Year', 'Status', 'Registered'];
    const rows = students.map(s => [s.id_number, s.first_name, s.last_name, s.college, s.department, s.year_of_admission, s.status, s.is_registered ? 'Yes' : 'No']);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAU_Valid_Students_Database_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    message.success('Exported valid students CSV database!');
  };

  const handleCSVUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) { message.error('CSV file is empty or missing headers'); return; }

        const newEntries = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length >= 5) {
            newEntries.push({
              id_number: cols[0], first_name: cols[1], last_name: cols[2],
              college: cols[3], department: cols[4],
              year_of_admission: cols[5] || '2022', status: 'active',
            });
          }
        }
        await apiFetch('admin/valid-students', { method: 'POST', body: JSON.stringify({ students: newEntries }) });
        message.success(`Successfully imported ${newEntries.length} student records!`);
        loadStudents();
      } catch (err: any) {
        message.error(err.message || 'Failed to parse or upload CSV file.');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleAddManualStudent = async (values: any) => {
    try {
      const newStudent = {
        id_number: values.id_number, first_name: values.first_name,
        last_name: values.last_name, college: values.college,
        department: values.department, year_of_admission: values.year_of_admission || '2022',
        status: 'active',
      };
      await apiFetch('admin/valid-students', { method: 'POST', body: JSON.stringify({ students: [newStudent] }) });
      message.success('Student record added to valid database!');
      setIsAddModalOpen(false);
      addForm.resetFields();
      loadStudents();
    } catch (err: any) { message.error(err.message || 'Failed to add student'); }
  };

  const handleDeleteStudent = async (id: number | string) => {
    try {
      await apiFetch(`admin/valid-students/${id}`, { method: 'DELETE' });
      message.success('Student record removed.');
      loadStudents();
    } catch (err: any) { message.error(err.message || 'Failed to delete student'); }
  };

  const toggleStatus = async (id: number | string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await apiFetch(`admin/valid-students/${id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      message.info('Student status updated.');
      loadStudents();
    } catch (err: any) { message.error(err.message || 'Failed to update status'); }
  };

  const filtered = students.filter(s =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.id_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = students.filter(s => s.status === 'active').length;
  const registeredCount = students.filter(s => s.is_registered).length;

  const columns = [
    {
      title: 'Student ID', dataIndex: 'id_number', key: 'id_number',
      render: (id: string) => <Text strong style={{ color: THEME.primary, fontFamily: 'monospace' }}>{id}</Text>,
    },
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'College', dataIndex: 'college', key: 'college', render: (c: string) => <Text style={{ fontSize: 12, color: THEME.textMuted }}>{c}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (st: string) => st === 'active'
        ? <Tag color="success" style={{ borderRadius: 6, fontWeight: 600 }}>Active</Tag>
        : <Tag color="error" style={{ borderRadius: 6, fontWeight: 600 }}>Inactive</Tag>,
    },
    {
      title: 'Registered', dataIndex: 'is_registered', key: 'is_registered',
      render: (reg: boolean) => reg
        ? <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>Registered</Tag>
        : <Tag style={{ borderRadius: 6, fontWeight: 600, color: THEME.slate }}>Unregistered</Tag>,
    },
    {
      title: 'Actions', key: 'actions', align: 'right' as const,
      render: (_: any, record: ValidStudentCSV) => (
        <Space size={6}>
          <Tooltip title="Toggle active status">
            <Button size="small" onClick={() => toggleStatus(record.id, record.status)}>Toggle</Button>
          </Tooltip>
          <Popconfirm title="Delete student record?" onConfirm={() => handleDeleteStudent(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>

        {/* ─── HERO HEADER ─────────────────────────────────────── */}
        <div
          style={{
            borderRadius: 20,
            background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.purple} 100%)`,
            padding: '32px 36px',
            marginBottom: 24,
            boxShadow: THEME.shadowLg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 220, height: 220,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, right: 80, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Space size={10} align="center" style={{ marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18,
              }}>
                <SafetyCertificateOutlined />
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 13, letterSpacing: 1 }}>
                MAU ADMIN PORTAL
              </Text>
            </Space>
            <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800, letterSpacing: -0.5 }}>
              Student Management Console
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Manage eligible students, staff, and academic departments from one place
            </Text>
          </div>
        </div>

        {/* ─── CLEARANCE CONTROL PANEL ─────────────────────────── */}
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            background: clearanceReleased ? THEME.successLight : THEME.dangerLight,
            border: `1px solid ${clearanceReleased ? '#a7f3d0' : '#fecaca'}`,
            boxShadow: THEME.shadowSm,
          }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Space size={16} align="start">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: clearanceReleased ? '#10b981' : '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22, flexShrink: 0,
                boxShadow: clearanceReleased ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(239,68,68,0.3)',
              }}>
                {clearanceReleased ? <UnlockOutlined /> : <LockOutlined />}
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: clearanceReleased ? '#166534' : '#991b1b', fontWeight: 700 }}>
                  Clearance Portal {clearanceReleased ? 'is OPEN' : 'is LOCKED'}
                </Title>
                <Text style={{ color: clearanceReleased ? '#15803d' : '#b91c1c', fontSize: 13 }}>
                  {clearanceReleased
                    ? 'Students can log in and submit clearance forms.'
                    : 'Students are blocked from logging in. Unlock to start the season.'}
                </Text>
              </div>
            </Space>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#fff', padding: '10px 18px', borderRadius: 12,
              border: `1px solid ${THEME.border}`, boxShadow: THEME.shadowSm,
            }}>
              <Text strong style={{ fontSize: 12, color: THEME.slate, letterSpacing: 0.5 }}>
                {clearanceReleased ? 'LOCK PORTAL' : 'UNLOCK PORTAL'}
              </Text>
              <Switch
                checked={clearanceReleased}
                onChange={handleToggleClearance}
                style={{ backgroundColor: clearanceReleased ? THEME.success : THEME.danger }}
              />
            </div>
          </div>
        </Card>

        {/* ─── STATS ───────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <StatCard label="Total Records" value={students.length} icon={<DatabaseOutlined />} color={THEME.primary} bg={THEME.primaryLight} />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard label="Active Records" value={activeCount} icon={<CheckCircleOutlined />} color={THEME.success} bg={THEME.successLight} />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard label="Registered Accounts" value={registeredCount} icon={<UserOutlined />} color={THEME.purple} bg={THEME.purpleLight} />
          </Col>
        </Row>

        {/* ─── ACTION BAR ──────────────────────────────────────── */}
        <Card
          style={{ borderRadius: 16, border: `1px solid ${THEME.border}`, boxShadow: THEME.shadowSm, marginBottom: 24 }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <SectionLabel>Data Management</SectionLabel>
              <Space wrap style={{ marginTop: 10 }}>
                <Button icon={<DownloadOutlined />} onClick={downloadCSVTemplate} style={{ borderRadius: 8 }}>
                  Template
                </Button>
                <Upload beforeUpload={handleCSVUpload} showUploadList={false} accept=".csv">
                  <Button type="primary" icon={<UploadOutlined />} style={{ background: THEME.blue, border: 'none', borderRadius: 8 }}>
                    Import
                  </Button>
                </Upload>
                <Button icon={<DownloadOutlined />} onClick={exportStudentsCSV} style={{ borderRadius: 8 }}>
                  Export
                </Button>
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              <SectionLabel>System</SectionLabel>
              <Space wrap style={{ marginTop: 10 }}>
                <Button icon={<CodeOutlined />} onClick={() => window.location.href = '/developer-api'}
                  style={{ background: THEME.slate, color: '#fff', border: 'none', borderRadius: 8 }}>
                  API Portal
                </Button>
                <Button icon={<ApartmentOutlined />} onClick={() => setIsAcademicsModalOpen(true)}
                  style={{ background: THEME.warning, color: '#fff', border: 'none', borderRadius: 8 }}>
                  Academics
                </Button>
                <Button icon={<UserAddOutlined />} onClick={() => setIsStaffModalOpen(true)}
                  style={{ background: THEME.purple, color: '#fff', border: 'none', borderRadius: 8 }}>
                  Register Staff
                </Button>
              </Space>
            </Col>
            <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <SectionLabel>Quick Action</SectionLabel>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  marginTop: 10, height: 44, borderRadius: 10, fontWeight: 600,
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                }}
              >
                Add New Student
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ─── STUDENT TABLE ───────────────────────────────────── */}
        <Card
          style={{ borderRadius: 16, border: `1px solid ${THEME.border}`, boxShadow: THEME.shadowSm }}
          styles={{ body: { padding: '20px 24px' } }}
          title={
            <Space size={10}>
              <TeamOutlined style={{ color: THEME.primary }} />
              <Text strong style={{ fontSize: 15 }}>Valid Student Database</Text>
            </Space>
          }
          extra={
            <Input
              prefix={<SearchOutlined style={{ color: THEME.slate }} />}
              placeholder="Search by ID, name, or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 320, borderRadius: 10 }}
            />
          }
        >
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text style={{ color: THEME.textMuted }}>No student records found</Text>}
                />
              ),
            }}
            size="middle"
          />
        </Card>

        {/* ─── ADD STUDENT MODAL ───────────────────────────────── */}
        <Modal
          title={<Space size={10}><PlusOutlined style={{ color: THEME.primary }} /><Text strong>Add Single Student Record</Text></Space>}
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={560}
          style={{ borderRadius: 16 }}
        >
          <Form form={addForm} layout="vertical" onFinish={handleAddManualStudent} style={{ marginTop: 16 }}>
            <Form.Item name="id_number" label="Student ID Number" rules={[{ required: true }]}>
              <Input placeholder="e.g. STU007" size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                  <Input placeholder="e.g. Almaz" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                  <Input placeholder="e.g. Ayalew" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="college" label="College" rules={[{ required: true }]}>
              <Input placeholder="College of Computing & Informatics" size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
              <Input placeholder="Computer Science" size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Button
              type="primary" htmlType="submit" block size="large"
              style={{
                height: 46, borderRadius: 10, marginTop: 8, fontWeight: 600,
                background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
                border: 'none',
              }}
            >
              Save Student Record
            </Button>
          </Form>
        </Modal>

        {/* ─── REGISTER STAFF MODAL ────────────────────────────── */}
        <Modal
          title={<Space size={10}><UserAddOutlined style={{ color: THEME.purple }} /><Text strong>Register New Staff</Text></Space>}
          open={isStaffModalOpen}
          onCancel={() => setIsStaffModalOpen(false)}
          footer={null}
          width={580}
          style={{ borderRadius: 16 }}
        >
          <Form form={staffForm} layout="vertical" onFinish={handleAddStaff} style={{ marginTop: 16 }}>
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
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input placeholder="e.g. depthead_cs" size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select
                size="large"
                style={{ borderRadius: 10 }}
                options={[
                  { label: 'Department Head', value: 'departmenthead' },
                  { label: 'Librarian', value: 'librarian' },
                  { label: 'Registrar', value: 'registrar' },
                  { label: 'Cafeteria', value: 'cafeteria' },
                  { label: 'Dormitory', value: 'dormitory' },
                  { label: 'Psychology', value: 'psychology' },
                ]}
              />
            </Form.Item>
            <Form.Item name="department_id" label="Department (Required for Dept Heads & Registrars)">
              {/* ✅ FIXED: Sends department_id instead of name to avoid collisions */}
              <Select
                size="large"
                style={{ borderRadius: 10 }}
                options={departments.map(d => ({ label: d.name, value: d.id }))}
                allowClear
                placeholder="Select a department"
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Button
              type="primary" htmlType="submit" block size="large"
              style={{
                height: 46, borderRadius: 10, marginTop: 8, fontWeight: 600,
                background: `linear-gradient(135deg, ${THEME.purple} 0%, #7c3aed 100%)`,
                border: 'none',
              }}
            >
              Create Staff Account
            </Button>
          </Form>
        </Modal>

        {/* ─── MANAGE ACADEMICS MODAL ──────────────────────────── */}
        <Modal
          title={
            <Space size={10}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: THEME.warningLight,
                color: THEME.warning, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BankOutlined />
              </div>
              <Text strong>Manage Colleges & Departments</Text>
            </Space>
          }
          open={isAcademicsModalOpen}
          onCancel={() => setIsAcademicsModalOpen(false)}
          footer={null}
          width={780}
          style={{ borderRadius: 16 }}
        >
          <Tabs
            defaultActiveKey="colleges"
            style={{ marginTop: 8 }}
            items={[
              {
                key: 'colleges',
                label: <Space size={6}><BankOutlined /> Colleges</Space>,
                children: (
                  <div>
                    <Form layout="inline" onFinish={handleAddCollege} style={{ marginBottom: 20, gap: 8, flexWrap: 'wrap' }}>
                      <Form.Item name="name" rules={[{ required: true, message: 'Enter name' }]} style={{ flex: 1, minWidth: 240 }}>
                        <Input placeholder="Enter new college name" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} size="large"
                        style={{ borderRadius: 10, background: THEME.warning, border: 'none', fontWeight: 600 }}>
                        Add College
                      </Button>
                    </Form>
                    <Table
                      dataSource={colleges}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5, showSizeChanger: false }}
                      columns={[
                        { title: 'ID', dataIndex: 'id', width: 70, render: (id: number) => <Text style={{ fontFamily: 'monospace', color: THEME.textMuted }}>#{id}</Text> },
                        { title: 'College Name', dataIndex: 'name', render: (n: string) => <Text strong>{n}</Text> },
                        {
                          title: '', width: 70, align: 'right' as const,
                          render: (_: any, r: any) => (
                            <Popconfirm title="Delete this college?" onConfirm={() => handleDeleteCollege(r.id)}>
                              <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
                            </Popconfirm>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: 'departments',
                label: <Space size={6}><ApartmentOutlined /> Departments</Space>,
                children: (
                  <div>
                    <Form layout="inline" onFinish={handleAddDepartment} style={{ marginBottom: 20, gap: 8, flexWrap: 'wrap' }}>
                      <Form.Item name="name" rules={[{ required: true, message: 'Enter name' }]} style={{ flex: 1, minWidth: 200 }}>
                        <Input placeholder="Department name" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                      <Form.Item name="college_id" rules={[{ required: true, message: 'Select college' }]} style={{ minWidth: 200 }}>
                        <Select
                          placeholder="Select College"
                          size="large"
                          style={{ borderRadius: 10, width: '100%' }}
                          options={colleges.map(c => ({ label: c.name, value: c.id }))}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} size="large"
                        style={{ borderRadius: 10, background: THEME.warning, border: 'none', fontWeight: 600 }}>
                        Add Dept
                      </Button>
                    </Form>
                    <Table
                      dataSource={departments}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5, showSizeChanger: false }}
                      columns={[
                        { title: 'ID', dataIndex: 'id', width: 70, render: (id: number) => <Text style={{ fontFamily: 'monospace', color: THEME.textMuted }}>#{id}</Text> },
                        { title: 'Department Name', dataIndex: 'name', render: (n: string) => <Text strong>{n}</Text> },
                        {
                          title: 'College', dataIndex: 'college',
                          render: (collegeId: number) => {
                            const c = colleges.find(x => x.id === collegeId);
                            return c ? <Tag color="blue" style={{ borderRadius: 6 }}>{c.name}</Tag> : <Text type="secondary">Unknown</Text>;
                          },
                        },
                        {
                          title: '', width: 70, align: 'right' as const,
                          render: (_: any, r: any) => (
                            <Popconfirm title="Delete this department?" onConfirm={() => handleDeleteDepartment(r.id)}>
                              <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
                            </Popconfirm>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Modal>
      </div>
    </div>
  );
}
