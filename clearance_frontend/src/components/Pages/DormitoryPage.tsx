import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Modal, Typography, Space, Row, Col, Select, Checkbox, message, Tabs
} from 'antd';
import { CheckOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm, Building } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';

const { Title, Text, Paragraph } = Typography;

export default function DormitoryPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<number | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [inspectForm, setInspectForm] = useState<ClearanceForm | null>(null);
  const [damageItems, setDamageItems] = useState<string[]>([]);
  const [damageFine, setDamageFine] = useState(1500);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsData, buildingsData] = await Promise.all([
        apiFetch('forms'),
        apiFetch('buildings').catch(() => ({ buildings: [] })),
      ]);
      setForms(Array.isArray(formsData) ? formsData : []);
      const bList = buildingsData?.buildings || [];
      setBuildings(Array.isArray(bList) ? bList : []);
    } catch (err: any) {
      message.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDorm = async (record: ClearanceForm) => {
    setApproving(record.id as number);
    try {
      await apiFetch(`dormitory/action/${record.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Room inspected. Key returned, zero room property damage.',
        }),
      });
      message.success(`Dormitory clearance approved for ${record.full_name}!`);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  const handleIssueDamageFine = () => {
    // Backend endpoint for damage fines not yet implemented.
    // Showing informational message instead of the previous localStorage hack.
    message.info('Room damage fine issuance requires backend support.');
    setIsInspectModalOpen(false);
  };

  const filtered = forms.filter(f => {
    const matchesSearch =
      (f.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.id_number || '').toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = !selectedBuilding || f.building?.id === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

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
      title: 'Assigned Dorm Block',
      key: 'building',
      render: (_: any, record: ClearanceForm) => (
        <Tag color="blue">{record.building?.name || 'Block A (Male)'}</Tag>
      )
    },
    {
      title: 'Dorm Clearance',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (['approved_dormitory', 'Cleared by Registrar'].includes(st)) {
          return <Tag color="success">Dorm Cleared</Tag>;
        }
        if (st === 'requires_dormitory_payment') {
          return <Tag color="warning">Pending Damage Fine Payment</Tag>;
        }
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="processing">Ready for Inspection</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClearanceForm) => {
        if (record.status === 'approved_studentaffairs') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                loading={approving === record.id}
                onClick={() => handleApproveDorm(record)}
                style={{ background: '#10b981', border: 'none' }}
              >
                Clear Room
              </Button>
              <Button
                danger
                size="small"
                icon={<ToolOutlined />}
                onClick={() => {
                  setInspectForm(record);
                  setIsInspectModalOpen(true);
                }}
              >
                Inspect Room Damage
              </Button>
            </Space>
          );
        }
        if (record.status === 'approved_dormitory') {
          return <Tag color="success">Completed</Tag>;
        }
        return <Text type="secondary" style={{ fontSize: 12 }}>Not at your stage yet</Text>;
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Dormitory Room Inspection & Clearance</Title>
        <Text type="secondary">
          Inspect residence room items, keys, furniture condition, and manage room damage dues
        </Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ borderRadius: 10 }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            placeholder="Filter by Dormitory Block"
            allowClear
            onChange={val => setSelectedBuilding(val)}
            options={buildings.map(b => ({ label: b.name, value: b.id }))}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>

      <Tabs
        type="card"
        items={[
          {
            key: 'clearance',
            label: '🏠 Room Clearance Queue',
            children: (
              <Card style={{ borderRadius: 16 }}>
                <Table
                  columns={columns}
                  dataSource={filtered}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'No students pending dormitory clearance at this time.' }}
                />
              </Card>
            )
          },
          {
            key: 'payments',
            label: '💳 Verify Room Damage Payments',
            children: <StaffPaymentVerification />
          }
        ]}
      />

      {/* INSPECTION MODAL */}
      <Modal
        title={`Room Property Inspection: ${inspectForm?.full_name}`}
        open={isInspectModalOpen}
        onCancel={() => setIsInspectModalOpen(false)}
        onOk={handleIssueDamageFine}
        okText="Issue Damage Fine"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>Check any damaged or missing room items:</Paragraph>
        <Checkbox.Group
          onChange={(checked) => setDamageItems(checked as string[])}
          style={{ width: '100%' }}
        >
          <Row gutter={[8, 12]}>
            <Col span={12}><Checkbox value="Room Key">Room Key</Checkbox></Col>
            <Col span={12}><Checkbox value="Door Lock">Door / Lock</Checkbox></Col>
            <Col span={12}><Checkbox value="Bed Frame">Bed Frame</Checkbox></Col>
            <Col span={12}><Checkbox value="Mattress">Mattress</Checkbox></Col>
            <Col span={12}><Checkbox value="Study Desk">Study Desk</Checkbox></Col>
            <Col span={12}><Checkbox value="Locker">Locker / Cupboard</Checkbox></Col>
            <Col span={12}><Checkbox value="Window Glass">Window Glass</Checkbox></Col>
            <Col span={12}><Checkbox value="Plumbing Fixture">Plumbing / Tap</Checkbox></Col>
          </Row>
        </Checkbox.Group>

        <div style={{ marginTop: 20 }}>
          <Text strong>Calculated Fine Amount (ETB):</Text>
          <Input
            value={damageFine}
            onChange={e => setDamageFine(Number(e.target.value))}
            style={{ marginTop: 6, borderRadius: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
}
