import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Typography, message, Tabs, Modal, Space, Row, Col, Checkbox
} from 'antd';
import { CheckOutlined, SearchOutlined, WarningOutlined, BookOutlined, ToolOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';

const { Title, Text, Paragraph } = Typography;

export default function LibrarianPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<number | null>(null);

  // ✅ NEW: Inspection Modal State
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [inspectForm, setInspectForm] = useState<ClearanceForm | null>(null);
  const [libraryIssues, setLibraryIssues] = useState<string[]>([]);
  const [fineAmount, setFineAmount] = useState(500); // Default fine

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

  // ✅ 1. Approve if everything is clean
  const handleApprove = async (record: ClearanceForm) => {
    setApproving(record.id as number);
    try {
      await apiFetch(`staff/action/${record.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Library account clear. All books returned, zero outstanding fines.',
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

  // ✅ 2. Issue fine/reject if there are unreturned books or unpaid fines
  const handleIssueLibraryFine = async () => {
    if (!inspectForm) return;

    if (libraryIssues.length === 0) {
      message.warning('Please select at least one library issue.');
      return;
    }

    setApproving(inspectForm.id as number);
    try {
      const noteText = `Library Inspection Failed. Issues: ${libraryIssues.join(', ')}. Total Fine: ${fineAmount} ETB. Please clear your library dues and resubmit.`;

      await apiFetch(`staff/action/${inspectForm.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'reject',
          note: noteText,
        }),
      });

      message.success(`Library fine of ${fineAmount} ETB issued to ${inspectForm.full_name}. Form rejected for resubmission.`);
      setIsInspectModalOpen(false);
      setLibraryIssues([]);
      setFineAmount(500);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to issue fine');
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
      dataIndex: 'overall_status',
      key: 'overall_status',
      render: (st: string) => {
        if (st === 'rejected') return <Tag color="error">Rejected / Resubmit</Tag>;
        if (st === 'requires_payment') return <Tag color="warning">Pending Book Fine Payment</Tag>;
        return <Tag color="processing">Ready for Library Check</Tag>;
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
              onClick={() => handleApprove(record)}
              style={{ background: '#10b981', border: 'none' }}
            >
              Clear Library Record
            </Button>
            <Button
              danger
              size="small"
              icon={<WarningOutlined />}
              onClick={() => {
                setInspectForm(record);
                setLibraryIssues([]);
                setFineAmount(500);
                setIsInspectModalOpen(true);
              }}
            >
              Issue Fine / Missing Book
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Library Clearance & Book Dues Portal</Title>
        <Text type="secondary">Verify returned textbooks, check for unpaid fines, and approve library clearance</Text>
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

      {/* ✅ NEW: FUNCTIONAL LIBRARY INSPECTION MODAL */}
      <Modal
        title={
          <Space>
            <BookOutlined style={{ color: '#2563eb' }} />
            <span>Library Inspection: {inspectForm?.full_name}</span>
          </Space>
        }
        open={isInspectModalOpen}
        onCancel={() => setIsInspectModalOpen(false)}
        onOk={handleIssueLibraryFine}
        okText="Issue Fine & Reject Form"
        okButtonProps={{ danger: true, loading: approving === inspectForm?.id }}
      >
        <Paragraph type="secondary">
          Check any unreturned items or unpaid fines. Submitting this will reject the student's clearance and require them to pay the fine before resubmitting.
        </Paragraph>

        <Checkbox.Group
          onChange={(checked) => setLibraryIssues(checked as string[])}
          value={libraryIssues}
          style={{ width: '100%' }}
        >
          <Row gutter={[8, 12]}>
            <Col span={12}><Checkbox value="Unreturned Book(s)">📚 Unreturned Book(s)</Checkbox></Col>
            <Col span={12}><Checkbox value="Overdue Fine">💸 Unpaid Overdue Fine</Checkbox></Col>
            <Col span={12}><Checkbox value="Damaged Book">💳 Damaged Book</Checkbox></Col>
            <Col span={12}><Checkbox value="Library Card">🪪 Library Card Not Returned</Checkbox></Col>
          </Row>
        </Checkbox.Group>

        <div style={{ marginTop: 24 }}>
          <Text strong>Calculated Fine Amount (ETB):</Text>
          <Input
            type="number"
            value={fineAmount}
            onChange={e => setFineAmount(Number(e.target.value))}
            style={{ marginTop: 6, borderRadius: 8, fontSize: 18, fontWeight: 700, color: '#dc2626' }}
            prefix="ETB"
          />
        </div>
      </Modal>
    </div>
  );
}
