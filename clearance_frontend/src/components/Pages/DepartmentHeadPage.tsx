import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Modal, Typography, Space, Row, Col,
  Statistic, message, Tabs, Form
} from 'antd';
import {
  CheckOutlined, CloseOutlined, SearchOutlined, DownloadOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';

const { Title, Text, Paragraph } = Typography;

export default function DepartmentHeadPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState<ClearanceForm | null>(null);
  const [noteText, setNoteText] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('forms');
      setForms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (form: ClearanceForm, type: 'approve' | 'reject') => {
    setSelectedForm(form);
    setActionType(type);
    setNoteText(
      type === 'approve'
        ? 'Academic senior thesis and requirements verified.'
        : 'Missing required course credits.'
    );
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedForm) return;
    try {
      await apiFetch(`departmenthead/action/${selectedForm.id}`, {
        method: 'POST',
        body: JSON.stringify({ action: actionType, note: noteText }),
      });
      message.success(`Form ${actionType}d successfully!`);
      setIsModalOpen(false);
      loadForms();
    } catch (err: any) {
      message.error(err.message || 'Action failed');
    }
  };

  const exportCSV = () => {
    const headers = ['Form ID', 'Student Name', 'ID Number', 'Department', 'Status', 'Date'];
    const rows = forms.map(f => [f.id, f.full_name, f.id_number, f.department_name, f.status, f.created_at]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dept_Head_Clearance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filtered = forms.filter(f =>
    (f.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.id_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = forms.filter(f => f.status === 'pending_department').length;
  const approvedCount = forms.filter(f => f.status !== 'pending_department' && f.status !== 'rejected').length;

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
      title: 'Program / Year',
      key: 'program',
      render: (_: any, record: ClearanceForm) => (
        <div>
          <Text style={{ fontSize: 12 }}>{record.program_level}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.year} • {record.enrollment_type}</div>
        </div>
      )
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (r: string) => <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>{r}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'pending_department') return <Tag color="warning">Pending Review</Tag>;
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="success">Approved by Dept</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClearanceForm) => (
        <Space>
          {record.status === 'pending_department' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleActionClick(record, 'approve')}
                style={{ background: '#10b981', border: 'none' }}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleActionClick(record, 'reject')}
              >
                Reject
              </Button>
            </>
          )}
          {record.status !== 'pending_department' && record.status !== 'rejected' && (
            <Tag color="success">Completed</Tag>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Department Head Clearance Portal</Title>
          <Text type="secondary">Review senior thesis, academic grades, and approve student clearance requests</Text>
        </div>
        <Button icon={<DownloadOutlined />} onClick={exportCSV} style={{ borderRadius: 10 }}>
          Export CSV Report
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic
              title="Total Submissions"
              value={forms.length}
              styles={{ content: { color: '#2563eb', fontWeight: 800 } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic
              title="Pending Dept Review"
              value={pendingCount}
              styles={{ content: { color: '#f59e0b', fontWeight: 800 } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic
              title="Dept Cleared"
              value={approvedCount}
              styles={{ content: { color: '#10b981', fontWeight: 800 } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        type="card"
        items={[
          {
            key: 'clearance',
            label: `📋 Clearance Applications (${pendingCount} Pending)`,
            children: (
              <Card style={{ borderRadius: 16 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Search student by name or ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ marginBottom: 16, borderRadius: 10, maxWidth: 400 }}
                />
                <Table
                  columns={columns}
                  dataSource={filtered}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'No clearance applications pending at your stage.' }}
                />
              </Card>
            )
          },
          {
            key: 'payments',
            label: '💳 Department Payment Receipts',
            children: <StaffPaymentVerification />
          }
        ]}
      />

      <Modal
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Clearance Request`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleConfirmAction}
        okText={`Confirm ${actionType}`}
        okButtonProps={{
          danger: actionType === 'reject',
          style: actionType === 'approve' ? { background: '#10b981', border: 'none' } : {}
        }}
      >
        <Paragraph>
          Student: <strong>{selectedForm?.full_name}</strong> ({selectedForm?.id_number})
        </Paragraph>
        <Form.Item label="Officer Feedback Note">
          <Input.TextArea
            rows={3}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Enter feedback or clearance confirmation..."
          />
        </Form.Item>
      </Modal>
    </div>
  );
}
