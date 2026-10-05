import React, { useState } from 'react';
import { Card, Table, Tag, Button, Upload, Modal, Typography, Space, Row, Col, Alert, Select, message, Tooltip } from 'antd';
import {
  UploadOutlined, FilePdfOutlined, FileImageOutlined, CheckCircleFilled,
  ClockCircleOutlined, DeleteOutlined, EyeOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { User, ClearanceForm } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface DocumentLockerProps {
  user: User | null;
  form: ClearanceForm | null;
}

interface StoredDoc {
  id: string;
  name: string;
  department: string;
  uploadDate: string;
  size: string;
  type: string;
  status: 'Verified' | 'Pending Review' | 'Needs Resubmission';
  notes?: string;
}

export const DocumentLocker: React.FC<DocumentLockerProps> = ({ user, form }) => {
  const [docs, setDocs] = useState<StoredDoc[]>([
    {
      id: 'DOC-101',
      name: 'Ministry_Cost_Sharing_Agreement_Signed.pdf',
      department: 'Cost Sharing Office',
      uploadDate: '2026-07-28',
      size: '1.4 MB',
      type: 'PDF',
      status: 'Verified',
      notes: 'Approved by Cost Sharing Officer'
    },
    {
      id: 'DOC-102',
      name: 'Library_Lost_Book_Payment_Receipt.pdf',
      department: 'Main Library',
      uploadDate: '2026-07-29',
      size: '850 KB',
      type: 'PDF',
      status: 'Pending Review',
      notes: 'Submitted for book refund verification'
    }
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('Main Library');
  const [docName, setDocName] = useState('');
  const [previewDoc, setPreviewDoc] = useState<StoredDoc | null>(null);

  const handleSimulatedUpload = () => {
    if (!docName.trim()) {
      message.error('Please enter a document name or select a file.');
      return;
    }

    const newDoc: StoredDoc = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
      department: selectedDept,
      uploadDate: new Date().toISOString().split('T')[0],
      size: '1.2 MB',
      type: 'PDF',
      status: 'Pending Review',
      notes: 'Awaiting officer inspection'
    };

    setDocs([newDoc, ...docs]);
    setIsUploadOpen(false);
    setDocName('');
    message.success('Document uploaded to Digital Locker and attached to department queue!');
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter(d => d.id !== id));
    message.info('Document removed from locker.');
  };

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <FilePdfOutlined style={{ color: '#ef4444', fontSize: 18 }} />
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block' }}>{text}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>Official Student Submission</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Target Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>{dept}</Tag>
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (d: string) => <Text style={{ color: '#64748b', fontSize: 12 }}>{d}</Text>
    },
    {
      title: 'Verification Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: StoredDoc) => {
        if (status === 'Verified') {
          return <Tag color="success" icon={<CheckCircleFilled />}>Verified</Tag>;
        }
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Pending Review</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: StoredDoc) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setPreviewDoc(record)}
            style={{ borderRadius: 6 }}
          >
            Preview
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ borderRadius: 6 }}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* BANNER */}
      <Card
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          border: 'none'
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Row justify="space-between" align="middle">
          <Col xs={24} md={16}>
            <Title level={4} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
              📁 Official Student Clearance Document Locker
            </Title>
            <Paragraph style={{ color: '#cbd5e1', margin: '6px 0 0 0', fontSize: 13 }}>
              Upload signed cost-sharing forms, lost book receipts, proctor room keys return slips, or thesis approval forms directly for department officers.
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: 12 }}>
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={() => setIsUploadOpen(true)}
              style={{ borderRadius: 12, background: '#2563eb', fontWeight: 700, border: 'none' }}
            >
              Upload Document
            </Button>
          </Col>
        </Row>
      </Card>

      {/* TABLE OF UPLOADED DOCUMENTS */}
      <Card style={{ borderRadius: 20, borderColor: '#e2e8f0' }}>
        <Table
          dataSource={docs}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* UPLOAD MODAL */}
      <Modal
        title="Upload Document to Department Clearance Queue"
        open={isUploadOpen}
        onCancel={() => setIsUploadOpen(false)}
        onOk={handleSimulatedUpload}
        okText="Confirm & Upload"
        okButtonProps={{ style: { borderRadius: 8, background: '#2563eb' } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 12 }} size={16}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Select Target University Office:</Text>
            <Select
              style={{ width: '100%' }}
              value={selectedDept}
              onChange={setSelectedDept}
            >
              <Option value="Main Library">📚 Main Library</Option>
              <Option value="Cost Sharing Office">📄 Cost Sharing Office</Option>
              <Option value="Department Head">🎓 Department Head</Option>
              <Option value="Dormitory Proctor">🏠 Dormitory Proctor</Option>
              <Option value="Cafeteria Office">🍱 Cafeteria Office</Option>
              <Option value="Campus Police">🛡️ Campus Police</Option>
              <Option value="Registrar Office">🏛️ Registrar Office</Option>
            </Select>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Document Title / Description:</Text>
            <input
              type="text"
              className="ant-input"
              placeholder="e.g. Cost_Sharing_Agreement_Signed.pdf"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d9d9d9' }}
            />
          </div>

          <Alert
            type="info"
            showIcon
            message="Accepted Formats"
            description="PDF, PNG, JPEG up to 10MB. Uploaded files are encrypted and accessible only to authorized Mekdela Amba University department officers."
            style={{ borderRadius: 10 }}
          />
        </Space>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal
        title={`Preview: ${previewDoc?.name}`}
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewDoc(null)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
      >
        {previewDoc && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <FilePdfOutlined style={{ fontSize: 64, color: '#ef4444', marginBottom: 12 }} />
            <Title level={5}>{previewDoc.name}</Title>
            <Tag color="blue">{previewDoc.department}</Tag>
            <Paragraph style={{ marginTop: 16, color: '#64748b', fontSize: 13 }}>
              Status: <strong>{previewDoc.status}</strong><br />
              Note: {previewDoc.notes}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentLocker;
