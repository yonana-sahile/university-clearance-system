import React, { useState } from 'react';
import { Input, Button, Avatar, Typography, Tag, Card } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ChatMsg {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AIChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: 'ai',
      text: ' selam! I am the Mekdela Amba University AI Clearance Assistant. How can I assist you with your clearance steps, fines, or Registrar approval today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMsg = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentQuery = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      let responseText = "I'm here to help! You can check your clearance progress on your Student Dashboard or contact your department officer directly in the chat rooms.";

      if (currentQuery.includes('payment') || currentQuery.includes('telebirr') || currentQuery.includes('fine') || currentQuery.includes('fee') || currentQuery.includes('ከፍያ')) {
        responseText = "💳 **Payment Steps:**\n1. Navigate to the 'Payments' page from your dashboard.\n2. Choose Telebirr Mobile Money or CBE Birr.\n3. Pay to MAU Official Account (Telebirr: 0921459991) using your Student ID as transaction memo.\n4. Submit the transaction reference number on the portal for instant verification!";
      } else if (currentQuery.includes('library') || currentQuery.includes('book') || currentQuery.includes('መጽሐፍ')) {
        responseText = "📚 **Library Clearance:** Ensure all borrowed textbooks are returned to the Main Library. If you lost a book, settle the replacement fine via the Payments portal.";
      } else if (currentQuery.includes('registrar') || currentQuery.includes('seal') || currentQuery.includes('certificate') || currentQuery.includes('ሰርተፊኬት')) {
        responseText = "🎓 **Registrar Seal & Certificate:** Once all 10 department approvals (Dept Head, Library, Cafeteria, Dormitory, Counseling, Sports, Police, Cost-Sharing, DOP, Affairs) are granted, the Registrar will grant your official Digital Clearance Seal! You can then view & download your Official Certificate with QR verification code!";
      } else if (currentQuery.includes('dorm') || currentQuery.includes('room') || currentQuery.includes('key') || currentQuery.includes('ዶርም')) {
        responseText = "🏠 **Dormitory Clearance:** Visit your proctor office to inspect your room condition, hand in key and mattress. Once verified, the proctor will clear you in the system.";
      } else if (currentQuery.includes('hello') || currentQuery.includes('hi') || currentQuery.includes('ሰላም')) {
        responseText = "ሰላም! Welcome to MAU Clearance Assistant. You can ask me about clearance requirements, Telebirr payment methods, office hours, or certificate downloads!";
      }

      const aiMsg: ChatMsg = {
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fafafa', borderRadius: 12 }}>
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar icon={<RobotOutlined />} style={{ background: '#3b82f6' }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>MAU AI Clearance Assistant</div>
          <Tag color="green" style={{ fontSize: 10, margin: 0 }}>⚡ Online 24/7</Tag>
        </div>
      </div>

      <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              gap: 8,
              flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <Avatar
              size="small"
              icon={m.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
              style={{ background: m.sender === 'user' ? '#2563eb' : '#3b82f6' }}
            />
            <div
              style={{
                background: m.sender === 'user' ? '#2563eb' : '#ffffff',
                color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                padding: '10px 14px',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: 13,
                whiteSpace: 'pre-wrap'
              }}
            >
              {m.text}
              <div style={{ fontSize: 9, opacity: 0.7, textAlign: 'right', marginTop: 4 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '0 0 12px 12px', display: 'flex', gap: 8 }}>
        <Input
          placeholder="Ask AI about clearance, Telebirr payment, or offices..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={handleSend}
          style={{ borderRadius: 20 }}
        />
        <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} style={{ background: '#2563eb' }} />
      </div>
    </div>
  );
};

export default AIChatAssistant;
