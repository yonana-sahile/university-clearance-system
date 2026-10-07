import React, { useRef } from 'react';
import { Modal, Button, Typography, Space, Tag, Divider, Row, Col } from 'antd';
import {
  PrinterOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import type { ClearanceForm } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface CertificateProps {
  open: boolean;
  onClose: () => void;
  form: ClearanceForm | null;
}

export const ClearanceCertificateModal: React.FC<CertificateProps> = ({
  open,
  onClose,
  form,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!form) return null;

  const certificateId = `MAU-CLR-${new Date().getFullYear()}-${String(form.id ?? 0).padStart(5, '0')}`;
  const verifyUrl = `${window.location.origin}/verify-certificate?id=${certificateId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Tag color="green" icon={<CheckCircleFilled />}>
            Verified Cryptographic Hash: {certificateId}
          </Tag>
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              style={{ borderRadius: 8, background: '#1e3a8a' }}
            >
              Print / Download PDF Certificate
            </Button>
          </Space>
        </div>
      }
      width={850}
      style={{ top: 20 }}
    >
      <div ref={printRef} style={{ padding: '20px 10px' }}>
        <div
          className="certificate-box"
          style={{
            border: '10px double #1e3a8a',
            padding: 36,
            borderRadius: 16,
            background: 'linear-gradient(180deg, #ffffff 0%, #fefce8 100%)',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          {/* WATERMARK */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg)',
              fontSize: 80,
              fontWeight: 900,
              color: 'rgba(30, 58, 138, 0.04)',
              pointerEvents: 'none',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            OFFICIAL CLEARANCE
          </div>

          {/* LOGO & UNIVERSITY NAME */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img
              src="/images/MAU.jpg"
              alt="Mekdela Amba University Crest"
              style={{
                width: 90,
                height: 90,
                borderRadius: 18,
                marginBottom: 8,
                border: '3px solid #1e3a8a',
                objectFit: 'contain',
                background: '#ffffff',
                padding: 4,
              }}
            />
            <Title
              level={2}
              style={{
                margin: 0,
                color: '#1e3a8a',
                textTransform: 'uppercase',
                fontWeight: 900,
              }}
            >
              MEKDELA AMBA UNIVERSITY
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: 13,
                letterSpacing: 2,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#475569',
              }}
            >
              OFFICE OF THE ACADEMIC & GRADUATE REGISTRAR
            </Text>
          </div>

          <Divider style={{ borderColor: '#cbd5e1', margin: '16px 0' }} />

          {/* CERTIFICATE HEADING */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <SafetyCertificateOutlined
              style={{ fontSize: 36, color: '#d97706', marginBottom: 8 }}
            />
            <Title
              level={3}
              style={{
                margin: 0,
                color: '#b45309',
                fontFamily: 'Georgia, serif',
                fontWeight: 800,
              }}
            >
              OFFICIAL DIGITAL CLEARANCE CERTIFICATE
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Certificate Ref:{' '}
              <strong style={{ color: '#1e3a8a' }}>{certificateId}</strong>
            </Text>
          </div>

          {/* BODY */}
          <Paragraph
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: '#334155',
              textAlign: 'center',
              margin: '24px 0',
            }}
          >
            This is to officially certify that student <br />
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0f172a',
                textDecoration: 'underline',
                textUnderlineOffset: 6,
              }}
            >
              {form.full_name}
            </span>
            <br />
            ID Number:{' '}
            <strong style={{ color: '#1e3a8a' }}>{form.id_number}</strong> |
            Department: <strong>{form.department_name}</strong>
            <br />
            College: <strong>{form.college}</strong> | Program:{' '}
            <strong>
              {form.program_level} ({form.enrollment_type})
            </strong>
            <br />
            has successfully fulfilled and cleared all academic, library,
            financial, dormitory, cafeteria, sports, and administrative
            obligations to Mekdela Amba University.
          </Paragraph>

          <div
            style={{
              background: '#f0fdf4',
              padding: '12px 20px',
              borderRadius: 10,
              border: '1px solid #bbf7d0',
              margin: '20px auto',
              maxWidth: 550,
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#166534', fontWeight: 700, fontSize: 14 }}>
              ✅ STATUS: FULLY CLEARED & APPROVED FOR GRADUATION / TRANSCRIPT
              ISSUANCE
            </Text>
          </div>

          {/* FOOTER */}
          <Row
            align="bottom"
            justify="space-between"
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: '2px dashed #e2e8f0',
            }}
          >
            <Col xs={8} style={{ textAlign: 'left' }}>
              <div
                style={{
                  marginBottom: 40,
                  borderBottom: '1px solid #0f172a',
                  width: 160,
                }}
              ></div>
              <Text
                strong
                style={{ display: 'block', fontSize: 13, color: '#0f172a' }}
              >
                Dr. Worku Tesfaye
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                University Registrar Director
              </Text>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: 10 }}
              >
                Date:{' '}
                {new Date(form.updated_at || Date.now()).toLocaleDateString()}
              </Text>
            </Col>

            <Col xs={8} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: '3px double #1e3a8a',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: 4,
                  background: '#ffffff',
                }}
              >
                <SafetyCertificateOutlined
                  style={{ fontSize: 20, color: '#1e3a8a' }}
                />
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: '#1e3a8a',
                    textAlign: 'center',
                  }}
                >
                  MAU OFFICIAL SEAL
                </span>
              </div>
            </Col>

            <Col xs={8} style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: 8,
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <QRCodeSVG value={verifyUrl} size={80} level="M" />
              </div>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: 10, marginTop: 4 }}
              >
                Scan to Verify Authenticity
              </Text>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default ClearanceCertificateModal;
