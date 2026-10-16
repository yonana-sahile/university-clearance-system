import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Modal, Form, Input,
  Select, Alert, Row, Col, Timeline, message, Tooltip,
} from 'antd';
import {
  PlusOutlined, CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled, AuditOutlined,
} from '@ant-design/icons';
import type { User, ClearanceForm } from '../../types';
import { apiFetch } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DisputeAppealProps {
  user: User | null;
  form: ClearanceForm | null;
  onFormUpdated: () => void;
}

interface DisputeRecord {
  id: number;
  ref: string;
  department: string;
  category: string;
  reason: string;
  evidence: string;
  status: string;
  created_at: string;
  resolution_note?: string;
  reviewed_by?: string;
}

export const DisputeAppealSection: React.FC<DisputeAppealProps> = ({
  user,
}) => {
  const [appeals, setAppeals] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<DisputeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formInstance] = Form.useForm();

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('disputes');
      setAppeals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppeal = async (values: any) => {
    setSubmitting(true);
    try {
      await apiFetch('disputes', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setIsModalOpen(false);
      formInstance.resetFields();
      message.success('Clearance dispute appeal logged! Tracking ID assigned.');
      loadDisputes();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (s: string) => {
    if (s === 'granted') return 'Resolution Granted';
    if (s === 'rejected') return 'Rejected';
    if (s === 'hearing') return 'Hearing Scheduled';
    return 'Under Review';
  };

  const columns = [
    { title: 'Appeal Ref', dataIndex: 'ref', key: 'ref',
      render: (t: string) => <span style={{ fontWeight: 700, color: '#f59e0b' }}>{t}</span> },
    { title: 'Target Department', dataIndex: 'department', key: 'department',
      render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Date Logged', dataIndex: 'created_at', key: 'created_at',
      render: (d: string) => new Date(d).toLocaleDateString() },
    {
      title: 'Review Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        let icon = <ClockCircleOutlined />;
        if (status === 'granted') { color = 'green'; icon = <CheckCircleFilled />; }
        else if (status === 'rejected') { color = 'red'; icon = <CloseCircleFilled />; }
        return <Tag color={color} icon={icon} style={{ borderRadius: 12, fontWeight: 600 }}>{statusLabel(status)}</Tag>;
      },
    },
    {
      title: 'Action / Review',
      key: 'action',
      render: (_: any, record: DisputeRecord) => (
        <Button size="small" onClick={() => setSelectedAppeal(record)} style={{ borderRadius: 6 }}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{ borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }}
        styles={{ body: { padding: 24 } }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col xs={24} sm={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontSize: 22 }}>
                <AuditOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Clearance Dispute & Grievance Appeals</Title>
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
              style={{ borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', fontWeight: 700 }}
            >
              File New Dispute Appeal
            </Button>
          </Col>
        </Row>

        <Alert
          type="info" showIcon
          message="University Grievance Policy (Senate Legislation Art. 88)"
          description="Students have 7 academic days to dispute clearance holds or property assessments before the University Clearance Committee. Official hearings are conducted within 48 hours."
          style={{ marginBottom: 20, borderRadius: 12 }}
        />

        <Table
          columns={columns}
          dataSource={appeals}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'No disputes filed yet. Click "File New Dispute Appeal" to start.' }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>

      {/* CREATE MODAL */}
      <Modal
        title={<Space><AuditOutlined style={{ color: '#f59e0b' }} /><span>Submit Formal Clearance Grievance / Appeal</span></Space>}
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
          initialValues={{ department: 'Main Library', category: 'Unreturned Book Dispute' }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Target Department / Office" rules={[{ required: true }]}>
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
              <Form.Item name="category" label="Dispute Category" rules={[{ required: true }]}>
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

          <Form.Item name="reason" label="Detailed Statement of Facts" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="State clearly why this hold is erroneous..." style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="evidence" label="Evidence / Receipt / Witness Reference">
            <Input placeholder="e.g. Return Slip #4421..." size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}
              style={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', fontWeight: 700 }}>
              Submit Official Appeal
            </Button>
          </div>
        </Form>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        title="Dispute Investigation Dossier"
        open={!!selectedAppeal}
        onCancel={() => setSelectedAppeal(null)}
        footer={[<Button key="close" type="primary" onClick={() => setSelectedAppeal(null)} style={{ borderRadius: 8 }}>Close</Button>]}
        width={600}
      >
        {selectedAppeal && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Text strong style={{ fontSize: 16, color: '#0f172a' }}>{selectedAppeal.ref}</Text>
                <div style={{ fontSize: 13, color: '#64748b' }}>Target: {selectedAppeal.department}</div>
              </div>
              <Tag color={selectedAppeal.status === 'granted' ? 'green' : 'gold'} style={{ borderRadius: 10 }}>
                {statusLabel(selectedAppeal.status)}
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
              items={[
                { color: 'green', children: `Appeal filed by ${user?.full_name || 'Student'} on ${new Date(selectedAppeal.created_at).toLocaleDateString()}` },
                { color: 'blue', children: 'Assigned to Dean of Students Standing Grievance Committee' },
                { color: selectedAppeal.status === 'granted' ? 'green' : selectedAppeal.status === 'rejected' ? 'red' : 'gray',
                  children: (
                    <div>
                      <strong>Committee Finding:</strong> {selectedAppeal.resolution_note || 'Pending review'}
                      {selectedAppeal.reviewed_by && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Signed: {selectedAppeal.reviewed_by}</div>}
                    </div>
                  ) },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DisputeAppealSection;
