import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, message, Tabs } from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';

const { Title, Text } = Typography;

export default function LibrarianPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  const handleApprove = async (record: ClearanceForm) => {
    setApproving(record.id as number);
    try {
      await apiFetch(`librarian/action/${record.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Library account clear. Zero unreturned literature.',
        }),
      });
      message.success(`Library clearance approved for ${record.full_name}!`);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
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
        if (
          [
            'approved_library',
            'approved_cafeteria',
            'approved_psychology',
            'approved_sportmaster',
            'approved_campuspolice',
            'approved_cooperationsharing',
            'approved_dopcordinator',
            'approved_studentaffairs',
            'approved_dormitory',
            'Cleared by Registrar',
          ].includes(st)
        ) {
          return <Tag color="success">Library Approved</Tag>;
        }
        if (st === 'requires_library_payment') {
          return <Tag color="warning">Pending Book Fine Payment</Tag>;
        }
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="processing">Ready for Library Check</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClearanceForm) => {
        if (record.status === 'approved_department') {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={approving === record.id}
              onClick={() => handleApprove(record)}
              style={{ background: '#10b981', border: 'none' }}
            >
              Approve Clearance
            </Button>
          );
        }
        if (record.status === 'approved_library') {
          return <Tag color="success">Completed</Tag>;
        }
        return <Text type="secondary" style={{ fontSize: 12 }}>Not at your stage yet</Text>;
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Library Clearance & Book Dues Portal</Title>
        <Text type="secondary">Verify returned textbooks and approve library clearance</Text>
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
                <Table
                  columns={columns}
                  dataSource={filtered}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'No students pending library clearance at this time.' }}
                />
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
    </div>
  );
}
