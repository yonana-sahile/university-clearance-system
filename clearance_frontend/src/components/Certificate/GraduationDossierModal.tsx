import React, { useRef } from 'react';
import { Modal, Button, Typography, Space, Tag, Row, Col, Divider, Table } from 'antd';
import {
  PrinterOutlined, DownloadOutlined, SafetyCertificateOutlined,
  CheckCircleFilled, QrcodeOutlined, TrophyOutlined
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { ClearanceForm, User } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface DossierProps {
  open: boolean;
  onClose: () => void;
  form: ClearanceForm | null;
  user: User | null;
  stages: any[];
}

export const GraduationDossierModal: React.FC<DossierProps> = ({
  open, onClose, form, user, stages
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!form) return null;

  const certificateId = `MAU-CLR-2026-${form.id.toString().padStart(5, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <TrophyOutlined style={{ color: '#f59e0b' }} />
          <span>Official University Graduation & Clearance Dossier</span>
        </Space>
      }
      footer={[
        <Button key="close" onClick={onClose} style={{ borderRadius: 8 }}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ borderRadius: 8, background: '#1e3a8a' }}
        >
          Print Complete 4-Part Dossier
        </Button>
      ]}
      width={900}
      style={{ top: 20 }}
    >
      <div ref={printAreaRef} style={{ padding: '10px 0' }}>
        {/* DOCUMENT 1: GRADUATION CLEARANCE CERTIFICATE */}
        <div style={{
          border: '8px double #1e3a8a',
          padding: 30,
          borderRadius: 16,
          background: 'linear-gradient(180deg, #ffffff 0%, #fefce8 100%)',
          textAlign: 'center',
          position: 'relative',
          marginBottom: 30
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <img src="/images/MAU.jpg" alt="MAU" style={{ width: 60, height: 60, borderRadius: 12, border: '2px solid #1e3a8a', objectFit: 'contain', background: '#ffffff', padding: 2 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#1e3a8a', letterSpacing: 1 }}>MEKDELA AMBA UNIVERSITY</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: 2 }}>OFFICE OF THE UNIVERSITY REGISTRAR</div>
            </div>
          </div>

          <div style={{ fontSize: 24, fontWeight: 800, color: '#b45309', margin: '14px 0 6px', fontFamily: 'Georgia, serif' }}>
            OFFICIAL DIGITAL CLEARANCE CERTIFICATE
          </div>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 }}>
            CERTIFICATE NO: {certificateId}
          </div>

          <div style={{ margin: '18px 0', fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
            This is to certify that student
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', textDecoration: 'underline', margin: '4px 0' }}>
              {user?.full_name || form.full_name || 'Yonas Sahile'}
            </div>
            ID Number: <strong>{user?.id_number || form.id_number || 'AAA1234'}</strong> • College of Computing & Informatics • Department of Software Engineering<br />
            has satisfactorily surrendered all property, fulfilled academic requirements, and completed clearance from all eleven (11) university offices.
          </div>

          <Row justify="space-between" align="bottom" style={{ marginTop: 28, paddingTop: 16, borderTop: '2px solid #cbd5e1' }}>
            <Col span={7} style={{ textAlign: 'left' }}>
              <QRCodeSVG value={`https://mau.edu.et/verify-certificate?id=${certificateId}`} size={75} />
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Scan to Verify Authenticity</div>
            </Col>
            <Col span={10} style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, border: '3px dashed #1e3a8a', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#1e3a8a' }}>
                REGISTRAR GOLD SEAL
              </div>
            </Col>
            <Col span={7} style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: 4, fontWeight: 'bold' }}>
                Dr. Tsegaye Gebre
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>University Registrar</div>
            </Col>
          </Row>
        </div>

        {/* DOCUMENT 2: 11-OFFICE CLEARANCE SUMMARY SLIP */}
        <div style={{
          border: '1px solid #cbd5e1',
          padding: 24,
          borderRadius: 12,
          background: '#ffffff',
          marginBottom: 30
        }}>
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>11-OFFICE CLEARANCE SUMMARY SHEET</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Form MAU-CLR-SUMMARY-2026</div>
            </div>
            <Tag color="success" icon={<CheckCircleFilled />}>100% Cleared</Tag>
          </div>

          <Row gutter={[12, 12]} style={{ marginBottom: 14, fontSize: 12 }}>
            <Col span={12}><strong>Student:</strong> {user?.full_name || 'Yonas Sahile'} ({user?.id_number || 'AAA1234'})</Col>
            <Col span={12}><strong>Email:</strong> {user?.email || 'yonassahile8@gmail.com'}</Col>
            <Col span={12}><strong>Department:</strong> Software Engineering</Col>
            <Col span={12}><strong>Program:</strong> Undergraduate (B.Sc.)</Col>
          </Row>

          <Table
            size="small"
            pagination={false}
            dataSource={stages.map((s, i) => ({
              key: s.key,
              no: i + 1,
              office: s.title,
              note: s.note,
              status: s.approved ? 'CLEARED' : 'PENDING'
            }))}
            columns={[
              { title: '#', dataIndex: 'no', width: 40 },
              { title: 'Office / Checkpoint', dataIndex: 'office' },
              { title: 'Sign-off Note', dataIndex: 'note' },
              {
                title: 'Status',
                dataIndex: 'status',
                render: val => <Tag color={val === 'CLEARED' ? 'success' : 'warning'}>{val}</Tag>
              }
            ]}
          />
        </div>

        {/* DOCUMENT 3: TEMPORARY DEGREE / TRANSCRIPT RELEASE AUTHORIZATION */}
        <div style={{
          border: '2px solid #166534',
          padding: 20,
          borderRadius: 12,
          background: '#f0fdf4'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <strong style={{ fontSize: 14, color: '#166534' }}>
                DEGREE CONFERMENT & OFFICIAL TRANSCRIPT RELEASE PASS
              </strong>
              <div style={{ fontSize: 11, color: '#15803d' }}>
                Authorized for presentation to Graduation Gown and Degree Issuance Counters
              </div>
            </div>
            <Tag color="green">RELEASE APPROVED</Tag>
          </div>
          <Paragraph style={{ margin: 0, fontSize: 12, color: '#166534' }}>
            The bearer, <strong>{user?.full_name || 'Yonas Sahile'}</strong>, has fully settled all financial, academic, and property obligations to Mekdela Amba University. The Directorate of Student Records & Registrar is hereby authorized to release original student credentials.
          </Paragraph>
        </div>
      </div>
    </Modal>
  );
};

export default GraduationDossierModal;
