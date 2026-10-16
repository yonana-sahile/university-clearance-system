import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, message } from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';

const { Title, Text } = Typography;

export default function DOPCoordinatorPage() {
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
      await apiFetch(`dopcordinator/action/${record.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Degree program curriculum & course fulfillment confirmed.',
        }),
      });
      message.success(`DOP clearance approved for ${record.full_name}!`);
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
    { title: 'Student Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Student ID', dataIndex: 'id_number', key: 'id_number' },
    { title: 'Department', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Degree Program Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (
          [
            'approved_dopcordinator',
            'approved_studentaffairs',
            'approved_dormitory',
            'Cleared by Registrar',
          ].includes(st)
        ) {
          return <Tag color="success">Curriculum Cleared</Tag>;
        }
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="warning">Pending</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ClearanceForm) => {
        if (record.status === 'approved_cooperationsharing') {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={approving === record.id}
              onClick={() => handleApprove(record)}
              style={{ background: '#10b981', border: 'none' }}
            >
              Approve Degree Program
            </Button>
          );
        }
        if (record.status === 'approved_dopcordinator') {
          return <Tag color="success">Completed</Tag>;
        }
        return <Text type="secondary" style={{ fontSize: 12 }}>Not at your stage yet</Text>;
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={2} style={{ fontWeight: 800 }}>Degree Program Coordinator Portal</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Verify program curriculum credit requirements
      </Text>
      <Card style={{ borderRadius: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search student..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400, borderRadius: 10 }}
        />
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'No students pending DOP clearance at this time.' }}
        />
      </Card>
    </div>
  );
}
