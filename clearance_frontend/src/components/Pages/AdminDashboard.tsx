import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Upload, Typography, Space, Row, Col, Statistic, Modal, Form, message, Popconfirm
} from 'antd';
import {
  UploadOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, SearchOutlined, UserOutlined, SafetyCertificateOutlined, CodeOutlined
} from '@ant-design/icons';
import { apiFetch, getStoredValidStudents, setStoredValidStudents } from '../../utils/api';
import { ValidStudentCSV } from '../../types';

const { Title, Text, Paragraph } = Typography;

export default function AdminDashboard() {
  const [students, setStudents] = useState<ValidStudentCSV[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = getStoredValidStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download Sample CSV Template
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

  // Export Current Valid Students to CSV
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

  // Upload CSV File
  const handleCSVUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          message.error('CSV file is empty or missing headers');
          return;
        }

        const newEntries: ValidStudentCSV[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length >= 5) {
            newEntries.push({
              id: Date.now() + i,
              id_number: cols[0],
              first_name: cols[1],
              last_name: cols[2],
              full_name: `${cols[1]} ${cols[2]}`,
              college: cols[3],
              department: cols[4],
              year_of_admission: cols[5] || '2022',
              status: 'active',
              is_registered: false
            });
          }
        }

        const updated = [...students, ...newEntries];
        setStoredValidStudents(updated);
        setStudents(updated);
        message.success(`Successfully imported ${newEntries.length} student records!`);
      } catch (err) {
        message.error('Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
    return false; // Prevent auto POST
  };

  const handleAddManualStudent = (values: any) => {
    const newStudent: ValidStudentCSV = {
      id: Date.now(),
      id_number: values.id_number,
      first_name: values.first_name,
      last_name: values.last_name,
      full_name: `${values.first_name} ${values.last_name}`,
      college: values.college,
      department: values.department,
      year_of_admission: values.year_of_admission || '2022',
      status: 'active',
      is_registered: false
    };

    const updated = [newStudent, ...students];
    setStoredValidStudents(updated);
    setStudents(updated);
    message.success('Student record added to valid database!');
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleDeleteStudent = (id: number | string) => {
    const updated = students.filter(s => s.id !== id);
    setStoredValidStudents(updated);
    setStudents(updated);
    message.success('Student record removed.');
  };

  const toggleStatus = (id: number | string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'active' ? 'inactive' : 'active' } as ValidStudentCSV;
      }
      return s;
    });
    setStoredValidStudents(updated);
    setStudents(updated);
    message.info('Student status updated.');
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
      title: 'Student ID',
      dataIndex: 'id_number',
      key: 'id_number',
      render: (id: string) => <Text strong style={{ color: '#2563eb' }}>{id}</Text>
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name'
    },
    {
      title: 'College',
      dataIndex: 'college',
      key: 'college',
      render: (c: string) => <Text style={{ fontSize: 12 }}>{c}</Text>
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Account Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => st === 'active' ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>
    },
    {
      title: 'Registered User',
      dataIndex: 'is_registered',
      key: 'is_registered',
      render: (reg: boolean) => reg ? <Tag color="blue">Registered</Tag> : <Tag color="default">Unregistered</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ValidStudentCSV) => (
        <Space>
          <Button size="small" onClick={() => toggleStatus(record.id)}>
            Toggle Status
          </Button>
          <Popconfirm title="Delete student record?" onConfirm={() => handleDeleteStudent(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Admin CSV Student Management Console</Title>
          <Text type="secondary">Upload, export, and manage eligible university student records database</Text>
        </div>
        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={downloadCSVTemplate}>
            Template CSV
          </Button>
          <Upload beforeUpload={handleCSVUpload} showUploadList={false} accept=".csv">
            <Button type="primary" icon={<UploadOutlined />} style={{ background: '#2563eb', border: 'none' }}>
              Import CSV File
            </Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={exportStudentsCSV}>
            Export CSV
          </Button>
          <Button icon={<CodeOutlined />} onClick={() => window.location.href = '/developer-api'} style={{ background: '#0284c7', color: '#fff', border: 'none' }}>
            Developer API Portal
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)} style={{ background: '#10b981', border: 'none' }}>
            Add Student
          </Button>
        </Space>
      </div>

      {/* STATS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Total Valid Database Records" value={students.length} styles={{ content: { color: '#2563eb', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Active Records" value={activeCount} styles={{ content: { color: '#10b981', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Registered Portal Accounts" value={registeredCount} styles={{ content: { color: '#8b5cf6', fontWeight: 800 } }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Search by ID number, student name, or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, borderRadius: 10, maxWidth: 400 }}
        />
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
      </Card>

      {/* ADD STUDENT MODAL */}
      <Modal
        title="Add Single Eligible Student Record"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddManualStudent}>
          <Form.Item name="id_number" label="Student ID Number" rules={[{ required: true }]}>
            <Input placeholder="e.g. STU007" />
          </Form.Item>
          <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Almaz" />
          </Form.Item>
          <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Ayalew" />
          </Form.Item>
          <Form.Item name="college" label="College" rules={[{ required: true }]}>
            <Input placeholder="College of Computing & Informatics" />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Input placeholder="Computer Science" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ height: 44, borderRadius: 10, marginTop: 12 }}>
            Save Student Record
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
