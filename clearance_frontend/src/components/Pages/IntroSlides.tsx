import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Carousel, Typography, Row, Col, Space } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CheckCircleOutlined, ThunderboltOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function IntroSlides() {
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "One Central Place for Every Campus Office",
      subtitle: "Eliminate line queues and physical paper signatures",
      description: "From Department Head and Library to Cafeteria, Psychology, Sports, Campus Police, Dormitory, and Registrar — submit one digital form and watch all 11 campus offices process your request in sequence.",
      icon: <TeamOutlined style={{ fontSize: 64, color: '#3b82f6' }} />,
      tag: "100% Digital Workflow"
    },
    {
      title: "Instant Status Tracking & Notifications",
      subtitle: "Never wonder where your clearance form is",
      description: "Get real-time color-coded indicators for each approving office. If an office notes pending book dues or room damage, upload payment receipts directly through Telebirr or CBE Birr with 1-click verification.",
      icon: <ThunderboltOutlined style={{ fontSize: 64, color: '#10b981' }} />,
      tag: "Real-time Monitoring"
    },
    {
      title: "Verified Digital Clearance Certificate",
      subtitle: "Instant official graduation certificate issuance",
      description: "Once the Registrar approves your final clearance, download an official, tamper-proof PDF clearance certificate with QR signature verification anytime.",
      icon: <SafetyOutlined style={{ fontSize: 64, color: '#8b5cf6' }} />,
      tag: "Instant Certificate"
    }
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.2) 0%, transparent 70%), #0b0f19',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 720,
          borderRadius: 24,
          background: 'rgba(30, 41, 59, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}
        styles={{ body: { padding: '48px 36px' } }}
      >
        <div style={{ marginBottom: 24 }}>
          {slides[slideIndex].icon}
        </div>

        <span style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: 20,
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 12
        }}>
          {slides[slideIndex].tag}
        </span>

        <Title level={2} style={{ color: '#ffffff', fontWeight: 800, marginBottom: 8 }}>
          {slides[slideIndex].title}
        </Title>

        <Text style={{ color: '#94a3b8', fontSize: 16, display: 'block', marginBottom: 20 }}>
          {slides[slideIndex].subtitle}
        </Text>

        <Paragraph style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6, marginBottom: 36 }}>
          {slides[slideIndex].description}
        </Paragraph>

        {/* PROGRESS DOTS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setSlideIndex(idx)}
              style={{
                width: idx === slideIndex ? 32 : 10,
                height: 10,
                borderRadius: 5,
                background: idx === slideIndex ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* NAVIGATION CONTROLS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex(s => s - 1)}
            icon={<ArrowLeftOutlined />}
            style={{ borderRadius: 10 }}
          >
            Previous
          </Button>

          {slideIndex < slides.length - 1 ? (
            <Button
              type="primary"
              onClick={() => setSlideIndex(s => s + 1)}
              icon={<ArrowRightOutlined />}
              style={{
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                fontWeight: 700
              }}
            >
              Next Feature
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate('/login')}
              icon={<CheckCircleOutlined />}
              style={{
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: 700,
                padding: '0 24px'
              }}
            >
              Get Started Now
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
