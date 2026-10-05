import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Button, Table, Tag, Space,
  Statistic, Progress, Alert, Modal, Form, Input, Divider, message
} from 'antd';
import {
  SafetyCertificateOutlined, PrinterOutlined, CheckCircleFilled,
  DollarOutlined, FileTextOutlined, EditOutlined, BarcodeOutlined,
  BankOutlined, UserOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { User, ClearanceForm } from '../../types';
import { getStoredForms, setStoredForms } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

interface CostSharingProps {
  user: User | null;
  form: ClearanceForm | null;
  onFormUpdated: () => void;
}

export const CostSharingContractSection: React.FC<CostSharingProps> = ({ user, form, onFormUpdated }) => {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isContractPrintOpen, setIsContractPrintOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(() => {
    // Check if cost sharing stage is approved in form
    return form?.status && ['approved_cooperationsharing', 'approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status);
  });

  const [guarantorName, setGuarantorName] = useState('Sahile Desta (Parent/Guarantor)');
  const [guarantorPhone, setGuarantorPhone] = useState('+251 91 123 4567');
  const [guarantorWoreda, setGuarantorWoreda] = useState('Addis Ababa, Sub-City Bole, Woreda 03');
  const [signing, setSigning] = useState(false);

  // Ethiopian Higher Education Cost Sharing Items (Standard 4-Year B.Sc. Curriculum)
  const breakdown = [
    { key: '1', item: 'Tuition Fee (Subsidized 15% Share)', period: '4 Academic Years (8 Semesters)', amount: 18400, subsidy: '85% Covered by Ministry' },
    { key: '2', item: 'Food & Student Cafeteria Boarding', period: '4 Academic Years (32 Months)', amount: 24000, subsidy: 'Standard Living Subsidy' },
    { key: '3', item: 'Dormitory Accommodation & Utilities', period: '4 Academic Years (Block A)', amount: 16000, subsidy: 'University Housing Service' },
    { key: '4', item: 'Health Care & Clinical Welfare', period: 'Full Duration Coverage', amount: 3200, subsidy: 'Campus Medical Clinic' },
  ];

  const totalCost = breakdown.reduce((acc, curr) => acc + curr.amount, 0); // 61,600 ETB
  const monthlySalaryEst = 12000;
  const monthlyRepayment = Math.round(monthlySalaryEst * 0.10); // 10% deduction = 1200 ETB/mo
  const estimatedPayoffMonths = Math.ceil(totalCost / monthlyRepayment); // ~52 months

  const handleSignAgreement = (values: any) => {
    setSigning(true);
    setTimeout(() => {
      setGuarantorName(values.guarantor_name || guarantorName);
      setGuarantorPhone(values.guarantor_phone || guarantorPhone);
      setGuarantorWoreda(values.guarantor_woreda || guarantorWoreda);
      setHasSigned(true);
      setSigning(false);
      setIsSignModalOpen(false);
      message.success('Cost Sharing Promissory Note digitally signed and verified by Federal Revenue Authority!');

      // Update form stage in mock storage
      const allForms = getStoredForms();
      const myForm = allForms.find(f => f.student_id === user?.id || f.student_email === user?.email || f.id_number === user?.id_number);
      if (myForm) {
        myForm.cooperationsharing_note = 'Cost sharing obligation contract Form CS-04 signed & registered with Ministry Tax Registry.';
        myForm.cooperationsharing_approved_by = 'Alemayehu Bogale (Finance Directorate)';
        if (myForm.status === 'pending_department' || myForm.status.includes('approved_campuspolice')) {
          myForm.status = 'approved_cooperationsharing';
        }
        setStoredForms(allForms);
        onFormUpdated();
      }
    }, 700);
  };

  const handlePrintContract = () => {
    window.print();
  };

  return (
    <div>
      <Card
        style={{
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: 24
        }}
        styles={{ body: { padding: 24 } }}
      >
        {/* HEADER */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col xs={24} sm={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                fontSize: 22
              }}>
                <BankOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                  Cost Sharing & Promissory Obligation Contract
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Federal Higher Education Proclamation No. 650/2009 • Form CS-04 Digital Verification
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right', marginTop: 12 }}>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => setIsContractPrintOpen(true)}
                style={{ borderRadius: 10, fontWeight: 600 }}
              >
                View / Print CS-04
              </Button>
              {!hasSigned ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsSignModalOpen(true)}
                  style={{
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    fontWeight: 700
                  }}
                >
                  Sign Promissory Note
                </Button>
              ) : (
                <Tag color="success" icon={<CheckCircleFilled />} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 20 }}>
                  Digitally Affirmed & Cleared
                </Tag>
              )}
            </Space>
          </Col>
        </Row>

        {/* STATUS ALERT */}
        {hasSigned ? (
          <Alert
            type="success"
            showIcon
            message="Cost Sharing Obligation Contract Signed & Authenticated"
            description={`Promissory contract has been registered under Student TIN reference ET-TIN-${user?.id_number || 'AAA1234'}-CS. Repayment will commence via standard 10% income tax withholding following the statutory 6-month post-graduation grace period.`}
            style={{ marginBottom: 24, borderRadius: 12 }}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Action Required: Student Signature Missing"
            description="Under Ethiopian Ministry of Education guidelines, your final university clearance cannot be issued until you affirm your Cost Sharing Promissory Note."
            style={{ marginBottom: 24, borderRadius: 12 }}
          />
        )}

        {/* FINANCIAL SUMMARY METRICS */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 18 } }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700 }}>TOTAL COST SHARE OBLIGATION</Text>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a8a', marginTop: 4 }}>
                {totalCost.toLocaleString()} <span style={{ fontSize: 14 }}>ETB</span>
              </div>
              <Text style={{ fontSize: 12, color: '#10b981' }}>Subsidized 85% by FDRE Government</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 18 } }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700 }}>REPAYMENT DEDUCTION RATE</Text>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                10% <span style={{ fontSize: 14 }}>Monthly Income</span>
              </div>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Post-Graduation 6-Month Grace Period</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 18 } }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700 }}>REGISTRATION STATUS</Text>
              <div style={{ fontSize: 24, fontWeight: 800, color: hasSigned ? '#10b981' : '#f59e0b', marginTop: 4 }}>
                {hasSigned ? 'Contract Active' : 'Pending Signature'}
              </div>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Ministry Tax File: Ref #CS-2026</Text>
            </Card>
          </Col>
        </Row>

        {/* DETAILED EXPENSE BREAKDOWN */}
        <Title level={5} style={{ marginBottom: 12 }}>Detailed 4-Year Service Cost Assessment</Title>
        <Table
          dataSource={breakdown}
          pagination={false}
          columns={[
            { title: 'Service Component', dataIndex: 'item', key: 'item', render: (t) => <strong style={{ color: '#0f172a' }}>{t}</strong> },
            { title: 'Accounting Period', dataIndex: 'period', key: 'period' },
            { title: 'Subsidy / Government Notes', dataIndex: 'subsidy', key: 'subsidy', render: (t) => <Tag color="blue">{t}</Tag> },
            {
              title: 'Student Share Obligation (ETB)',
              dataIndex: 'amount',
              key: 'amount',
              align: 'right',
              render: (amt: number) => <strong>{amt.toLocaleString()} ETB</strong>
            }
          ]}
          summary={() => (
            <Table.Summary.Row style={{ background: '#f1f5f9', fontWeight: 800 }}>
              <Table.Summary.Cell index={0} colSpan={3}>
                TOTAL ACCUMULATED COST SHARE DEBT LIABILITY
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <span style={{ fontSize: 16, color: '#1e3a8a' }}>
                  {totalCost.toLocaleString()} ETB
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
          style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}
        />
      </Card>

      {/* SIGN AGREEMENT MODAL */}
      <Modal
        title="Sign Cost Sharing Promissory Note (Form CS-04)"
        open={isSignModalOpen}
        onCancel={() => setIsSignModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleSignAgreement}
          initialValues={{
            full_name: user?.full_name || 'Yonas Sahile',
            student_id: user?.id_number || 'AAA1234',
            guarantor_name: guarantorName,
            guarantor_phone: guarantorPhone,
            guarantor_woreda: guarantorWoreda
          }}
          style={{ marginTop: 16 }}
        >
          <Alert
            message="Legal Undertaking"
            description="By checking the digital signature below, you legally agree to repay 61,600 ETB through standard Ethiopian payroll tax deductions once employed, in accordance with Council of Ministers Regulation No. 154/2008."
            type="info"
            showIcon
            style={{ marginBottom: 18, borderRadius: 8 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Student Full Name">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="student_id" label="Student ID / TIN">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ fontSize: 13 }}>Guarantor / Next of Kin Details</Divider>

          <Form.Item name="guarantor_name" label="Guarantor Full Name" rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="guarantor_phone" label="Guarantor Telephone" rules={[{ required: true }]}>
                <Input size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="guarantor_woreda" label="Residential Kebele / Woreda" rules={[{ required: true }]}>
                <Input size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Button onClick={() => setIsSignModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={signing}
              style={{ background: '#2563eb', fontWeight: 700, borderRadius: 8 }}
            >
              Confirm Digital Signature & Affirm Note
            </Button>
          </div>
        </Form>
      </Modal>

      {/* PRINTABLE OFFICIAL PROMISSORY NOTE MODAL */}
      <Modal
        title="Official Ministry of Education Form CS-04 Preview"
        open={isContractPrintOpen}
        onCancel={() => setIsContractPrintOpen(false)}
        width={750}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrintContract} style={{ borderRadius: 8 }}>
            Print Promissory Contract
          </Button>,
          <Button key="close" onClick={() => setIsContractPrintOpen(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
      >
        <div style={{ padding: 24, border: '2px solid #0f172a', background: '#fffdfa', borderRadius: 12, fontFamily: 'serif' }}>
          {/* HEADER */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' }}>FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</div>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>MINISTRY OF EDUCATION • HIGHER EDUCATION COST SHARING CONTRACT</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>FORM CS-04 / 2026 • UNIVERSITY GRADUATION CLEARANCE OBLIGATION</div>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 20, fontSize: 13 }}>
            <Col span={12}><strong>Debtor (Student):</strong> {user?.full_name || 'Yonas Sahile'}</Col>
            <Col span={12}><strong>Student ID:</strong> {user?.id_number || 'AAA1234'}</Col>
            <Col span={12}><strong>University:</strong> Mekdela Amba University</Col>
            <Col span={12}><strong>Degree Program:</strong> Software Engineering (B.Sc.)</Col>
            <Col span={12}><strong>Total Debt Incurred:</strong> 61,600 ETB (Sixty-One Thousand Six Hundred Birr)</Col>
            <Col span={12}><strong>Repayment Rate:</strong> 10% Monthly Payroll Tax</Col>
            <Col span={12}><strong>Guarantor:</strong> {guarantorName}</Col>
            <Col span={12}><strong>Guarantor Contact:</strong> {guarantorPhone}</Col>
          </Row>

          <div style={{ background: '#f8fafc', padding: 14, border: '1px solid #cbd5e1', fontSize: 12, lineHeight: 1.6, marginBottom: 24 }}>
            I, the undersigned student, hereby solemnly acknowledge and promise to pay the Federal Democratic Republic of Ethiopia Ministry of Revenues the total sum of <strong>61,600 ETB</strong> in consideration of higher educational services received. I consent to automatic deductions from my future monthly earnings following the statutory six-month grace period.
          </div>

          <Row justify="space-between" align="bottom" style={{ marginTop: 40, paddingTop: 20, borderTop: '1px dashed #94a3b8' }}>
            <Col span={8} style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: 4, fontWeight: 'bold', fontSize: 12 }}>
                {user?.full_name || 'Yonas Sahile'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Student Digital Signature</div>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, border: '2px solid #2563eb', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold', fontSize: 9 }}>
                REVENUE SEAL
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Finance Directorate Stamp</div>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: 4, fontWeight: 'bold', fontSize: 12 }}>
                Alemayehu Bogale
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Cost Sharing Officer</div>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default CostSharingContractSection;
