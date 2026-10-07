import React, { useState } from 'react';
import { Button, Popover, Badge, Tabs } from 'antd';
import { MessageOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import ChatRooms from './ChatRooms';
import ChatSystem from './ChatSystem';
import AIChatAssistant from './AIChatAssistant';
import type { ChatRoom } from '../../types';

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  const content = (
    <div style={{ width: 380, height: 480 }}>
      <Tabs
        defaultActiveKey="ai"
        style={{ height: '100%' }}
        items={[
          {
            key: 'ai',
            label: (
              <span>
                <RobotOutlined style={{ marginRight: 6, color: '#2563eb' }} />
                AI Assistant
              </span>
            ),
            children: <AIChatAssistant />,
          },
          {
            key: 'staff',
            label: (
              <span>
                <UserOutlined style={{ marginRight: 6, color: '#16a34a' }} />
                Staff Support
              </span>
            ),
            children: selectedRoom ? (
              <div style={{ height: 420 }}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setSelectedRoom(null)}
                  style={{ padding: 0, marginBottom: 8 }}
                >
                  ← Back to Chat Rooms
                </Button>
                <ChatSystem room={selectedRoom} />
              </div>
            ) : (
              <ChatRooms onSelectRoom={(room) => setSelectedRoom(room)} />
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="topRight"
    >
      <Badge count={1} offset={[-4, 4]}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined style={{ fontSize: 22 }} />}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 999,
            width: 58,
            height: 58,
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            border: 'none',
          }}
        />
      </Badge>
    </Popover>
  );
}
