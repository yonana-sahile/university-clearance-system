import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, Row, Col, Statistic, message, Modal, Space } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StaffChecklistManager from '../Staff/StaffChecklistManager'; // ✅ NEW

const { Title, Text, Paragraph } = Typography;

export default function RegistrarPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<number | null>(null);

  // ✅ NEW: State to hold dynamic checklist items
  const [staffChecklist, setStaffChecklist] = useState<any[]>([]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ClearanceForm | null>(null);

  useEffect(() => {
    loadData();
    loadStaffChecklist();
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

  const loadStaffChecklist = async () => {
    try {
      const data = await apiFetch('staff/checklist');
      setStaffChecklist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load checklist', err);
    }
  };

  const handleFinalClearanceClick = (record: ClearanceForm) => {
    setSelectedForm(record);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmFinalClearance = async () => {
    if (!selectedForm) return;
    setApproving(selectedForm.id as number);
    try {
      await apiFetch(`staff/action/${selectedForm.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Final clearance verified across all campus offices. Official certificate issued.',
        }),
      });
      message.success(`Official Digital Clearance Certificate issued for ${selectedForm.full_name}!`);
      setIsConfirmModalOpen(false);
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

  const readyForRegistrarCount = forms.filter(f => f.overall_status !== 'rejected').length;
  const clearedCount = forms.filter(f => f.overall_status === 'Cleared by Registrar').length;

  const columns = [
    { title: 'Student Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Student ID', dataIndex: 'id_number', key: 'id_number' },
    { title: 'Department', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Current Stage',
      dataIndex: 'overall_status',
      key: 'overall_status',
      render: (st: string) => {
        if (st === 'Cleared by Registrar') return <Tag color="success">🎉 Cleared by Registrar</Tag>;
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="gold">⚡ Ready for Registrar Final Seal</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ClearanceForm) => {
        if (record.overall_status === 'Cleared by Registrar') {
          return <Tag color="success">Certificate Issued</Tag>;
        }
        if (record.overall_status === 'rejected') {
          return <Text type="secondary" style={{ fontSize: 12 }}>Rejected</Text>;
        }
        return (
          <Button
            type="primary"
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => handleFinalClearanceClick(record)}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
          >
            Issue Final Clearance
          </Button>
        );
      }
    }
  ];

  // ✅ Helper to render student declarations dynamically
  const renderStudentDeclarations = (form: ClearanceForm | null) => {
    if (!form) return null;
    const checks = (form as any)?.pre_clearance_checks || {};

    const myCheckedItems = staffChecklist.filter(item => checks[`item_${item.id}`]);
    const legacyChecked = Object.keys(checks).filter(k => k.startsWith('reg_') && checks[k]);

    if (myCheckedItems.length === 0 && legacyChecked.length === 0) {
      return (
        <div style={{ background: '#fffbeb', padding: 16, borderRadius: 10, marginTop: 16, border: '1px solid #fde68a' }}>
          <Text strong style={{ color: '#b45309' }}>⚠️ Student did not make any Registrar declarations.</Text>
        </div>
      );
    }

    return (
      <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 10, marginTop: 16, border: '1px solid #bbf7d0' }}>
        <Text strong style={{ display: 'block', marginBottom: 8, color: '#166534' }}>
          📋 Student Declares They Have Completed:
        </Text>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#15803d' }}>
          {myCheckedItems.map(item => (
            <li key={item.id}>✅ {item.label}</li>
          ))}
          {legacyChecked.map(key => (
            <li key={key}>✅ {key.replace('reg_', '').replace(/_/g, ' ').toUpperCase()}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>University Registrar Office Portal</Title>
        <Text type="secondary">Final clearance verification, completion rate metrics, and official digital certificate issuance</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Total Clearance Requests" value={forms.length} styles={{ content: { color: '#2563eb', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Ready for Registrar Seal" value={readyForRegistrarCount} styles={{ content: { color: '#f59e0b', fontWeight: 800 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { textAlign: 'center' } }}>
            <Statistic title="Graduates Cleared (In Queue)" value={clearedCount} styles={{ content: { color: '#10b981', fontWeight: 800 } }} />
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
          locale={{ emptyText: 'No students pending registrar clearance at this time.' }}
        />
      </Card>

      <Modal
        title={<Space><SafetyCertificateOutlined style={{ color: '#10b981' }} /><span>Confirm Final Registrar Clearance</span></Space>}
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={handleConfirmFinalClearance}
        okText="Issue Certificate"
        okButtonProps={{ style: { background: '#10b981', border: 'none' }, loading: approving === selectedForm?.id }}
      >
        <Paragraph>
          Are you sure you want to issue the final clearance certificate for <strong>{selectedForm?.full_name}</strong>?
        </Paragraph>

        {renderStudentDeclarations(selectedForm)}
      </Modal>

      {/* ✅ NEW: STAFF CHECKLIST MANAGER */}
      <StaffChecklistManager />
    </div>
  );
}
