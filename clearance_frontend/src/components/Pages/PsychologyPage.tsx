import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Typography, message, Modal, Space } from 'antd';
import { CheckOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';

const { Title, Text, Paragraph } = Typography;

export default function PsychologyPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<number | null>(null);

  // ✅ NEW: Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ClearanceForm | null>(null);

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

  const handleApproveClick = (record: ClearanceForm) => {
    setSelectedForm(record);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedForm) return;
    setApproving(selectedForm.id as number);
    try {
      await apiFetch(`staff/action/${selectedForm.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Counseling & mental health clearance confirmed.',
        }),
      });
      message.success(`Counseling clearance approved for ${selectedForm.full_name}!`);
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

  const columns = [
    { title: 'Student Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Student ID', dataIndex: 'id_number', key: 'id_number' },
    { title: 'Department', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Counseling Status',
      dataIndex: 'overall_status',
      key: 'overall_status',
      render: (st: string) => {
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="warning">Pending Review</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ClearanceForm) => {
        if (record.overall_status === 'rejected' || record.overall_status === 'Cleared by Registrar') {
          return <Text type="secondary" style={{ fontSize: 12 }}>Not at your stage</Text>;
        }
        return (
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApproveClick(record)}
            style={{ background: '#10b981', border: 'none' }}
          >
            Approve Counseling
          </Button>
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={2} style={{ fontWeight: 800 }}>Student Counseling & Psychology Portal</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Verify counseling clearance for graduating students
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
          locale={{ emptyText: 'No students pending counseling clearance at this time.' }}
        />
      </Card>

      {/* ✅ NEW: CONFIRMATION MODAL */}
      <Modal
        title={<Space><CheckCircleOutlined style={{ color: '#10b981' }} /><span>Confirm Psychology Clearance</span></Space>}
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={handleConfirmApprove}
        okText="Confirm Approval"
        okButtonProps={{ style: { background: '#10b981', border: 'none' }, loading: approving === selectedForm?.id }}
      >
        <Paragraph>
          Are you sure you want to clear the counseling record for <strong>{selectedForm?.full_name}</strong>?
        </Paragraph>

        {/* ✅ SHOW STUDENT DECLARATIONS FILTERED FOR PSYCHOLOGY */}
        {(selectedForm as any)?.pre_clearance_checks && Object.keys((selectedForm as any).pre_clearance_checks).filter(k => k.startsWith('psy_') && (selectedForm as any).pre_clearance_checks[k]).length > 0 ? (
          <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 10, marginTop: 16, border: '1px solid #bbf7d0' }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: '#166534' }}>
              📋 Student Declares They Have Completed:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#15803d' }}>
              {Object.keys((selectedForm as any).pre_clearance_checks)
                .filter(k => k.startsWith('psy_') && (selectedForm as any).pre_clearance_checks[k])
                .map((key) => (
                  <li key={key}>✅ {key.replace('psy_', '').replace(/_/g, ' ').toUpperCase()}</li>
                ))}
            </ul>
          </div>
        ) : (
          <div style={{ background: '#fffbeb', padding: 16, borderRadius: 10, marginTop: 16, border: '1px solid #fde68a' }}>
            <Text strong style={{ color: '#b45309' }}>⚠️ Student did not make any Psychology declarations.</Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
