import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Typography, Input, Space, message, Select, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined, DollarOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import type { PaymentRecord } from '../../types';

const { Title, Text, Paragraph } = Typography;

export default function StaffPaymentVerification() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('payment/pending/');
      setPayments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (record: PaymentRecord) => {
    try {
      await apiFetch(`payment/verify/${record.id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      message.success(`Payment transaction ${record.transaction_id} verified & approved!`);
      loadPayments();
      setSelectedPayment(null);
    } catch (err) {
      message.error('Verification failed.');
    }
  };

  const handleReject = async (record: PaymentRecord) => {
    try {
      await apiFetch(`payment/verify/${record.id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectionReason })
      });
      message.warning(`Payment ${record.transaction_id} rejected.`);
      loadPayments();
      setSelectedPayment(null);
    } catch (err) {
      message.error('Rejection failed.');
    }
  };

  const filtered = payments.filter(p =>
    (p.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.student_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.transaction_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
      render: (txt: string, record: PaymentRecord) => (
        <div>
          <Text strong>{txt}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>ID: {record.student_id}</div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department_type',
      key: 'department_type',
      render: (d: string) => <Tag color="purple">{d?.toUpperCase()}</Tag>
    },
    {
      title: 'Transaction Ref',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (t: string) => <Text code>{t}</Text>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt: number) => <Text strong style={{ color: '#10b981' }}>{amt} ETB</Text>
    },
    {
      title: 'Date Submitted',
      dataIndex: 'payment_date',
      key: 'payment_date'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PaymentRecord) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
            style={{ background: '#10b981', border: 'none' }}
          >
            Approve Receipt
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => setSelectedPayment(record)}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <DollarOutlined style={{ color: '#10b981' }} />
          <span>Pending Student Payment Receipts Verification Queue</span>
        </Space>
      }
      style={{ borderRadius: 16 }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        placeholder="Search by student name, student ID, or transaction reference..."
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
      />

      {/* REJECT MODAL */}
      <Modal
        title="Reject Payment Receipt"
        open={!!selectedPayment}
        onCancel={() => setSelectedPayment(null)}
        onOk={() => selectedPayment && handleReject(selectedPayment)}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>Please state the reason for rejecting this payment receipt:</Paragraph>
        <Input.TextArea
          rows={3}
          value={rejectionReason}
          onChange={e => setRejectionReason(e.target.value)}
          placeholder="e.g. Invalid reference number, transaction amount mismatch..."
        />
      </Modal>
    </Card>
  );
}
