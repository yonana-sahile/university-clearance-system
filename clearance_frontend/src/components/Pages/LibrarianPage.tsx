import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Modal, Typography, Space, Row, Col, Statistic, message, Tabs, Form } from 'antd';
import { CheckOutlined, CloseOutlined, SearchOutlined, BookOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons';
import { apiFetch, getStoredForms, setStoredForms, getStoredDues, setStoredDues } from '../../utils/api';
import type { ClearanceForm, DueRecord } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';

const { Title, Text, Paragraph } = Typography;

export default function LibrarianPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [dueForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setForms(getStoredForms());
      setDues(getStoredDues());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (record: ClearanceForm) => {
    const all = getStoredForms();
    const idx = all.findIndex(f => f.id === record.id);
    if (idx !== -1) {
      all[idx].status = 'approved_library';
      all[idx].library_note = 'Library account clear. Zero unreturned literature.';
      all[idx].library_approved_by = 'Mulugeta Yilma (Librarian)';
      setStoredForms(all);
    }
    message.success(`Library clearance approved for ${record.full_name}!`);
    loadData();
  };

  const handleRequirePayment = (record: ClearanceForm) => {
    const all = getStoredForms();
    const idx = all.findIndex(f => f.id === record.id);
    if (idx !== -1) {
      all[idx].status = 'requires_library_payment';
      all[idx].library_note = 'Overdue book fine required before clearance.';
      setStoredForms(all);
    }
    message.warning(`Payment requested from ${record.full_name}.`);
    loadData();
  };

  const handleCreateDue = (values: any) => {
    const allDues = getStoredDues();
    const newDue: DueRecord = {
      id: Date.now(),
      student_id: values.student_id,
      student_name: values.student_name,
      book_title: values.book_title,
      description: `Overdue Book: ${values.book_title}`,
      amount: values.amount,
      fine_amount: values.amount,
      due_date: new Date().toISOString().split('T')[0],
      status: 'overdue',
      registered_date: new Date().toISOString().split('T')[0],
      registered_by: 'Mulugeta Yilma (Librarian)',
      payment_status: 'unpaid'
    };
    allDues.unshift(newDue);
    setStoredDues(allDues);
    message.success('Library fine record registered!');
    setIsDueModalOpen(false);
    dueForm.resetFields();
    loadData();
  };

  const filtered = forms.filter(f =>
    (f.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.id_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Student ID / Name',
      key: 'student',
      render: (_: any, record: ClearanceForm) => (
        <div>
          <Text strong>{record.full_name}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>ID: {record.id_number}</div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name'
    },
    {
      title: 'Library Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'approved_library') return <Tag color="success">Library Approved</Tag>;
        if (st === 'requires_library_payment') return <Tag color="warning">Pending Book Fine Payment</Tag>;
        return <Tag color="processing">Ready for Library Check</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClearanceForm) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
            style={{ background: '#10b981', border: 'none' }}
          >
            Approve Clearance
          </Button>
          <Button
            danger
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleRequirePayment(record)}
          >
            Issue Book Fine
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Library Clearance & Book Dues Portal</Title>
          <Text type="secondary">Verify returned textbooks, issue fines, and approve library clearance</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDueModalOpen(true)} style={{ borderRadius: 10 }}>
          Register Overdue Book Fine
        </Button>
      </div>

      <Tabs
        type="card"
        items={[
          {
            key: 'clearance',
            label: '📚 Student Library Clearance Requests',
            children: (
              <Card style={{ borderRadius: 16 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Search student..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ marginBottom: 16, borderRadius: 10, maxWidth: 400 }}
                />
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
              </Card>
            )
          },
          {
            key: 'payments',
            label: '💳 Verify Book Fine Payments',
            children: <StaffPaymentVerification />
          }
        ]}
      />

      {/* NEW DUE MODAL */}
      <Modal
        title="Register Overdue Textbook Fine"
        open={isDueModalOpen}
        onCancel={() => setIsDueModalOpen(false)}
        footer={null}
      >
        <Form form={dueForm} layout="vertical" onFinish={handleCreateDue} initialValues={{ amount: 350 }}>
          <Form.Item name="student_id" label="Student ID Number" rules={[{ required: true }]}>
            <Input placeholder="e.g. STU002" />
          </Form.Item>
          <Form.Item name="student_name" label="Student Full Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Tigist Haile" />
          </Form.Item>
          <Form.Item name="book_title" label="Unreturned Textbook Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Advanced Structural Analysis" />
          </Form.Item>
          <Form.Item name="amount" label="Fine Amount (ETB)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ height: 44, borderRadius: 10, marginTop: 12 }}>
            Register Fine
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
