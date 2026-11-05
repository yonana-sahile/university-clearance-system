import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Modal, Typography, Space, Row, Col, Select, Checkbox, message, Tabs
} from 'antd';
import { CheckOutlined, SearchOutlined, ToolOutlined, WarningOutlined } from '@ant-design/icons';
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
      await apiFetch(`staff/action/${record.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Room inspected. Key returned successfully. Zero room property damage.',
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

  const handleIssueDamageFine = async () => {
    if (!inspectForm) return;

    if (damageItems.length === 0) {
      message.warning('Please select at least one damaged item.');
      return;
    }

    setApproving(inspectForm.id as number);
    try {
      const noteText = `Dormitory Inspection Failed. Damaged/Missing Items: ${damageItems.join(', ')}. Total Fine: ${damageFine} ETB. Please clear your dues at the finance office and resubmit.`;

      await apiFetch(`staff/action/${inspectForm.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'reject',
          note: noteText,
        }),
      });

      message.success(`Damage fine of ${damageFine} ETB issued to ${inspectForm.full_name}. Form rejected for resubmission.`);
      setIsInspectModalOpen(false);
      setDamageItems([]);
      setDamageFine(1500);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to issue fine');
    } finally {
      setApproving(null);
    }
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
      dataIndex: 'overall_status',
      key: 'overall_status',
      render: (st: string) => {
        if (st === 'rejected') return <Tag color="error">Rejected / Resubmit</Tag>;
        if (st === 'requires_payment') return <Tag color="warning">Pending Payment</Tag>;
        return <Tag color="processing">Ready for Inspection</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClearanceForm) => {
        if (record.overall_status === 'rejected' || record.overall_status === 'Cleared by Registrar') {
          return <Text type="secondary" style={{ fontSize: 12 }}>Not at your stage</Text>;
        }

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
              Clear Room (No Damage)
            </Button>
            <Button
              danger
              size="small"
              icon={<ToolOutlined />}
              onClick={() => {
                setInspectForm(record);
                setDamageItems([]);
                setDamageFine(1500);
                setIsInspectModalOpen(true);
              }}
            >
              Inspect Damage
            </Button>
          </Space>
        );
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

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ef4444' }} />
            <span>Room Inspection: {inspectForm?.full_name}</span>
          </Space>
        }
        open={isInspectModalOpen}
        onCancel={() => setIsInspectModalOpen(false)}
        onOk={handleIssueDamageFine}
        okText="Issue Fine & Reject Form"
        okButtonProps={{ danger: true, loading: approving === inspectForm?.id }}
      >
        <Paragraph type="secondary">
          Check any damaged or missing room items. Submitting this will reject the student's clearance and require them to pay the fine before resubmitting.
        </Paragraph>

        {/* ✅ NEW: SHOW STUDENT DECLARATIONS FILTERED FOR DORMITORY */}
        {(inspectForm as any)?.pre_clearance_checks && Object.keys((inspectForm as any).pre_clearance_checks).filter(k => k.startsWith('dorm_') && (inspectForm as any).pre_clearance_checks[k]).length > 0 && (
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
            <Text strong style={{ fontSize: 13, color: '#1e3a8a', display: 'block', marginBottom: 4 }}>
              Student Declares:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#475569' }}>
              {Object.keys((inspectForm as any).pre_clearance_checks)
                .filter(k => k.startsWith('dorm_') && (inspectForm as any).pre_clearance_checks[k])
                .map((key) => (
                  <li key={key}>✅ {key.replace('dorm_', '').replace(/_/g, ' ').toUpperCase()}</li>
                ))}
            </ul>
          </div>
        )}

        <Checkbox.Group
          onChange={(checked) => setDamageItems(checked as string[])}
          value={damageItems}
          style={{ width: '100%' }}
        >
          <Row gutter={[8, 12]}>
            <Col span={12}><Checkbox value="Room Key">🔑 Room Key Not Returned</Checkbox></Col>
            <Col span={12}><Checkbox value="Door Lock">🚪 Door / Lock Broken</Checkbox></Col>
            <Col span={12}><Checkbox value="Bed Frame">🛏️ Bed Frame Broken</Checkbox></Col>
            <Col span={12}><Checkbox value="Mattress">🛌 Mattress Damaged/Lost</Checkbox></Col>
            <Col span={12}><Checkbox value="Study Desk">🪑 Study Desk Damaged</Checkbox></Col>
            <Col span={12}><Checkbox value="Locker">🗄️ Locker / Cupboard Broken</Checkbox></Col>
            <Col span={12}><Checkbox value="Window Glass">🪟 Window Glass Broken</Checkbox></Col>
            <Col span={12}><Checkbox value="Plumbing Fixture">🚿 Plumbing / Tap Broken</Checkbox></Col>
          </Row>
        </Checkbox.Group>

        <div style={{ marginTop: 24 }}>
          <Text strong>Calculated Fine Amount (ETB):</Text>
          <Input
            type="number"
            value={damageFine}
            onChange={e => setDamageFine(Number(e.target.value))}
            style={{ marginTop: 6, borderRadius: 8, fontSize: 18, fontWeight: 700, color: '#dc2626' }}
            prefix="ETB"
          />
        </div>
      </Modal>
    </div>
  );
}
