import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, Space, message, Tabs } from 'antd';
import { CheckOutlined, DollarOutlined, SearchOutlined, CoffeeOutlined } from '@ant-design/icons';
import { getStoredForms, setStoredForms } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';

const { Title, Text } = Typography;

export default function CafeteriaPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setForms(getStoredForms());
    setLoading(false);
  };

  const handleApprove = (record: ClearanceForm) => {
    const all = getStoredForms();
    const idx = all.findIndex(f => f.id === record.id);
    if (idx !== -1) {
      all[idx].status = 'approved_cafeteria';
      all[idx].cafeteria_note = 'Meal ticket returned. Zero cafeteria dues.';
      all[idx].cafeteria_approved_by = 'Getachew Belay (Cafeteria Manager)';
      setStoredForms(all);
    }
    message.success(`Cafeteria clearance approved for ${record.full_name}!`);
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
      title: 'Cafeteria Clearance',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (['approved_cafeteria', 'approved_psychology', 'approved_sportmaster', 'approved_dormitory', 'Cleared by Registrar'].includes(st)) {
          return <Tag color="success">Cafeteria Approved</Tag>;
        }
        return <Tag color="processing">Awaiting Cafeteria Review</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClearanceForm) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => handleApprove(record)}
          style={{ background: '#10b981', border: 'none' }}
        >
          Clear Cafeteria Status
        </Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Cafeteria Meal Plan Clearance</Title>
        <Text type="secondary">Verify meal ticket submission and clear student cafeteria records</Text>
      </div>

      <Tabs
        type="card"
        items={[
          {
            key: 'clearance',
            label: '🍽️ Student Cafeteria Clearance Requests',
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
            label: '💳 Verify Cafeteria Dues Payments',
            children: <StaffPaymentVerification />
          }
        ]}
      />
    </div>
  );
}
