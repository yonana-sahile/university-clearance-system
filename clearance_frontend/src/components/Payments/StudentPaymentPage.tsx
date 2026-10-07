import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Form, Input, Button, Select, Table, Tag, Alert, Upload, message, Space, Modal
} from 'antd';
import {
  DollarOutlined, CopyOutlined, UploadOutlined, CheckCircleOutlined, ClockCircleOutlined, CreditCardOutlined
} from '@ant-design/icons';
import { apiFetch, getSession, getStoredPaymentMethods } from '../../utils/api';
import type { PaymentMethod, PaymentRecord } from '../../types';

const { Title, Text, Paragraph } = Typography;

export default function StudentPaymentPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const user = getSession();

  useEffect(() => {
    loadPaymentData();
  }, [user]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const pmList = getStoredPaymentMethods();
      setMethods(pmList);
      if (pmList.length > 0) setSelectedMethod(pmList[0]);

      const myPayments = await apiFetch('payment/verified/');
      setPayments(Array.isArray(myPayments) ? myPayments : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Account number copied to clipboard!');
  };

  const handleSubmitPayment = async (values: any) => {
    setLoading(true);
    try {
      await apiFetch('payment/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id_number || 'AAA1234',
          student_name: user?.full_name || 'Yonas Sahile',
          department_type: values.department_type,
          amount: values.amount,
          payment_method_id: selectedMethod?.id,
          transaction_id: values.transaction_id,
          phone_number: values.phone_number
        })
      });

      message.success('Payment receipt submitted for department verification!');
      form.resetFields();
      loadPaymentData();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit payment.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Transaction Reference',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (txt: string) => <Text strong style={{ color: '#2563eb' }}>{txt}</Text>
    },
    {
      title: 'Department',
      dataIndex: 'department_type',
      key: 'department_type',
      render: (d: string) => <Tag color="blue">{d?.toUpperCase()}</Tag>
    },
    {
      title: 'Amount (ETB)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt: number) => <Text strong>{amt} ETB</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'verified') return <Tag color="success"><CheckCircleOutlined /> Verified</Tag>;
        if (st === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="warning"><ClockCircleOutlined /> Pending Verification</Tag>;
      }
    },
    {
      title: 'Date Submitted',
      dataIndex: 'payment_date',
      key: 'payment_date'
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ fontWeight: 800, marginBottom: 8 }}>
          Department Fee & Dues Payment Portal
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Settle library fines, dormitory damage, or cafeteria dues directly via Mobile Money or Bank Transfer
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* PAYMENT METHOD SELECTION & INSTRUCTIONS */}
        <Col xs={24} md={12}>
          <Card title="1. SELECT PAYMENT METHOD" style={{ borderRadius: 16 }}>
            <Form.Item label="Payment Gateway">
              <Select
                size="large"
                value={selectedMethod?.id}
                onChange={(id) => setSelectedMethod(methods.find(m => m.id === id) || null)}
                options={methods.map(m => ({ label: m.name, value: m.id }))}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>

            {selectedMethod && (
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>ACCOUNT NAME</Text>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{selectedMethod.account_name}</div>

                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>ACCOUNT / PHONE NUMBER</Text>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: '#2563eb' }}>{selectedMethod.account_number}</span>
                  <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopy(selectedMethod.account_number)}>Copy</Button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>INSTRUCTIONS</Text>
                  <Paragraph style={{ whiteSpace: 'pre-line', fontSize: 13, color: '#475569', margin: 0 }}>
                    {selectedMethod.instructions}
                  </Paragraph>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* SUBMIT RECEIPT FORM */}
        <Col xs={24} md={12}>
          <Card title="2. SUBMIT PAYMENT TRANSACTION" style={{ borderRadius: 16 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitPayment}
              initialValues={{ amount: 350, department_type: 'library', transaction_id: 'PAY-CBE-982341' }}
            >
              <Form.Item name="department_type" label="Department Due Requiring Clearance" rules={[{ required: true }]}>
                <Select
                  size="large"
                  options={[
                    { label: '📚 Library Overdue Book Fine', value: 'library' },
                    { label: '🏠 Dormitory Room Damage Fee', value: 'dormitory' },
                    { label: '🍽️ Cafeteria Ticket Due', value: 'cafeteria' },
                    { label: '🏆 Sports Equipment Loss', value: 'sportmaster' }
                  ]}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item name="amount" label="Payment Amount (ETB)" rules={[{ required: true }]}>
                <Input size="large" prefix={<DollarOutlined />} style={{ borderRadius: 10 }} />
              </Form.Item>

              <Form.Item name="transaction_id" label="Transaction Ref / Reference Number" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. PAY-CBE-982341 or Telebirr Ref" style={{ borderRadius: 10 }} />
              </Form.Item>

              <Form.Item name="phone_number" label="Payer Phone Number">
                <Input size="large" placeholder="0921459991" style={{ borderRadius: 10 }} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontWeight: 700,
                  border: 'none',
                  marginTop: 8
                }}
              >
                Submit Receipt for Verification
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* MY PAYMENT HISTORY TABLE */}
      <Card title="MY SUBMITTED PAYMENT RECORDS" style={{ marginTop: 28, borderRadius: 16 }}>
        <Table columns={columns} dataSource={payments} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
}
