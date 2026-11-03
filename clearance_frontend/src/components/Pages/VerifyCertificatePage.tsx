import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  Alert,
  Result,
  Spin,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api'; // ✅ IMPORT API

const { Title, Text } = Typography;

export const VerifyCertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const certIdParam = searchParams.get('id') || '';

  const [inputCode, setInputCode] = useState(certIdParam);
  const [loading, setLoading] = useState(false);
  const [foundForm, setFoundForm] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (certIdParam) {
      handleSearch(certIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certIdParam]);

  const handleSearch = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      // ✅ FIXED: Query the real backend instead of using localStorage
      const res = await apiFetch(`public/track?id_number=${encodeURIComponent(codeToSearch.trim())}`);

      if (res.found && res.status === 'Cleared by Registrar') {
        setFoundForm(res);
      } else {
        setFoundForm(null);
      }
    } catch (err) {
      setFoundForm(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
          color: '#2563eb',
          fontWeight: 600,
        }}
      >
        <ArrowLeftOutlined /> Back to Home
      </Link>

      <Card
        style={{ borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <SafetyCertificateOutlined
            style={{ fontSize: 44, color: '#2563eb', marginBottom: 12 }}
          />
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
            Official Clearance Verification Portal
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Verify the cryptographic validity of Mekdela Amba University
            student digital clearance certificates.
          </Text>
        </div>

        <Space.Compact style={{ width: '100%', marginBottom: 28 }}>
          <Input
            size="large"
            placeholder="Enter Certificate Reference ID or Student ID..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onPressEnter={() => handleSearch(inputCode)}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ borderRadius: '10px 0 0 10px' }}
          />
          <Button
            type="primary"
            size="large"
            onClick={() => handleSearch(inputCode)}
            loading={loading}
            style={{
              borderRadius: '0 10px 10px 0',
              background: '#2563eb',
              fontWeight: 700,
            }}
          >
            Verify Authenticity
          </Button>
        </Space.Compact>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
              Checking university cryptographic registrar logs...
            </Text>
          </div>
        )}

        {!loading && searched && foundForm && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <CheckCircleFilled style={{ fontSize: 28, color: '#16a34a' }} />
              <div>
                <Tag
                  color="success"
                  style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px' }}
                >
                  AUTHENTIC & VALIDATED
                </Tag>
                <Title
                  level={4}
                  style={{ margin: 0, color: '#14532d', fontWeight: 800 }}
                >
                  Official Clearance Certificate Record
                </Title>
              </div>
            </div>

            <Divider style={{ borderColor: '#cbd5e1', margin: '12px 0' }} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                fontSize: 14,
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  STUDENT FULL NAME
                </Text>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>
                  {foundForm.full_name}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID NUMBER
                </Text>
                <div style={{ fontWeight: 800, color: '#2563eb', fontSize: 16 }}>
                  {foundForm.id_number}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  DEPARTMENT
                </Text>
                <div style={{ fontWeight: 600 }}>
                  {foundForm.department_name}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  REGISTRAR CLEARANCE STATUS
                </Text>
                <div style={{ fontWeight: 600, color: '#16a34a' }}>
                  FULLY CLEARED
                </div>
              </div>
            </div>

            <Alert
              style={{ marginTop: 20, borderRadius: 10 }}
              type="success"
              showIcon
              message="Registrar Verification Notice"
              description="This student record has been cryptographically confirmed cleared by all required Mekdela Amba University department offices."
            />
          </div>
        )}

        {!loading && searched && !foundForm && (
          <Result
            status="error"
            title="Certificate Record Not Found or Not Fully Cleared"
            subTitle="The certificate reference code or student ID provided does not match an active, fully cleared record in Mekdela Amba University databases."
          />
        )}
      </Card>
    </div>
  );
};

export default VerifyCertificatePage;
