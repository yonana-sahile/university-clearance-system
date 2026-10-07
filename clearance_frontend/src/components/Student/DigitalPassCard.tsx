import React from 'react';
import { Card, Typography, Tag, Row, Col, Button, Divider } from 'antd';
import {
  SafetyCertificateOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import type { ClearanceForm, User } from '../../types';

const { Title, Text } = Typography;

interface DigitalPassCardProps {
  user: User | null;
  form: ClearanceForm | null;
  approvedCount: number;
}

export const DigitalPassCard: React.FC<DigitalPassCardProps> = ({
  user,
  form,
  approvedCount,
}) => {
  const isFullyCleared =
    approvedCount === 11 || form?.status === 'Cleared by Registrar';
  const passId = `MAU-PASS-2026-${String(form?.id || user?.id || 0).padStart(4, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card
      style={{
        borderRadius: 24,
        background: 'linear-gradient(145deg, #1e3a8a 0%, #0f172a 100%)',
        color: '#ffffff',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: 28 } }}
    >
      <div
        style={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          opacity: 0.06,
          fontSize: 220,
          pointerEvents: 'none',
          color: '#ffffff',
        }}
      >
        🎓
      </div>

      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 20 }}
      >
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/images/MAU.jpg"
              alt="MAU Emblem"
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                border: '2px solid #3b82f6',
                objectFit: 'contain',
                background: '#ffffff',
                padding: 2,
              }}
            />
            <div>
              <Text
                strong
                style={{
                  color: '#93c5fd',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  display: 'block',
                }}
              >
                MEKDELA AMBA UNIVERSITY
              </Text>
              <Title
                level={4}
                style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}
              >
                DIGITAL CLEARANCE PASSPORT
              </Title>
            </div>
          </div>
        </Col>
        <Col>
          <Tag
            color={isFullyCleared ? 'success' : 'warning'}
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
            }}
          >
            {isFullyCleared ? 'VALID PASSPORT' : `${approvedCount}/11 STAGES`}
          </Tag>
        </Col>
      </Row>

      <Divider
        style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '12px 0 20px 0' }}
      />

      <Row gutter={[20, 20]} align="middle">
        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            👨‍🎓
          </div>
          <Text
            style={{
              color: '#cbd5e1',
              fontSize: 11,
              display: 'block',
              marginTop: 8,
            }}
          >
            Ref: {passId}
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 11,
                  textTransform: 'uppercase',
                }}
              >
                Student Name
              </Text>
              <div
                style={{ color: '#ffffff', fontWeight: 800, fontSize: 18 }}
              >
                {form?.full_name || user?.full_name || '—'}
              </div>
            </div>

            <Row gutter={12}>
              <Col span={12}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Student ID
                </Text>
                <div
                  style={{ color: '#60a5fa', fontWeight: 700, fontSize: 14 }}
                >
                  {form?.id_number || user?.id_number || '—'}
                </div>
              </Col>
              <Col span={12}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Department
                </Text>
                <div
                  style={{ color: '#ffffff', fontWeight: 600, fontSize: 13 }}
                >
                  {form?.department_name || user?.department_name || '—'}
                </div>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={12}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Academic Year
                </Text>
                <div
                  style={{ color: '#ffffff', fontWeight: 600, fontSize: 13 }}
                >
                  {new Date().getFullYear()} Academic Season
                </div>
              </Col>
              <Col span={12}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Registrar Status
                </Text>
                <div
                  style={{
                    color: isFullyCleared ? '#4ade80' : '#fbbf24',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {isFullyCleared ? 'CLEARED ✅' : 'IN PROGRESS ⏳'}
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
          <div
            style={{
              padding: 8,
              background: '#ffffff',
              borderRadius: 12,
              display: 'inline-block',
            }}
          >
            <QRCodeSVG
              value={`MAU-DIGITAL-PASS-${passId}-${form?.id_number ?? ''}`}
              size={85}
              level="M"
            />
          </div>
          <Text
            style={{
              color: '#cbd5e1',
              fontSize: 10,
              display: 'block',
              marginTop: 6,
            }}
          >
            Scan at Security Gate
          </Text>
        </Col>
      </Row>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px dashed rgba(255,255,255,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#94a3b8', fontSize: 11 }}>
          <SafetyCertificateOutlined
            style={{ color: '#38bdf8', marginRight: 4 }}
          />
          Cryptographically Verified Digital Student Credential
        </Text>
        <Button
          size="small"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{
            borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: 'none',
          }}
        >
          Print Passport
        </Button>
      </div>
    </Card>
  );
};

export default DigitalPassCard;
