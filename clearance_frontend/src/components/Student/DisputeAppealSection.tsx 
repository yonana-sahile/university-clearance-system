import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Modal, Form, Input,
  Select, Alert, Row, Col, Timeline, message, Steps, Tooltip
} from 'antd';
import {
  ExclamationCircleOutlined, PlusOutlined, FileTextOutlined,
  CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled,
  AuditOutlined, ThunderboltOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { User, ClearanceForm } from '../../types';
import { apiFetch, getStoredForms, setStoredForms } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DisputeAppealProps {
  user: User | null;
  form: ClearanceForm | null;
  onFormUpdated: () => void;
}

interface DisputeRecord {
  id: string;
  department: string;
  category: string;
  reason: string;
  evidence: string;
  status: 'Under Review' | 'Resolution Granted' | 'Hearing Scheduled' | 'Rejected';
  submittedDate: string;
  resolutionNote?: string;
  reviewedBy?: string;
}

export const DisputeAppealSection: React.FC<DisputeAppealProps> = ({ user, form, onFormUpdated }) => {
  const [appeals, setAppeals] = useState<DisputeRecord[]>([
    {
      id: 'APP-2026-081',
      department: 'Main Library',
      category: 'Unreturned Book Dispute',
      reason: 'I returned the Advanced Software Engineering textbook to Counter 2 on June 15th before finals. Assistant librarian signed my manual return notebook.',
      evidence: 'Library manual return stamp slip #LB-4421 attached.',
      status: 'Under Review',
      submittedDate: '2026-07-27',
      resolutionNote: 'Awaiting circulation desk inventory cross-check.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<DisputeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formInstance] = Form.useForm();

  const handleCreateAppeal = (values: any) => {
    setSubmitting(true);
    setTimeout(() => {
      const newAppeal: DisputeRecord = {
        id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
        department: values.department,
        category: values.category,
        reason: values.reason,
        evidence: values.evidence || 'Self-declaration with student witness.',
        status: 'Under Review',
        submittedDate: new Date().toISOString().split('T')[0],
        resolutionNote: 'Assigned to Dean of Students & Department Audit Committee'
      };

      setAppeals([newAppeal, ...appeals]);
      setIsModalOpen(false);
      formInstance.resetFields();
      setSubmitting(false);
      message.success('Clearance dispute appeal formally logged! Audit tracking ID assigned.');
    }, 600);
  };

  // Demo action: Fast-track simulate resolution
  const handleSimulateResolution = (appealId: string, resolution: 'Resolution Granted' | 'Rejected') => {
    const updated = appeals.map(app => {
      if (app.id === appealId) {
        return {
          ...app,
          status: resolution,
          resolutionNote: resolution === 'Resolution Granted'
            ? 'Appeal upheld by Academic Committee. Department dues waived and clearance stage marked approved.'
            : 'Appeal rejected after second inventory check. Outstanding balance remains due.',
          reviewedBy: 'Dr. Mengistu Haile (Student Grievance Chairperson)'
        };
      }
      return app;
    });

    setAppeals(updated);

    if (resolution === 'Resolution Granted') {
      message.success('Appeal granted! Department hold has been resolved and stage approved.');
      // If resolving library dispute, waive dues in local forms
      const allForms = getStoredForms();
      const myForm = allForms.find(f => f.student_id === user?.id || f.student_email === user?.email || f.id_number === user?.id_number);
      if (myForm) {
        if (myForm.status === 'requires_library_payment') {
          myForm.status = 'approved_library';
          myForm.library_note = 'Library dues waived following Appeal APP-2026-081 resolution.';
        }
        setStoredForms(allForms);
        onFormUpdated();
      }
    } else {
      message.info('Appeal outcome recorded as rejected.');
    }
  };

  const columns = [
    {
      title: 'Appeal Ref',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <span style={{ fontWeight: 700, color: '#f59e0b' }}>{text}</span>
      )
    },
    {
      title: 'Target Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Date Logged',
      dataIndex: 'submittedDate',
      key: 'submittedDate'
    },
    {
      title: 'Review Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        let icon = <ClockCircleOutlined />;
        if (status === 'Resolution Granted') {
          color = 'green';
          icon = <CheckCircleFilled />;
        } else if (status === 'Rejected') {
          color = 'red';
          icon = <CloseCircleFilled />;
        }
        return (
          <Tag color={color} icon={icon} style={{ borderRadius: 12, fontWeight: 600 }}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Action / Review',
      key: 'action',
      render: (_: any, record: DisputeRecord) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => setSelectedAppeal(record)}
            style={{ borderRadius: 6 }}
          >
            Details
          </Button>
          {record.status === 'Under Review' && (
            <Tooltip title="Simulate grievance committee resolution">
              <Button
                size="small"
                type="primary"
                onClick={() => handleSimulateResolution(record.id, 'Resolution Granted')}
                style={{ borderRadius: 6, background: '#10b981', borderColor: '#10b981' }}
              >
                Grant Appeal (Demo)
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

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
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col xs={24} sm={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                fontSize: 22
              }}>
                <AuditOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                  Clearance Dispute & Grievance Appeals
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  File an official appeal if you encounter mistaken dues, missing return slips, or inventory discrepancies.
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right', marginTop: 12 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                fontWeight: 700
              }}
            >
              File New Dispute Appeal
            </Button>
          </Col>
        </Row>

        <Alert
          type="info"
          showIcon
          message="University Grievance Policy (Senate Legislation Art. 88)"
          description="Students have 7 academic days to dispute clearance holds or property assessments before the University Clearance Committee. Official hearings are conducted within 48 hours."
          style={{ marginBottom: 20, borderRadius: 12 }}
        />

        <Table
          columns={columns}
          dataSource={appeals}
          rowKey="id"
          pagination={false}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>

      {/* NEW APPEAL MODAL */}
      <Modal
        title={
          <Space>
            <AuditOutlined style={{ color: '#f59e0b' }} />
            <span>Submit Formal Clearance Grievance / Appeal</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={handleCreateAppeal}
          initialValues={{
            department: 'Main Library',
            category: 'Unreturned Book Dispute'
          }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Target Department / Office"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select size="large" style={{ borderRadius: 8 }}>
                  <Option value="Software Engineering Dept">Software Engineering Dept Head</Option>
                  <Option value="Main Library">Main Library Circulation</Option>
                  <Option value="Student Cafeteria">Student Cafeteria</Option>
                  <Option value="Dormitory Service">Dormitory Service & Proctor</Option>
                  <Option value="Sport Master">Sport Master & Gymnasium</Option>
                  <Option value="Campus Police">Campus Police & Security</Option>
                  <Option value="Cost Sharing Bureau">Cost Sharing Agency</Option>
                  <Option value="Registrar Office">University Registrar</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Dispute Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select size="large" style={{ borderRadius: 8 }}>
                  <Option value="Unreturned Book Dispute">Book / Material Already Returned</Option>
                  <Option value="Cafeteria Meal Charge Dispute">Cafeteria Punch / Utensil Discrepancy</Option>
                  <Option value="Dormitory Key / Inventory Error">Dorm Key / Room Inventory Assessment</Option>
                  <Option value="Disciplinary Record Recheck">Campus Conduct / Security Clearance</Option>
                  <Option value="Fee Waiver Request">Financial Hardship / Scholarship Waiver</Option>
                  <Option value="Other Administrative Issue">Other Administrative Error</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="Detailed Statement of Facts"
            rules={[{ required: true, message: 'Please provide detailed statement' }]}
            help="Detail dates, officer names, counter numbers, or physical handover circumstances."
          >
            <TextArea
              rows={4}
              placeholder="State clearly why this hold is erroneous and describe the steps taken to resolve it..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="evidence"
            label="Evidence / Receipt / Witness Reference"
            help="Specify receipt numbers, voucher codes, or colleague/officer witness names."
          >
            <Input
              placeholder="e.g. Return Slip #4421, Proctor room inspection signature, or Teller Ref #9923..."
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                fontWeight: 700
              }}
            >
              Submit Official Appeal
            </Button>
          </div>
        </Form>
      </Modal>

      {/* VIEW APPEAL DETAILS MODAL */}
      <Modal
        title="Dispute Investigation Dossier"
        open={!!selectedAppeal}
        onCancel={() => setSelectedAppeal(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedAppeal(null)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedAppeal && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Text strong style={{ fontSize: 16, color: '#0f172a' }}>{selectedAppeal.id}</Text>
                <div style={{ fontSize: 13, color: '#64748b' }}>Target: {selectedAppeal.department}</div>
              </div>
              <Tag color={selectedAppeal.status === 'Resolution Granted' ? 'green' : 'gold'} style={{ borderRadius: 10 }}>
                {selectedAppeal.status}
              </Tag>
            </div>

            <Card size="small" style={{ background: '#f8fafc', borderRadius: 10, marginBottom: 16 }}>
              <Text strong style={{ display: 'block', fontSize: 12, color: '#64748b' }}>STUDENT STATEMENT</Text>
              <Paragraph style={{ margin: '6px 0 0', fontSize: 13 }}>{selectedAppeal.reason}</Paragraph>
              <div style={{ marginTop: 8, fontSize: 12, color: '#334155' }}>
                <strong>Evidence:</strong> {selectedAppeal.evidence}
              </div>
            </Card>

            <Timeline
              style={{ marginTop: 20 }}
              items={[
                {
                  color: 'green',
                  children: `Appeal filed by ${user?.full_name || 'Yonas Sahile'} on ${selectedAppeal.submittedDate}`
                },
                {
                  color: selectedAppeal.status === 'Under Review' ? 'blue' : 'green',
                  children: 'Assigned to Dean of Students Standing Grievance Committee'
                },
                {
                  color: selectedAppeal.status === 'Resolution Granted' ? 'green' : (selectedAppeal.status === 'Rejected' ? 'red' : 'gray'),
                  children: (
                    <div>
                      <strong>Committee Finding:</strong> {selectedAppeal.resolutionNote}
                      {selectedAppeal.reviewedBy && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          Signed: {selectedAppeal.reviewedBy}
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DisputeAppealSection;
