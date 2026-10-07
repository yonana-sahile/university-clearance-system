import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Tag, Button, Progress, Steps, Alert, Modal, Tabs,
  Table, Badge, Space, message, Spin, Tooltip, Input, Checkbox, Divider, Statistic, Avatar
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DownloadOutlined,
  PrinterOutlined, DollarOutlined, FileTextOutlined, MessageOutlined, ReloadOutlined,
  SafetyCertificateOutlined, UserOutlined, WarningOutlined, QrcodeOutlined,
  CompassOutlined, CheckSquareOutlined, HistoryOutlined, PhoneOutlined,
  ShareAltOutlined, InfoCircleOutlined, TrophyOutlined, ThunderboltOutlined,
  FileDoneOutlined, SendOutlined
} from '@ant-design/icons';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch, getSession } from '../../utils/api';
import type { ClearanceForm, FormStatus } from '../../types';
import ClearanceFormSubmission from '../Forms/ClearanceForm';
import ChatRooms from '../Chat/ChatRooms';
import ChatSystem from '../Chat/ChatSystem';
import ClearanceCertificateModal from '../Certificate/ClearanceCertificateModal';
import DigitalPassCard from '../Student/DigitalPassCard';
import ExitSurveyModal from '../Student/ExitSurveyModal';
import DocumentLocker from '../Student/DocumentLocker';
import OfficeDirectoryModal from '../Pages/OfficeDirectoryModal';
import DisputeAppealSection from '../Student/DisputeAppealSection';
import CostSharingContractSection from '../Student/CostSharingContractSection';
import OfficeQueueBookingSection from '../Student/OfficeQueueBookingSection';
import GraduationDossierModal from '../Certificate/GraduationDossierModal';

const { Title, Text, Paragraph } = Typography;

