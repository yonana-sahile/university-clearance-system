import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, Row, Col, Statistic, message } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';

const { Title, Text } = Typography;

export default function RegistrarPage() {
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

  const handleFinalClearance = async (record: ClearanceForm) => {
    setApproving(record.id as number);
    try {
      await apiFetch(`registrar/action/${record.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Final clearance verified across all 11 campus offices. Official certificate issued.',
        }),
      });
      message.success(
        `Official Digital Clearance Certificate issued for ${record.full_name}!`
      );
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

  const readyForRegistrarCount = forms.filter(
    f => f.status === 'approved_dormitory'
  ).length;
  const clearedCount = forms.filter(
    f => f.status === 'Cleared by Registrar'
  ).length;

  const columns = [
    { title: 'Student Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Student ID', dataIndex: 'id_number', key: 'id_number' },
    { title: 'Department', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Current Stage',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'Cleared by Registrar')
          return <Tag color="success">🎉 Cleared by Registrar</Tag>;
        if (st === 'approved_dormitory')
          return <Tag color="gold">⚡ Ready for Registrar Final Seal</Tag>;
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return (
          <Tag color="processing">
            {st.replace(/_/g, ' ').toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ClearanceForm) => {
        if (record.status === 'approved_dormitory') {
          return (
            <Button
              type="primary"
              size="small"
              icon={<SafetyCertificateOutlined />}
              loading={approving === record.id}
              onClick={() => handleFinalClearance(record)}
              style={{
                background:
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none'
              }}
            >
              Issue Final Clearance
            </Button>
          );
        }
        if (record.status === 'Cleared by Registrar') {
          return <Tag color="success">Certificate Issued</Tag>;
        }
        return (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Not at your stage yet
          </Text>
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
          University Registrar Office Portal
        </Title>
        <Text type="secondary">
          Final clearance verification, completion rate metrics, and official
          digital certificate issuance
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic
              title="Total Clearance Requests"
              value={forms.length}
              styles={{ content: { color: '#2563eb', fontWeight: 800 } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic
              title="Ready for Registrar Seal"
              value={readyForRegistrarCount}
              styles={{ content: { color: '#f59e0b', fontWeight: 800 } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic
              title="Graduates Cleared"
              value={clearedCount}
              styles={{ content: { color: '#10b981', fontWeight: 800 } }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search student by name or ID..."
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
          locale={{
            emptyText:
              'No students pending registrar clearance at this time.'
          }}
        />
      </Card>
    </div>
  );
}
