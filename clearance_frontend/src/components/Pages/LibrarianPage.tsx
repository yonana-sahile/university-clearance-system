import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, Typography, message, Tabs, Modal, Space, Row, Col, Checkbox
} from 'antd';
import { CheckOutlined, SearchOutlined, WarningOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { ClearanceForm } from '../../types';
import StaffPaymentVerification from '../Payments/StaffPaymentVerification';
import StaffChecklistManager from '../Staff/StaffChecklistManager'; // ✅ NEW

const { Title, Text, Paragraph } = Typography;

export default function LibrarianPage() {
  const [forms, setForms] = useState<ClearanceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState<number | null>(null);

  // ✅ NEW: State to hold dynamic checklist items
  const [staffChecklist, setStaffChecklist] = useState<any[]>([]);

  // ✅ Approve Confirmation Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveForm, setApproveForm] = useState<ClearanceForm | null>(null);

  // ✅ Inspection Modal State
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [inspectForm, setInspectForm] = useState<ClearanceForm | null>(null);
  const [libraryIssues, setLibraryIssues] = useState<string[]>([]);
  const [fineAmount, setFineAmount] = useState(500);

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

  // ✅ 1. Approve if everything is clean
  const handleApproveClick = (record: ClearanceForm) => {
    setApproveForm(record);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveForm) return;
    setApproving(approveForm.id as number);
    try {
      await apiFetch(`staff/action/${approveForm.id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approve',
          note: 'Library account clear. All books returned, zero outstanding fines.',
        }),
      });
      message.success(`Library clearance approved for ${approveForm.full_name}!`);
      setIsApproveModalOpen(false);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  // ✅ 2. Issue fine/reject
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
              onClick={() => handleApproveClick(record)}
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

  // ✅ Helper to render student declarations dynamically
  const renderStudentDeclarations = (form: ClearanceForm | null) => {
    if (!form) return null;
    const checks = (form as any)?.pre_clearance_checks || {};

    // Check dynamic items
    const myCheckedItems = staffChecklist.filter(item => checks[`item_${item.id}`]);
    // Check legacy items
    const legacyChecked = Object.keys(checks).filter(k => k.startsWith('lib_') && checks[k]);

    if (myCheckedItems.length === 0 && legacyChecked.length === 0) {
      return (
        <div style={{ background: '#fffbeb', padding: 16, borderRadius: 10, marginTop: 16, border: '1px solid #fde68a' }}>
          <Text strong style={{ color: '#b45309' }}>⚠️ Student did not make any library declarations.</Text>
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
            <li key={key}>✅ {key.replace('lib_', '').replace(/_/g, ' ').toUpperCase()}</li>
          ))}
        </ul>
      </div>
    );
  };

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

      {/* ✅ NEW: APPROVE CONFIRMATION MODAL */}
      <Modal
        title={<Space><CheckCircleOutlined style={{ color: '#10b981' }} /><span>Confirm Library Clearance</span></Space>}
        open={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        onOk={handleConfirmApprove}
        okText="Confirm Approval"
        okButtonProps={{ style: { background: '#10b981', border: 'none' }, loading: approving === approveForm?.id }}
      >
        <Paragraph>
          Are you sure you want to clear the library record for <strong>{approveForm?.full_name}</strong>?
        </Paragraph>
        {renderStudentDeclarations(approveForm)}
      </Modal>

      {/* ✅ FUNCTIONAL INSPECTION MODAL */}
      <Modal
        title={<Space><BookOutlined style={{ color: '#2563eb' }} /><span>Library Inspection: {inspectForm?.full_name}</span></Space>}
        open={isInspectModalOpen}
        onCancel={() => setIsInspectModalOpen(false)}
        onOk={handleIssueLibraryFine}
        okText="Issue Fine & Reject Form"
        okButtonProps={{ danger: true, loading: approving === inspectForm?.id }}
      >
        <Paragraph type="secondary">
          Check any unreturned items or unpaid fines. Submitting this will reject the student's clearance and require them to pay the fine before resubmitting.
        </Paragraph>

        {renderStudentDeclarations(inspectForm)}

        <Checkbox.Group
          onChange={(checked) => setLibraryIssues(checked as string[])}
          value={libraryIssues}
          style={{ width: '100%', marginTop: 16 }}
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

      {/* ✅ NEW: STAFF CHECKLIST MANAGER */}
      <StaffChecklistManager />
    </div>
  );
}
