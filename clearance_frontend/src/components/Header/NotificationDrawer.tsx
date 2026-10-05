import React from 'react';
import { Drawer, List, Typography, Badge, Tag, Button, Empty } from 'antd';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  time: string;
  read: boolean;
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 18 }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#d97706', fontSize: 18 }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#dc2626', fontSize: 18 }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#2563eb', fontSize: 18 }} />;
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={8}>
            <BellOutlined style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 800 }}>Clearance Notifications</span>
          </Space>
          {notifications.some(n => !n.read) && (
            <Button size="small" type="link" onClick={onMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size={380}
    >
      {notifications.length === 0 ? (
        <Empty description="No clearance notifications yet" style={{ marginTop: 60 }} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                marginBottom: 8,
                background: item.read ? '#f8fafc' : '#f0f9ff',
                borderLeft: `4px solid ${
                  item.type === 'success' ? '#16a34a' : item.type === 'warning' ? '#d97706' : '#2563eb'
                }`,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <div style={{ marginTop: 2 }}>{getIcon(item.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13, color: '#0f172a' }}>{item.title}</Text>
                    {!item.read && <Badge status="processing" />}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', margin: '4px 0' }}>
                    {item.message}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10, color: '#94a3b8' }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {item.time}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default NotificationDrawer;
import { Space } from 'antd';
