import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Badge, Tag, Typography, Button, Spin, Input } from 'antd';
import { MessageOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { apiFetch, getSession } from '../../utils/api';
import { ChatRoom } from '../../types';

const { Text } = Typography;

interface Props {
  onSelectRoom: (room: ChatRoom) => void;
  selectedRoomId?: string | number;
}

export default function ChatRooms({ onSelectRoom, selectedRoomId }: Props) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const user = getSession();

  useEffect(() => {
    loadRooms();
  }, [user]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('chat/rooms/');
      setRooms(Array.isArray(res) ? res : res.rooms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rooms.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.staff_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card
      title={
        <span style={{ fontWeight: 700 }}>
          <MessageOutlined style={{ color: '#2563eb', marginRight: 8 }} />
          Clearance Support Chat Rooms
        </span>
      }
      style={{ borderRadius: 16 }}
      styles={{ body: { padding: 12 } }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        placeholder="Search conversation..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 12, borderRadius: 10 }}
      />

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((room: ChatRoom) => {
            const isSelected = room.id === selectedRoomId;
            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  borderLeft: isSelected ? '4px solid #2563eb' : 'none',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <Badge count={room.unread_count}>
                  <Avatar icon={<UserOutlined />} style={{ background: '#2563eb' }} />
                </Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>{room.name || room.staff_name || room.student_name}</Text>
                    {room.last_message_time && (
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {new Date(room.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </div>
                  <Text type="secondary" ellipsis style={{ fontSize: 12, display: 'block' }}>
                    {room.last_message || 'Start messaging...'}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
