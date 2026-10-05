import React from 'react';
import { Card, Button, Typography, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ToolOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

export default function MaintenancePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <Card style={{ maxWidth: 520, borderRadius: 20, textAlign: 'center', padding: 20 }}>
        <Result
          icon={<ToolOutlined style={{ color: '#faad14', fontSize: 64 }} />}
          title="Scheduled System Maintenance"
          subTitle="Mekdela Amba University Online Clearance System is currently undergoing routine database indexing and performance optimization."
          extra={[
            <Button
              type="primary"
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              style={{ borderRadius: 10 }}
            >
              Check System Status
            </Button>,
            <Button key="home" onClick={() => navigate('/')} style={{ borderRadius: 10 }}>
              Back to Home
            </Button>
          ]}
        />
      </Card>
    </div>
  );
}