export default function StudentDashboard() {
  const [form, setForm] = useState<ClearanceForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isExitSurveyOpen, setIsExitSurveyOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null);

  // Graduation Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    library_books: true,
    cafeteria_card: true,
    dorm_key: false,
    cost_sharing: true,
    final_project: true,
    id_card: false,
    academic_creds: true,
    survey_done: false
  });

  const user = getSession();

  useEffect(() => {
    loadStudentForm();
  }, [user]);

  const loadStudentForm = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('student/dashboard/');
      const forms = res.forms || [];
      if (forms.length > 0) {
        setForm(forms[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCertificate = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    setIsCertificateOpen(true);
  };

  // 11 Clearance Stages Definition
  const stages = [
    {
      key: 'department',
      title: '1. Department Head',
      office: 'Software Engineering',
      contact: 'depthead@mau.edu.et',
      phone: '+251 33 221 4050',
      approved: form?.status && form.status !== 'pending_department' && form.status !== 'rejected',
      note: form?.note || form?.department_approved_by || 'Graduation curriculum and project verified.'
    },
    {
      key: 'library',
      title: '2. Main Library',
      office: 'Circulation Desk, Library Wing B',
      contact: 'library@mau.edu.et',
      phone: '+251 33 221 4051',
      approved: form?.status && !['pending_department', 'approved_department', 'requires_library_payment', 'rejected'].includes(form.status),
      note: form?.library_note || 'All borrowed books & reference items returned.'
    },
    {
      key: 'cafeteria',
      title: '3. Student Cafeteria',
      office: 'Catering Office, Student Lounge',
      contact: 'cafeteria@mau.edu.et',
      phone: '+251 33 221 4052',
      approved: form?.status && !['pending_department', 'approved_department', 'approved_library', 'requires_cafeteria_payment', 'rejected'].includes(form.status),
      note: form?.cafeteria_note || 'Dining meal punches & utensils cleared.'
    },
    {
      key: 'psychology',
      title: '4. Counseling & Guidance',
      office: 'Student Services Building, Rm 104',
      contact: 'guidance@mau.edu.et',
      phone: '+251 33 221 4053',
      approved: form?.status && ['approved_psychology', 'approved_sportmaster', 'approved_campuspolice', 'approved_cooperationsharing', 'approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.psychology_note || 'Exit debriefing completed.'
    },
    {
      key: 'sportmaster',
      title: '5. Sport Master',
      office: 'Athletic Center, Equipment Room',
      contact: 'sport@mau.edu.et',
      phone: '+251 33 221 4054',
      approved: form?.status && ['approved_sportmaster', 'approved_campuspolice', 'approved_cooperationsharing', 'approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.sportmaster_note || 'Sport kit and gym locker key verified.'
    },
    {
      key: 'campuspolice',
      title: '6. Campus Police & Security',
      office: 'Main Gate Security Office',
      contact: 'police@mau.edu.et',
      phone: '+251 33 221 4055',
      approved: form?.status && ['approved_campuspolice', 'approved_cooperationsharing', 'approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.campuspolice_note || 'No active discipline or campus infractions.'
    },
    {
      key: 'cooperationsharing',
      title: '7. Cost Sharing Agency',
      office: 'Finance Directorate, Block 3',
      contact: 'costsharing@mau.edu.et',
      phone: '+251 33 221 4056',
      approved: form?.status && ['approved_cooperationsharing', 'approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.cooperationsharing_note || 'Cost sharing liability contract signed.'
    },
    {
      key: 'dopcordinator',
      title: '8. DOP Coordinator',
      office: 'Dean of Program Coordinator Office',
      contact: 'dop@mau.edu.et',
      phone: '+251 33 221 4057',
      approved: form?.status && ['approved_dopcordinator', 'approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.dopcordinator_note || 'Academic program requirements fulfilled.'
    },
    {
      key: 'studentaffairs',
      title: '9. Student Affairs Dean',
      office: 'Dean of Students Directorate',
      contact: 'studentaffairs@mau.edu.et',
      phone: '+251 33 221 4058',
      approved: form?.status && ['approved_studentaffairs', 'approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.studentaffairs_note || 'Student welfare records finalized.'
    },
    {
      key: 'dormitory',
      title: '10. Dormitory Proctor',
      office: 'Block 14 Proctor Office',
      contact: 'proctor@mau.edu.et',
      phone: '+251 33 221 4059',
      approved: form?.status && ['approved_dormitory', 'Cleared by Registrar'].includes(form.status),
      note: form?.dormitory_note || 'Room inspection, beddings & keys returned.'
    },
    {
      key: 'registrar',
      title: '11. University Registrar',
      office: 'Main Administration Building, 1st Floor',
      contact: 'registrar@mau.edu.et',
      phone: '+251 33 221 4000',
      approved: form?.status === 'Cleared by Registrar',
      note: form?.registrar_note || 'Final graduation authorization and certificate issued.'
    },
  ];

  const approvedCount = stages.filter(s => s.approved).length;
  const progressPercent = Math.round((approvedCount / 11) * 100);
  const isFullyCleared = approvedCount === 11 || form?.status === 'Cleared by Registrar';

  // Filtered Stages
  const filteredStages = stages.filter(s => {
    if (filterStatus === 'approved') return s.approved;
    if (filterStatus === 'pending') return !s.approved;
    return true;
  });

  // Calculate Checklist Score
  const checklistCheckedCount = Object.values(checklist).filter(Boolean).length;
  const checklistPercent = Math.round((checklistCheckedCount / 8) * 100);

  // Status Badge Helper
  const getStatusBadge = (status?: FormStatus) => {
    switch (status) {
      case 'Cleared by Registrar':
        return (
          <Tag color="success" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>
            🎉 Cleared by University Registrar
          </Tag>
        );
      case 'rejected':
        return (
          <Tag color="error" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>
            ❌ Clearance Action Required / Resubmit
          </Tag>
        );
      case 'requires_library_payment':
      case 'requires_cafeteria_payment':
      case 'requires_dormitory_payment':
        return (
          <Tag color="warning" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>
            💳 Pending Department Dues Payment
          </Tag>
        );
      default:
        return (
          <Tag color="processing" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>
            ⏳ Sequential Review In Progress ({approvedCount}/11 Cleared)
          </Tag>
        );
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* 1. HERO BANNER */}
      <Card
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%)',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '28px 28px' } }}
      >
        <div style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 250,
          height: 250,
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(37, 99, 235, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <Row align="middle" justify="space-between" gutter={[20, 20]}>
          <Col xs={24} md={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={64}
                src={user?.profile_picture_url}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#f59e0b',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.5)'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: -0.5 }}>
                    {user?.full_name || 'Yonas Sahile'}
                  </Title>
                  <Tag color="gold" style={{ margin: 0, fontWeight: 700, borderRadius: 12 }}>
                    4th Year Senior
                  </Tag>
                </div>
                <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                  ID: <strong style={{ color: '#fbbf24' }}>{user?.id_number || 'AAA1234'}</strong> • {user?.department_name || 'Software Engineering'} • <span style={{ color: '#cbd5e1' }}>{user?.email || 'yonassahile8@gmail.com'}</span>
                </Text>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {getStatusBadge(form?.status)}
              <Tag color="cyan" style={{ borderRadius: 20, padding: '4px 12px' }}>
                Ref: #CLR-2026-{(form?.id || 1001)}
              </Tag>
            </div>
          </Col>

          <Col xs={24} md={9} style={{ textAlign: 'right' }}>
            <Space wrap size={10} style={{ justifyContent: 'flex-end' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadStudentForm}
                loading={loading}
                style={{
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600
                }}
              >
                Refresh
              </Button>

              <Button
                icon={<QrcodeOutlined />}
                onClick={() => setIsQRModalOpen(true)}
                style={{
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600
                }}
              >
                QR Pass
              </Button>

              <Button
                icon={<PrinterOutlined />}
                onClick={() => setIsSlipModalOpen(true)}
                style={{
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600
                }}
              >
                Clearance Slip
              </Button>

              <Button
                icon={<FileDoneOutlined />}
                onClick={() => setIsDossierOpen(true)}
                style={{
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                }}
              >
                Graduation Dossier (4-in-1)
              </Button>

              {isFullyCleared && (
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  onClick={handleOpenCertificate}
                  style={{
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 6px 18px rgba(16, 185, 129, 0.45)'
                  }}
                >
                  Digital Certificate
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. TOP METRIC STATS ROW */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Offices Cleared</Text>
              <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{approvedCount}</span>
              <span style={{ fontSize: 14, color: '#64748b' }}>/ 11 Offices</span>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor={{ '0%': '#f59e0b', '100%': '#10b981' }}
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Pending Balance</Text>
              <DollarOutlined style={{ color: form?.status.includes('payment') ? '#f59e0b' : '#10b981', fontSize: 18 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: form?.status.includes('payment') ? '#d97706' : '#10b981' }}>
                {form?.status.includes('payment') ? '350.00' : '0.00'}
              </span>
              <span style={{ fontSize: 14, color: '#64748b' }}>ETB</span>
            </div>
            <Text style={{ fontSize: 12, color: form?.status.includes('payment') ? '#b45309' : '#10b981', fontWeight: 600, display: 'block', marginTop: 6 }}>
              {form?.status.includes('payment') ? '⚠️ Overdue fine at Library' : '✓ All Department Dues Settled'}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Current Turn</Text>
              <CompassOutlined style={{ color: '#3b82f6', fontSize: 18 }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isFullyCleared ? 'Registrar Completed' : stages.find(s => !s.approved)?.title || 'All Completed'}
            </div>
            <Text style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 6 }}>
              {isFullyCleared ? 'Graduation verified' : 'Awaiting officer sign-off'}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Readiness Score</Text>
              <TrophyOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{checklistPercent}%</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>Checklist Done</span>
            </div>
            <Text style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 6 }}>
              {checklistCheckedCount} of 8 exit tasks completed
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 3. MAIN NAVIGATION TABS */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'overview',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <ThunderboltOutlined style={{ color: '#f59e0b' }} />
                Clearance Roadmap & Offices
              </span>
            ),
            children: (
              <div>
                {loading ? (
                  <div style={{ padding: 60, textAlign: 'center' }}><Spin size="large" /></div>
                ) : !form ? (
                  <Card style={{ textAlign: 'center', padding: 48, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                    <FileTextOutlined style={{ fontSize: 56, color: '#f59e0b', marginBottom: 16 }} />
                    <Title level={3}>No Active Clearance Application</Title>
                    <Paragraph type="secondary" style={{ maxWidth: 500, margin: '0 auto 20px' }}>
                      You have not submitted a clearance application for this semester yet. Get started by completing your student information form.
                    </Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setActiveTab('apply')}
                      style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', fontWeight: 700 }}
                    >
                      Submit Clearance Application Now
                    </Button>
                  </Card>
                ) : (
                  <div>
                    {/* DUES PAYMENT ALERT */}
                    {form.status.includes('payment') && (
                      <Alert
                        message="Department Dues Payment Required"
                        description="Main Library records indicate an outstanding balance of 350.00 ETB for an overdue book. Please submit your payment slip through the Payments portal to continue."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24, borderRadius: 14, border: '1px solid #fde68a' }}
                        action={
                          <Button size="middle" type="primary" onClick={() => window.location.href = '/payment'} style={{ borderRadius: 8, background: '#d97706', border: 'none' }}>
                            Pay Dues Now
                          </Button>
                        }
                      />
                    )}

                    {/* SMART ADVISOR BANNER */}
                    <Card
                      style={{
                        marginBottom: 24,
                        borderRadius: 18,
                        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
                        border: '1px solid #bfdbfe'
                      }}
                      styles={{ body: { padding: '18px 24px' } }}
                    >
                      <Row align="middle" justify="space-between" gutter={[16, 16]}>
                        <Col xs={24} md={18}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: '#2563eb',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18
                            }}>
                              💡
                            </div>
                            <div>
                              <Text strong style={{ color: '#1e3a8a', fontSize: 15, display: 'block' }}>
                                Smart Clearance Advisor
                              </Text>
                              <Text style={{ color: '#475569', fontSize: 13 }}>
                                {isFullyCleared
                                  ? "Congratulations! Your university clearance is 100% completed. You are authorized to graduate and collect your temporary degree from the Registrar."
                                  : `Next required sign-off is at ${stages.find(s => !s.approved)?.title || 'Next Office'}. Make sure all requirements for this department are fulfilled.`
                                }
                              </Text>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                          <Button
                            icon={<PhoneOutlined />}
                            onClick={() => setIsOfficeModalOpen(true)}
                            style={{ borderRadius: 10, fontWeight: 600, borderColor: '#3b82f6', color: '#2563eb' }}
                          >
                            Office Directory
                          </Button>
                        </Col>
                      </Row>
                    </Card>

                    {/* FILTER TOOLBAR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                          11-Office Verification Timeline
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Progressively cleared in official university workflow sequence
                        </Text>
                      </div>

                      <Space>
                        <Button
                          size="small"
                          type={filterStatus === 'all' ? 'primary' : 'default'}
                          onClick={() => setFilterStatus('all')}
                          style={{ borderRadius: 8 }}
                        >
                          All ({stages.length})
                        </Button>
                        <Button
                          size="small"
                          type={filterStatus === 'approved' ? 'primary' : 'default'}
                          onClick={() => setFilterStatus('approved')}
                          style={{ borderRadius: 8 }}
                        >
                          Cleared ({approvedCount})
                        </Button>
                        <Button
                          size="small"
                          type={filterStatus === 'pending' ? 'primary' : 'default'}
                          onClick={() => setFilterStatus('pending')}
                          style={{ borderRadius: 8 }}
                        >
                          Pending ({stages.length - approvedCount})
                        </Button>
                      </Space>
                    </div>

                    {/* STAGE CARDS GRID */}
                    <Row gutter={[16, 16]}>
                      {filteredStages.map((stage) => (
                        <Col xs={24} sm={12} lg={8} key={stage.key}>
                          <Card
                            hoverable
                            style={{
                              borderRadius: 16,
                              border: stage.approved ? '1px solid #bbf7d0' : '1px solid #fde68a',
                              background: stage.approved ? '#f0fdf4' : '#fffbeb',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                              transition: 'all 0.25s ease'
                            }}
                            styles={{ body: { padding: '18px 20px' } }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                              <div>
                                <Text strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>
                                  {stage.title}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {stage.office}
                                </Text>
                              </div>
                              {stage.approved ? (
                                <Tag color="success" style={{ margin: 0, borderRadius: 12, fontWeight: 700 }}>
                                  <CheckCircleOutlined /> Cleared
                                </Tag>
                              ) : (
                                <Tag color="warning" style={{ margin: 0, borderRadius: 12, fontWeight: 700 }}>
                                  <ClockCircleOutlined /> Pending
                                </Tag>
                              )}
                            </div>

                            <div style={{
                              fontSize: 12,
                              color: stage.approved ? '#166534' : '#854d0e',
                              background: stage.approved ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)',
                              padding: '8px 12px',
                              borderRadius: 8,
                              marginBottom: 12,
                              border: stage.approved ? '1px solid #dcfce7' : '1px solid #fef3c7'
                            }}>
                              <strong>Officer Note:</strong> {stage.note}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b' }}>
                              <span>📞 {stage.phone}</span>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                  setSelectedChatRoom({
                                    id: 1,
                                    name: stage.title,
                                    staff_role: stage.key,
                                    staff_name: 'Office Representative',
                                    student: { id: 101, full_name: user?.full_name || 'Yonas Sahile', id_number: user?.id_number || 'AAA1234' }
                                  });
                                  setActiveTab('chat');
                                }}
                                style={{ padding: 0, fontSize: 12, fontWeight: 600 }}
                              >
                                Message Office →
                              </Button>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'checklist',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <CheckSquareOutlined style={{ color: '#10b981' }} />
                Graduation Checklist ({checklistCheckedCount}/8)
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 20, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 28 } }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={16}>
                    <Title level={4} style={{ marginBottom: 6, fontWeight: 800 }}>
                      Graduating Student Exit Checklist
                    </Title>
                    <Paragraph type="secondary">
                      Ensure each requirement below is physically handed over or completed with respective directorates before collecting your degree certificate.
                    </Paragraph>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                      {[
                        { key: 'library_books', title: 'Return all borrowed Library Textbooks & Research Theses', dept: 'Main Library' },
                        { key: 'cafeteria_card', title: 'Surrender Cafeteria Meal Ticket & Lounge Card', dept: 'Student Cafeteria' },
                        { key: 'dorm_key', title: 'Submit Dormitory Room Key & Bedding Clearance to Proctor', dept: 'Dormitory Service' },
                        { key: 'cost_sharing', title: 'Sign Cost Sharing Repayment Obligation Contract', dept: 'Cost Sharing Bureau' },
                        { key: 'final_project', title: 'Upload Final Degree Capstone Project & Advisor Grade', dept: 'Department Head' },
                        { key: 'id_card', title: 'Surrender University Student ID Card for Cancellation', dept: 'Campus Security' },
                        { key: 'academic_creds', title: 'Verify Student Transcript & Minimum CGPA Requirements', dept: 'Registrar Office' },
                        { key: 'survey_done', title: 'Complete Graduating Student Experience Exit Survey', dept: 'Student Affairs' },
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            borderRadius: 12,
                            background: checklist[item.key] ? '#f0fdf4' : '#f8fafc',
                            border: checklist[item.key] ? '1px solid #86efac' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Checkbox checked={checklist[item.key]} onChange={e => e.stopPropagation()} />
                            <div>
                              <Text strong style={{ color: checklist[item.key] ? '#15803d' : '#1e293b', fontSize: 14 }}>
                                {item.title}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                Responsible: {item.dept}
                              </Text>
                            </div>
                          </div>
                          <Tag color={checklist[item.key] ? 'success' : 'default'} style={{ borderRadius: 8 }}>
                            {checklist[item.key] ? 'Done' : 'Action Needed'}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      style={{
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        color: '#fff',
                        textAlign: 'center'
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <TrophyOutlined style={{ fontSize: 48, color: '#f59e0b', marginBottom: 12 }} />
                      <Title level={4} style={{ color: '#fff', margin: 0 }}>
                        Exit Readiness Score
                      </Title>
                      <div style={{ fontSize: 44, fontWeight: 900, color: '#fbbf24', margin: '12px 0 4px' }}>
                        {checklistPercent}%
                      </div>
                      <Text style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 20 }}>
                        {checklistCheckedCount} of 8 tasks ready for graduation audit
                      </Text>

                      <Button
                        type="primary"
                        block
                        icon={<FileTextOutlined />}
                        onClick={() => setIsExitSurveyOpen(true)}
                        style={{
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          border: 'none',
                          fontWeight: 700,
                          height: 42
                        }}
                      >
                        Take Graduating Exit Survey
                      </Button>
                    </Card>
                  </Col>
                </Row>
              </Card>
            )
          },
          {
            key: 'passport',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <QrcodeOutlined style={{ color: '#3b82f6' }} />
                Digital Clearance Passport
              </span>
            ),
            children: <DigitalPassCard user={user} form={form} approvedCount={approvedCount} />
          },
          {
            key: 'locker',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <FileDoneOutlined style={{ color: '#6366f1' }} />
                Document Locker & Receipts
              </span>
            ),
            children: <DocumentLocker user={user} form={form} />
          },
          {
            key: 'apply',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <FileTextOutlined style={{ color: '#ec4899' }} />
                Apply / Resubmit Clearance
              </span>
            ),
            children: <ClearanceFormSubmission onSubmitted={() => { loadStudentForm(); setActiveTab('overview'); }} />
          },
          {
            key: 'costsharing',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <FileDoneOutlined style={{ color: '#2563eb' }} />
                Cost Sharing Agreement
              </span>
            ),
            children: <CostSharingContractSection user={user} form={form} onFormUpdated={loadStudentForm} />
          },
          {
            key: 'disputes',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <WarningOutlined style={{ color: '#f59e0b' }} />
                Dispute Appeals
              </span>
            ),
            children: <DisputeAppealSection user={user} form={form} onFormUpdated={loadStudentForm} />
          },
          {
            key: 'queue',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <ClockCircleOutlined style={{ color: '#10b981' }} />
                Office Queues & Booking
              </span>
            ),
            children: <OfficeQueueBookingSection user={user} form={form} />
          },
          {
            key: 'chat',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <MessageOutlined style={{ color: '#06b6d4' }} />
                Live Support Chat
              </span>
            ),
            children: (
              <Row gutter={24}>
                <Col xs={24} md={10}>
                  <ChatRooms onSelectRoom={room => setSelectedChatRoom(room)} />
                </Col>
                <Col xs={24} md={14}>
                  {selectedChatRoom ? (
                    <ChatSystem room={selectedChatRoom} />
                  ) : (
                    <Card style={{ textAlign: 'center', padding: 60, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                      <MessageOutlined style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }} />
                      <Title level={4}>Department Live Chat</Title>
                      <Text type="secondary">Select a department chat room on the left to start real-time messaging with university clearance officers.</Text>
                    </Card>
                  )}
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* 4. MODALS */}
      {/* GRADUATION DOSSIER MODAL */}
      <GraduationDossierModal
        open={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        form={form}
        user={user}
        stages={stages}
      />
      {/* A. DIGITAL CERTIFICATE MODAL */}
      <ClearanceCertificateModal
        open={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        form={form}
      />

      {/* B. GRADUATING EXIT SURVEY MODAL */}
      <ExitSurveyModal
        open={isExitSurveyOpen}
        onClose={() => setIsExitSurveyOpen(false)}
        onCompleted={() => {
          message.success('Exit survey successfully recorded! University Registrar notified.');
          setChecklist(prev => ({ ...prev, survey_done: true }));
          setIsExitSurveyOpen(false);
        }}
      />

      {/* C. QR PASS QUICK MODAL */}
      <Modal
        title="Student Quick Verification QR Pass"
        open={isQRModalOpen}
        onCancel={() => setIsQRModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsQRModalOpen(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ padding: 16, background: '#ffffff', borderRadius: 16, display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
            <QRCodeSVG value={`MAU-CLR-2026-${user?.id_number || 'AAA1234'}-${user?.full_name || 'Yonas Sahile'}`} size={180} />
          </div>
          <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
            {user?.full_name || 'Yonas Sahile'}
          </Title>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
            ID: {user?.id_number || 'AAA1234'} • {user?.department_name || 'Software Engineering'}
          </Text>
          <Tag color={isFullyCleared ? 'success' : 'warning'} style={{ marginTop: 10, borderRadius: 12 }}>
            Status: {isFullyCleared ? '100% Cleared by Registrar' : `${approvedCount} of 11 Approved`}
          </Tag>
        </div>
      </Modal>

      {/* D. PRINTABLE CLEARANCE SLIP MODAL */}
      <Modal
        title="Official Student Clearance Summary Slip"
        open={isSlipModalOpen}
        onCancel={() => setIsSlipModalOpen(false)}
        width={700}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()} style={{ borderRadius: 8 }}>
            Print Official Slip
          </Button>,
          <Button key="close" onClick={() => setIsSlipModalOpen(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>
        ]}
      >
        <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
            <img src="/images/MAU.jpg" alt="MAU" style={{ width: 50, height: 50, borderRadius: 10, marginBottom: 6, objectFit: 'contain', background: '#ffffff', padding: 2 }} />
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>MEKDELA AMBA UNIVERSITY</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>OFFICE OF THE UNIVERSITY REGISTRAR • CLEARANCE DIVISION</div>
          </div>

          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col span={12}><Text strong>Student Name:</Text> {user?.full_name || 'Yonas Sahile'}</Col>
            <Col span={12}><Text strong>Student ID:</Text> {user?.id_number || 'AAA1234'}</Col>
            <Col span={12}><Text strong>College:</Text> College of Computing & Informatics</Col>
            <Col span={12}><Text strong>Department:</Text> Software Engineering</Col>
            <Col span={12}><Text strong>Academic Year:</Text> 2026</Col>
            <Col span={12}><Text strong>Clearance Reference:</Text> #CLR-2026-{(form?.id || 1001)}</Col>
          </Row>

          <Table
            size="small"
            pagination={false}
            dataSource={stages.map((s, i) => ({
              key: s.key,
              no: i + 1,
              office: s.title,
              status: s.approved ? 'CLEARED' : 'PENDING',
              note: s.note
            }))}
            columns={[
              { title: '#', dataIndex: 'no', width: 40 },
              { title: 'Office / Directorate', dataIndex: 'office' },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (val: string) => (
                  <Tag color={val === 'CLEARED' ? 'success' : 'warning'}>{val}</Tag>
                )
              },
              { title: 'Officer Sign-off Note', dataIndex: 'note' }
            ]}
          />

          <div style={{ marginTop: 20, textAlign: 'right', fontSize: 11, color: '#64748b' }}>
            Generated from MAU Online Clearance Portal • Authenticated Record
          </div>
        </div>
      </Modal>

      {/* E. OFFICE DIRECTORY MODAL */}
      <OfficeDirectoryModal
        open={isOfficeModalOpen}
        onClose={() => setIsOfficeModalOpen(false)}
      />
    </div>
  );
}
