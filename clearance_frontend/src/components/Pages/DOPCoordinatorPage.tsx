import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, message } from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { getStoredForms, setStoredForms } from '../../utils/api';
import type { ClearanceForm } from '../../types';

const { Title, Text } = Typography;

export default function DOPCoordinatorPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setLoading(true);
    setForms(getStoredForms());
    setLoading(false);
  };

  const handleApprove = (record: ClearanceForm) => {
    const all = getStoredForms();
    const idx = all.findIndex(f => f.id === record.id);
    if (idx !== -1) {
      all[idx].status = 'approved_dopcordinator';
      all[idx].dopcordinator_note = 'Degree program curriculum & course fulfillment confirmed.';
      setStoredForms(all);
    }
    message.success(`DOP clearance approved for ${record.full_name}!`);
    loadData();
  };

  const filtered = forms.filter(f => (f.full_name || '').toLowerCase().includes(search.toLowerCase()) || (f.id_number || '').toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: 'Student Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Student ID', dataIndex: 'id_number', key: 'id_number' },
    { title: 'Department', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Degree Program Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => ['approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(st) ? <Tag color="success">Curriculum Cleared</Tag> : <Tag color="warning">Pending</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ClearanceForm) => (
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)} style={{ background: '#10b981', border: 'none' }}>
          Approve Degree Program
        </Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={2} style={{ fontWeight: 800 }}>Degree Program Coordinator Portal</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>Verify program curriculum credit requirements</Text>
      <Card style={{ borderRadius: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16, maxWidth: 400, borderRadius: 10 }} />
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
      </Card>
    </div>
  );
}
