import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, Typography, Space, Upload, message, Tooltip } from 'antd';
import { SendOutlined, PaperClipOutlined, UserOutlined, SmileOutlined, RobotOutlined } from '@ant-design/icons';
import { apiFetch, getSession } from '../../utils/api';
import { ChatMessage, ChatRoom } from '../../types';

const { Text } = Typography;

interface Props {
  room: ChatRoom;
}

export default function ChatSystem({ room }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getSession();

  useEffect(() => {
    loadMessages();
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`chat/messages/${room.id}/`);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');

    const optimistic: ChatMessage = {
      id: Date.now(),
      room_id: room.id,
      content: textToSend,
      created_at: new Date().toISOString(),
      is_own: true,
      sender: {
        id: user?.id || 101,
        username: user?.username || 'user',
        full_name: user?.full_name || 'User',
        role: user?.role || 'student'
      }
    };

    setMessages(prev => [...prev, optimistic]);

    try {
      await apiFetch('chat/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          content: textToSend
        })
      });
    } catch (err) {
      message.error('Failed to send message');
    }
  };

  return (
    <Card
      title={
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: '#2563eb' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{room.name || room.staff_name || room.student_name}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Online Support Assistant</Text>
          </div>
        </Space>
      }
      style={{ borderRadius: 16 }}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: 480 } }}
    >
      {/* MESSAGES LIST */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f8fafc' }}>
        {messages.map((msg, idx) => {
          const isOwn = msg.is_own || msg.sender?.username === user?.username;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: 12
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: isOwn ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: isOwn ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#ffffff',
                color: isOwn ? '#ffffff' : '#1e293b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: isOwn ? 'none' : '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, opacity: 0.8 }}>
                  {msg.sender?.full_name || msg.sender?.username || 'Officer'}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.content}</div>
                <div style={{ fontSize: 9, textAlign: 'right', marginTop: 4, opacity: 0.7 }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: 8 }}>
        <Input
          size="large"
          placeholder="Type your message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onPressEnter={handleSend}
          style={{ borderRadius: 20 }}
        />
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleSend}
          style={{
            borderRadius: 20,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            border: 'none',
            padding: '0 20px'
          }}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}
