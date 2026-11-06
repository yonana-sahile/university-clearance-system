import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Tag, Button, Progress, Steps, Alert, Modal, Tabs,
  Table, Badge, Space, message, Spin, Tooltip, Input, Checkbox, Divider, Statistic, Avatar, Collapse, Form
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DownloadOutlined,
  PrinterOutlined, DollarOutlined, FileTextOutlined, MessageOutlined, ReloadOutlined,
  SafetyCertificateOutlined, UserOutlined, WarningOutlined, QrcodeOutlined,
  CompassOutlined, CheckSquareOutlined, HistoryOutlined, PhoneOutlined,
  ShareAltOutlined, InfoCircleOutlined, TrophyOutlined, ThunderboltOutlined,
  FileDoneOutlined, SendOutlined, LockOutlined, PlusOutlined, MinusCircleOutlined
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
const { Panel } = Collapse;

// ✅ DETAILED PRE-CLEARANCE CHECKLIST DATA
const PRE_CLEARANCE_DATA: Record<string, { title: string; items: { id: string; label: string; desc: string }[] }> = {
  departmenthead: {
    title: 'Department Head',
    items: [
      { id: 'dept_thesis', label: 'Senior Thesis / Capstone Project', desc: 'Submitted final hardbound copy of thesis/project with all source code.' },
      { id: 'dept_sig', label: 'Advisor & Examiner Signatures', desc: 'All required signatures from primary advisor and examiners are complete.' },
      { id: 'dept_lab', label: 'Lab Tools & Equipment Audit', desc: 'All hardware, kits, sensors, and testing tools returned.' },
      { id: 'dept_acad', label: 'Academic Audit', desc: 'No missing grades (Incomplete/NG), all field practice reports submitted.' },
    ]
  },
  librarian: {
    title: 'Main Library',
    items: [
      { id: 'lib_books', label: 'Borrowed Books Return', desc: 'Every physical book, reference material, or journal returned.' },
      { id: 'lib_fines', label: 'Overdue Fines & Damage Settlement', desc: 'Zero outstanding fines. Lost books paid for.' },
      { id: 'lib_elib', label: 'E-Library & Digital Accounts', desc: 'Digital lab cards and portal accesses closed.' },
    ]
  },
  cafeteria: {
    title: 'Student Cafeteria',
    items: [
      { id: 'cafe_coupon', label: 'Meal Coupon / Pass Return', desc: 'Dining hall meal coupons, monthly pass cards, or badges surrendered.' },
      { id: 'cafe_asset', label: 'Dining Asset Audit', desc: 'No cafeteria property (trays, cutlery) remains under your name.' },
    ]
  },
  dormitory: {
    title: 'Dormitory Proctor',
    items: [
      { id: 'dorm_furniture', label: 'Furniture & Room Inventory Inspection', desc: 'Mattress, bed frame, study desks, chairs, and wardrobes are intact.' },
      { id: 'dorm_key', label: 'Facility & Key Inspection', desc: 'Original room key returned. No damage to locks, glass, or walls.' },
      { id: 'dorm_disc', label: 'Disciplinary & Damage Liabilities', desc: 'No unpaid damage assessments or disciplinary violations.' },
    ]
  },
  psychology: {
    title: 'Student Counseling',
    items: [
      { id: 'psy_survey', label: 'Exit Wellness Questionnaire', desc: 'Official graduating student survey completed.' },
      { id: 'psy_res', label: 'Psychological Clearance', desc: 'No counseling center resources or materials remain in your possession.' },
    ]
  },
  sportmaster: {
    title: 'Sports & Athletics',
    items: [
      { id: 'sport_gear', label: 'Gear & Uniform Return', desc: 'All tracksuits, jerseys, kits, balls, and gear returned.' },
      { id: 'sport_locker', label: 'Gym Locker Clearance', desc: 'Athletic locker key surrendered, locker cleared and undamaged.' },
    ]
  },
  campuspolice: {
    title: 'Campus Police',
    items: [
      { id: 'police_conduct', label: 'Conduct & Police Audit', desc: 'Clean security record, no pending investigations or open charges.' },
      { id: 'police_vehicle', label: 'Vehicle & Parking Permits', desc: 'Campus vehicle permits, parking stickers, or gate passes returned.' },
    ]
  },
  cooperationsharing: {
    title: 'Cost-Sharing Office',
    items: [
      { id: 'coop_contract', label: 'Ministry of Education Contract Signing', desc: 'Official Cost-Sharing Service Agreement finalized.' },
      { id: 'coop_legal', label: 'Legal Service Obligation', desc: 'Signed commitment to repay or fulfill required public service obligation.' },
    ]
  },
  dopcordinator: {
    title: 'DOP Coordinator',
    items: [
      { id: 'dop_credit', label: 'Credit Hour Audit', desc: 'All required credit hours specified in your curriculum earned.' },
      { id: 'dop_curr', label: 'Curriculum & Track Completion', desc: 'Prerequisites, core modules, and electives satisfied.' },
    ]
  },
  studentaffairs: {
    title: 'Student Affairs',
    items: [
      { id: 'sa_union', label: 'Student Union Conduct Review', desc: 'Assets, equipment, or funds managed under Student Union audited.' },
      { id: 'sa_general', label: 'General Conduct Clearance', desc: 'No outstanding union fees, disputes, or association liabilities.' },
    ]
  },
  registrar: {
    title: 'University Registrar',
    items: [
      { id: 'reg_audit', label: 'Final Audit & Validation', desc: 'All preceding clearance signatures and stamps are 100% complete.' },
      { id: 'reg_seal', label: 'Digital Seal & Parchment Release', desc: 'Official University Cryptographic Digital Seal applied.' },
    ]
  }
};

export default function StudentDashboard() {
  const [form, setForm] = useState<ClearanceForm | null>(null);
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');

  // Modals
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isExitSurveyOpen, setIsExitSurveyOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null);

  // ✅ NEW: Property Exit Pass State
  const [exitPass, setExitPass] = useState<any>(null);
  const [isExitPassModalOpen, setIsExitPassModalOpen] = useState(false);
  const [exitPassForm] = Form.useForm();

  // Global Lock State
  const [portalLocked, setPortalLocked] = useState(false);
  const [portalLockedMessage, setPortalLockedMessage] = useState('');

  // ✅ NEW: Pre-Clearance Checklist State
  const [preClearanceChecks, setPreClearanceChecks] = useState<Record<string, boolean>>({});

  const user = getSession();

  const loadPortalStatus = async () => {
    try {
      const res = await apiFetch('system/settings');
      setPortalLocked(!res.is_clearance_open);
      setPortalLockedMessage(res.locked_message || 'The clearance portal is currently locked by the administration.');
    } catch { /* silent */ }
  };

  const loadExitPass = async () => {
    try {
      const data = await apiFetch('student/exit-pass');
      setExitPass(data);
      if (data && data.items) {
        exitPassForm.setFieldsValue({ items: data.items });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudentForm();
    loadPortalStatus();
    loadExitPass(); // ✅ Load Exit Pass on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudentForm = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('student/dashboard/');
      const forms = res.forms || [];
      const dynamicWorkflow = res.workflow || [];
      if (forms.length > 0) setForm(forms[0]);
      setWorkflow(dynamicWorkflow);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExitPass = async (values: any) => {
    try {
      await apiFetch('student/exit-pass', {
        method: 'POST',
        body: JSON.stringify({ items: values.items }),
      });
      message.success('Property list submitted to Dormitory for validation.');
      setIsExitPassModalOpen(false);
      loadExitPass();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit exit pass.');
    }
  };

  const handleOpenCertificate = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setIsCertificateOpen(true);
  };

  // ✅ DYNAMIC STAGES ENGINE
  const stages = workflow.map((step) => {
    const approval = form?.approvals?.find((a: any) => a.step === step.id && a.status === 'approved');
    const isApproved = !!approval;
    const isCurrent = form?.current_step?.id === step.id;

    let phone = '+251 33 221 4000';
    if (step.role_required === 'departmenthead') phone = '+251 33 221 4050';
    if (step.role_required === 'librarian') phone = '+251 33 221 4051';
    if (step.role_required === 'cafeteria') phone = '+251 33 221 4052';
    if (step.role_required === 'psychology') phone = '+251 33 221 4053';
    if (step.role_required === 'sportmaster') phone = '+251 33 221 4054';
    if (step.role_required === 'campuspolice') phone = '+251 33 221 4055';
    if (step.role_required === 'cooperationsharing') phone = '+251 33 221 4056';
    if (step.role_required === 'dopcordinator') phone = '+251 33 221 4057';
    if (step.role_required === 'studentaffairs') phone = '+251 33 221 4058';
    if (step.role_required === 'dormitory') phone = '+251 33 221 4059';

    return {
      id: step.id, key: step.role_required, title: `${step.order}. ${step.name}`,
      office: step.name, phone, approved: isApproved, isCurrent: isCurrent,
      note: isApproved ? approval.note : (isCurrent ? 'Awaiting action at this office...' : 'Pending previous approvals.'),
      approvedBy: isApproved ? approval.approved_by_name : null
    };
  });

  const totalSteps = stages.length;
  const approvedCount = stages.filter(s => s.approved).length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((approvedCount / totalSteps) * 100);
  const isFullyCleared = form?.overall_status === 'Cleared by Registrar' || (totalSteps > 0 && approvedCount === totalSteps);

  const filteredStages = stages.filter(s => {
    if (filterStatus === 'approved') return s.approved;
    if (filterStatus === 'pending') return !s.approved;
    return true;
  });

  // ✅ CALCULATE CHECKLIST PROGRESS
  const activeChecklistRoles = workflow.map(w => w.role_required);
  const requiredChecklistItems = activeChecklistRoles.flatMap(role => {
    if (role === 'dormitory' && !user?.building_id) return []; // Skip if no dorm
    return PRE_CLEARANCE_DATA[role]?.items || [];
  });

  const totalRequiredChecks = requiredChecklistItems.length;
  const checkedCount = requiredChecklistItems.filter(item => preClearanceChecks[item.id]).length;
  const isChecklistComplete = totalRequiredChecks === 0 || checkedCount === totalRequiredChecks;
  const checklistPercent = totalRequiredChecks === 0 ? 100 : Math.round((checkedCount / totalRequiredChecks) * 100);

  const handleCheckToggle = (id: string, checked: boolean) => {
    setPreClearanceChecks(prev => ({ ...prev, [id]: checked }));
  };

  // Status Badge Helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Cleared by Registrar': return <Tag color="success" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>🎉 Cleared by University Registrar</Tag>;
      case 'rejected': return <Tag color="error" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>❌ Clearance Action Required / Resubmit</Tag>;
      case 'requires_payment': return <Tag color="warning" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>💳 Pending Department Dues Payment</Tag>;
      default: return <Tag color="processing" style={{ fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>⏳ Sequential Review In Progress ({approvedCount}/{totalSteps} Cleared)</Tag>;
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* GLOBAL LOCK BANNER */}
      {portalLocked && (
        <Alert
          message="🔒 Clearance Portal is Currently Locked"
          description={portalLockedMessage}
          type="warning" showIcon
          style={{ marginBottom: 24, borderRadius: 14, border: '1px solid #fde68a' }}
          action={<Button size="small" onClick={() => { loadStudentForm(); loadPortalStatus(); }} style={{ borderRadius: 8 }}>Refresh</Button>}
        />
      )}

      {/* 1. HERO BANNER */}
      <Card style={{ borderRadius: 24, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%)', color: '#ffffff', marginBottom: 24, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', overflow: 'hidden' }} styles={{ body: { padding: '28px 28px' } }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 250, height: 250, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(37, 99, 235, 0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <Row align="middle" justify="space-between" gutter={[20, 20]}>
          <Col xs={24} md={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={64} src={user?.profile_picture_url} icon={<UserOutlined />} style={{ backgroundColor: '#f59e0b', border: '3px solid #ffffff', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.5)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: -0.5 }}>{user?.full_name || 'Student Name'}</Title>
                  <Tag color="gold" style={{ margin: 0, fontWeight: 700, borderRadius: 12 }}>Graduating Student</Tag>
                </div>
                <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                  ID: <strong style={{ color: '#fbbf24' }}>{user?.id_number || '---'}</strong> • {user?.department_name || '---'} • <span style={{ color: '#cbd5e1' }}>{user?.email || '---'}</span>
                </Text>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {getStatusBadge(form?.overall_status)}
              <Tag color="cyan" style={{ borderRadius: 20, padding: '4px 12px' }}>Ref: #CLR-2026-{(form?.id || 1001)}</Tag>
            </div>
          </Col>
          <Col xs={24} md={9} style={{ textAlign: 'right' }}>
            <Space wrap size={10} style={{ justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={loadStudentForm} loading={loading} style={{ borderRadius: 12, background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 600 }}>Refresh</Button>
              <Button icon={<QrcodeOutlined />} onClick={() => setIsQRModalOpen(true)} style={{ borderRadius: 12, background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 600 }}>QR Pass</Button>
              <Button icon={<PrinterOutlined />} onClick={() => setIsSlipModalOpen(true)} style={{ borderRadius: 12, background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 600 }}>Clearance Slip</Button>
              <Button icon={<FileDoneOutlined />} onClick={() => setIsDossierOpen(true)} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', fontWeight: 700, boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}>Graduation Dossier (4-in-1)</Button>
              {isFullyCleared && <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={handleOpenCertificate} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontWeight: 700, border: 'none', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.45)' }}>Digital Certificate</Button>}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. TOP METRIC STATS ROW */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} styles={{ body: { padding: '18px 20px' } }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Offices Cleared</Text><CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} /></div><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{approvedCount}</span><span style={{ fontSize: 14, color: '#64748b' }}>/ {totalSteps} Offices</span></div><Progress percent={progressPercent} strokeColor={{ '0%': '#f59e0b', '100%': '#10b981' }} showInfo={false} size="small" style={{ marginTop: 8 }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} styles={{ body: { padding: '18px 20px' } }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Pending Balance</Text><DollarOutlined style={{ color: form?.overall_status === 'requires_payment' ? '#f59e0b' : '#10b981', fontSize: 18 }} /></div><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontSize: 28, fontWeight: 800, color: form?.overall_status === 'requires_payment' ? '#d97706' : '#10b981' }}>{form?.overall_status === 'requires_payment' ? '350.00' : '0.00'}</span><span style={{ fontSize: 14, color: '#64748b' }}>ETB</span></div><Text style={{ fontSize: 12, color: form?.overall_status === 'requires_payment' ? '#b45309' : '#10b981', fontWeight: 600, display: 'block', marginTop: 6 }}>{form?.overall_status === 'requires_payment' ? '⚠️ Overdue fine at Library' : '✓ All Department Dues Settled'}</Text></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} styles={{ body: { padding: '18px 20px' } }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Current Turn</Text><CompassOutlined style={{ color: '#3b82f6', fontSize: 18 }} /></div><div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isFullyCleared ? 'Registrar Completed' : stages.find(s => s.isCurrent)?.title || 'Not Submitted'}</div><Text style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 6 }}>{isFullyCleared ? 'Graduation verified' : 'Awaiting officer sign-off'}</Text></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card style={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} styles={{ body: { padding: '18px 20px' } }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Checklist Status</Text><TrophyOutlined style={{ color: isChecklistComplete ? '#10b981' : '#f59e0b', fontSize: 18 }} /></div><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{checklistPercent}%</span><span style={{ fontSize: 13, color: '#64748b' }}>Done</span></div><Text style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 6 }}>{checkedCount} of {totalRequiredChecks} pre-clearance items checked</Text></Card></Col>
      </Row>

      {/* 3. MAIN NAVIGATION TABS */}
      <Tabs
        activeKey={activeTab} onChange={setActiveTab} type="card" size="large"
        items={[
          {
            key: 'overview',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><ThunderboltOutlined style={{ color: '#f59e0b' }} /> Clearance Roadmap</span>,
            children: (
              <div>
                {loading ? <div style={{ padding: 60, textAlign: 'center' }}><Spin size="large" /></div> : !form ? (
                  <Card style={{ textAlign: 'center', padding: 48, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                    <FileTextOutlined style={{ fontSize: 56, color: '#f59e0b', marginBottom: 16 }} />
                    <Title level={3}>No Active Clearance Application</Title>
                    <Paragraph type="secondary" style={{ maxWidth: 500, margin: '0 auto 20px' }}>{portalLocked ? portalLockedMessage : 'You have not submitted a clearance application for this semester yet.'}</Paragraph>
                    {portalLocked ? (
                      <Button icon={<ReloadOutlined />} onClick={() => { loadStudentForm(); loadPortalStatus(); }} style={{ borderRadius: 12 }}>Refresh Portal Status</Button>
                    ) : (
                      <Button type="primary" size="large" onClick={() => setActiveTab('apply')} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', fontWeight: 700 }}>Submit Clearance Application Now</Button>
                    )}
                  </Card>
                ) : (
                  <div>
                    <Card style={{ marginBottom: 24, borderRadius: 18, background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)', border: '1px solid #bfdbfe' }} styles={{ body: { padding: '18px 24px' } }}>
                      <Row align="middle" justify="space-between" gutter={[16, 16]}>
                        <Col xs={24} md={18}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💡</div>
                            <div>
                              <Text strong style={{ color: '#1e3a8a', fontSize: 15, display: 'block' }}>Smart Clearance Advisor</Text>
                              <Text style={{ color: '#475569', fontSize: 13 }}>{isFullyCleared ? "Congratulations! Your university clearance is 100% completed." : `Next required sign-off is at ${stages.find(s => s.isCurrent)?.title || 'Next Office'}.`}</Text>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} md={6} style={{ textAlign: 'right' }}><Button icon={<PhoneOutlined />} onClick={() => setIsOfficeModalOpen(true)} style={{ borderRadius: 10, fontWeight: 600, borderColor: '#3b82f6', color: '#2563eb' }}>Office Directory</Button></Col>
                      </Row>
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                      <div><Title level={4} style={{ margin: 0, fontWeight: 800 }}>{totalSteps}-Office Verification Timeline</Title><Text type="secondary" style={{ fontSize: 13 }}>Progressively cleared in official university workflow sequence</Text></div>
                      <Space>
                        <Button size="small" type={filterStatus === 'all' ? 'primary' : 'default'} onClick={() => setFilterStatus('all')} style={{ borderRadius: 8 }}>All ({stages.length})</Button>
                        <Button size="small" type={filterStatus === 'approved' ? 'primary' : 'default'} onClick={() => setFilterStatus('approved')} style={{ borderRadius: 8 }}>Cleared ({approvedCount})</Button>
                        <Button size="small" type={filterStatus === 'pending' ? 'primary' : 'default'} onClick={() => setFilterStatus('pending')} style={{ borderRadius: 8 }}>Pending ({stages.length - approvedCount})</Button>
                      </Space>
                    </div>

                    <Row gutter={[16, 16]}>
                      {filteredStages.map((stage) => (
                        <Col xs={24} sm={12} lg={8} key={stage.id}>
                          <Card hoverable style={{ borderRadius: 16, border: stage.approved ? '1px solid #bbf7d0' : (stage.isCurrent ? '2px solid #f59e0b' : '1px solid #fde68a'), background: stage.approved ? '#f0fdf4' : (stage.isCurrent ? '#fffbeb' : '#ffffff'), boxShadow: '0 4px 14px rgba(0,0,0,0.02)', transition: 'all 0.25s ease' }} styles={{ body: { padding: '18px 20px' } }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                              <div><Text strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>{stage.title}</Text><Text type="secondary" style={{ fontSize: 12 }}>{stage.office}</Text></div>
                              {stage.approved ? <Tag color="success" style={{ margin: 0, borderRadius: 12, fontWeight: 700 }}><CheckCircleOutlined /> Cleared</Tag> : stage.isCurrent ? <Tag color="warning" style={{ margin: 0, borderRadius: 12, fontWeight: 700 }}><ClockCircleOutlined /> Action Required</Tag> : <Tag color="default" style={{ margin: 0, borderRadius: 12, fontWeight: 700 }}>Pending</Tag>}
                            </div>
                            <div style={{ fontSize: 12, color: stage.approved ? '#166534' : '#854d0e', background: stage.approved ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)', padding: '8px 12px', borderRadius: 8, marginBottom: 12, border: stage.approved ? '1px solid #dcfce7' : '1px solid #fef3c7', minHeight: 50 }}>
                              <strong>Officer Note:</strong> {stage.note}
                              {stage.approvedBy && <div style={{ marginTop: 4, fontSize: 10, color: '#64748b' }}>Signed by: {stage.approvedBy}</div>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b' }}>
                              <span>📞 {stage.phone}</span>
                              <Button type="link" size="small" onClick={() => { setSelectedChatRoom({ id: 1, name: stage.title, staff_role: stage.key, staff_name: 'Office Representative', student: { id: 101, full_name: user?.full_name || 'Student', id_number: user?.id_number || '---' } }); setActiveTab('chat'); }} style={{ padding: 0, fontSize: 12, fontWeight: 600 }}>Message Office →</Button>
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
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><CheckSquareOutlined style={{ color: '#10b981' }} /> Pre-Clearance Checklist</span>,
            children: (
              <Card style={{ borderRadius: 20, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 28 } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <Title level={4} style={{ marginBottom: 6, fontWeight: 800 }}>Before You Apply: Requirements Checklist</Title>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      You must check every box below to unlock the "Apply for Clearance" form. Read each item carefully.
                    </Paragraph>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Progress type="circle" percent={checklistPercent} size={70} strokeColor={isChecklistComplete ? '#10b981' : '#f59e0b'} />
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: isChecklistComplete ? '#15803d' : '#b45309' }}>
                      {checkedCount} / {totalRequiredChecks} Checked
                    </div>
                  </div>
                </div>

                <Collapse defaultActiveKey={activeChecklistRoles} expandIconPosition="end" ghost>
                  {activeChecklistRoles.map(role => {
                    if (role === 'dormitory' && !user?.building_id) return null;
                    const data = PRE_CLEARANCE_DATA[role];
                    if (!data) return null;

                    return (
                      <Panel header={<Text strong style={{ fontSize: 15, color: '#0f172a' }}>{data.title}</Text>} key={role}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 8 }}>
                          {data.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: preClearanceChecks[item.id] ? '#f0fdf4' : '#f8fafc', borderRadius: 10, border: `1px solid ${preClearanceChecks[item.id] ? '#86efac' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleCheckToggle(item.id, !preClearanceChecks[item.id])}>
                              <Checkbox checked={preClearanceChecks[item.id]} onChange={e => handleCheckToggle(item.id, e.target.checked)} style={{ marginTop: 2 }} />
                              <div>
                                <Text strong style={{ fontSize: 14, color: preClearanceChecks[item.id] ? '#15803d' : '#1e293b', display: 'block' }}>{item.label}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Panel>
                    );
                  })}
                </Collapse>
              </Card>
            )
          },
          {
            key: 'passport',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><QrcodeOutlined style={{ color: '#3b82f6' }} /> Digital Passport</span>,
            children: <DigitalPassCard user={user} form={form} approvedCount={approvedCount} />
          },
          {
            key: 'locker',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><FileDoneOutlined style={{ color: '#6366f1' }} /> Document Locker</span>,
            children: <DocumentLocker user={user} form={form} />
          },
          {
            key: 'apply',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><FileTextOutlined style={{ color: '#ec4899' }} /> Apply Clearance</span>,
            children: portalLocked ? (
               <Card style={{ textAlign: 'center', padding: 60, borderRadius: 20, border: '2px dashed #fbbf24', background: '#fffbeb' }}>
                <LockOutlined style={{ fontSize: 64, color: '#f59e0b', marginBottom: 16 }} />
                <Title level={3} style={{ color: '#92400e' }}>Clearance Portal is Locked</Title>
                <Paragraph type="secondary" style={{ maxWidth: 500, margin: '0 auto 20px' }}>{portalLockedMessage}</Paragraph>
                <Button icon={<ReloadOutlined />} onClick={() => { loadStudentForm(); loadPortalStatus(); }} style={{ borderRadius: 10 }}>Refresh Portal Status</Button>
              </Card>
            ) : !isChecklistComplete ? (
              <Card style={{ textAlign: 'center', padding: 60, borderRadius: 20, border: '2px dashed #f87171', background: '#fef2f2' }}>
                <WarningOutlined style={{ fontSize: 64, color: '#ef4444', marginBottom: 16 }} />
                <Title level={3} style={{ color: '#991b1b' }}>Checklist Incomplete</Title>
                <Paragraph type="secondary" style={{ maxWidth: 500, margin: '0 auto 20px' }}>
                  You must complete the <strong>Pre-Clearance Checklist</strong> before submitting your form. You have {totalRequiredChecks - checkedCount} item(s) remaining.
                </Paragraph>
                <Button type="primary" onClick={() => setActiveTab('checklist')} style={{ borderRadius: 10, background: '#ef4444', border: 'none', fontWeight: 700 }}>Go to Checklist</Button>
              </Card>
            ) : (
              <ClearanceFormSubmission preClearanceChecks={preClearanceChecks} onSubmitted={() => { loadStudentForm(); setActiveTab('overview'); }} />
            )
          },
          {
            key: 'costsharing',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><FileDoneOutlined style={{ color: '#2563eb' }} /> Cost Sharing</span>,
            children: <CostSharingContractSection user={user} form={form} onFormUpdated={loadStudentForm} />
          },
          {
            key: 'disputes',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><WarningOutlined style={{ color: '#f59e0b' }} /> Disputes</span>,
            children: <DisputeAppealSection user={user} form={form} onFormUpdated={loadStudentForm} />
          },
          {
            key: 'queue',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><ClockCircleOutlined style={{ color: '#10b981' }} /> Office Queues</span>,
            children: <OfficeQueueBookingSection user={user} form={form} />
          },
          {
            // ✅ NEW: PROPERTY EXIT PASS TAB
            key: 'exitpass',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><FileDoneOutlined style={{ color: '#f59e0b' }} /> Property Exit Pass</span>,
            children: (
              <Card style={{ borderRadius: 20, border: '1px solid #e2e8f0' }} styles={{ body: { padding: 28 } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>Property Exit Pass</Title>
                    <Text type="secondary">Declare items you are taking out of the university to get Gate clearance.</Text>
                  </div>
                  {(!exitPass || exitPass.status === 'draft' || exitPass.status === 'rejected') && (
                    <Button type="primary" size="large" onClick={() => setIsExitPassModalOpen(true)} style={{ borderRadius: 10, background: '#f59e0b', border: 'none', fontWeight: 700 }}>
                      Register Property
                    </Button>
                  )}
                </div>

                {exitPass && (
                  <Card style={{ background: exitPass.status === 'approved' ? '#f0fdf4' : exitPass.status === 'pending' ? '#fffbeb' : '#fef2f2', border: `1px solid ${exitPass.status === 'approved' ? '#bbf7d0' : exitPass.status === 'pending' ? '#fde68a' : '#fecaca'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Title level={5}>Status: {exitPass.status.toUpperCase()}</Title>
                        {exitPass.status === 'approved' && <Text type="success">Validated by {exitPass.approved_by_name}</Text>}
                        {exitPass.status === 'pending' && <Text type="warning">Waiting for Dormitory Manager physical check.</Text>}
                        {exitPass.dorm_note && <Paragraph style={{ marginTop: 8, fontStyle: 'italic' }}>Note: {exitPass.dorm_note}</Paragraph>}
                      </div>
                      {exitPass.status === 'approved' && (
                        <Button type="primary" onClick={() => window.print()} icon={<PrinterOutlined />} style={{ background: '#10b981', border: 'none' }}>
                          Print Exit Pass
                        </Button>
                      )}
                    </div>

                    <Divider />
                    <Title level={5}>Registered Items:</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      {exitPass.items.map((itm: any, idx: number) => (
                        <li key={idx}><Text strong>{itm.quantity}x</Text> {itm.item} ({itm.description})</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </Card>
            )
          },
          {
            key: 'chat',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><MessageOutlined style={{ color: '#06b6d4' }} /> Support Chat</span>,
            children: (
              <Row gutter={24}>
                <Col xs={24} md={10}><ChatRooms onSelectRoom={room => setSelectedChatRoom(room)} /></Col>
                <Col xs={24} md={14}>
                  {selectedChatRoom ? <ChatSystem room={selectedChatRoom} /> : (
                    <Card style={{ textAlign: 'center', padding: 60, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                      <MessageOutlined style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }} />
                      <Title level={4}>Department Live Chat</Title>
                      <Text type="secondary">Select a chat room on the left.</Text>
                    </Card>
                  )}
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* 4. MODALS */}
      <GraduationDossierModal open={isDossierOpen} onClose={() => setIsDossierOpen(false)} form={form} user={user} stages={stages} />
      <ClearanceCertificateModal open={isCertificateOpen} onClose={() => setIsCertificateOpen(false)} form={form} />
      <ExitSurveyModal open={isExitSurveyOpen} onClose={() => setIsExitSurveyOpen(false)} onCompleted={() => { message.success('Exit survey recorded!'); setIsExitSurveyOpen(false); }} />

      {/* ✅ NEW: EXIT PASS REGISTRATION MODAL */}
      <Modal
        title="Register Property for Exit"
        open={isExitPassModalOpen}
        onCancel={() => setIsExitPassModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={exitPassForm} layout="vertical" onFinish={handleSubmitExitPass}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'item']} rules={[{ required: true, message: 'Missing item name' }]}>
                      <Input placeholder="Item (e.g. Laptop)" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Missing qty' }]}>
                      <Input type="number" placeholder="Qty" style={{ width: 70 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} rules={[{ required: true, message: 'Missing description' }]}>
                      <Input placeholder="Description (e.g. MacBook Pro)" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Another Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Button type="primary" htmlType="submit" block size="large" style={{ background: '#f59e0b', border: 'none', marginTop: 16 }}>
            Submit to Dormitory
          </Button>
        </Form>
      </Modal>

      <Modal title="Student Quick Verification QR Pass" open={isQRModalOpen} onCancel={() => setIsQRModalOpen(false)} footer={[<Button key="close" type="primary" onClick={() => setIsQRModalOpen(false)}>Close</Button>]} centered>
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ padding: 16, background: '#ffffff', borderRadius: 16, display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}><QRCodeSVG value={`MAU-CLR-2026-${user?.id_number || '---'}-${user?.full_name || 'Student'}`} size={180} /></div>
          <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{user?.full_name || 'Student'}</Title>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>ID: {user?.id_number || '---'} • {user?.department_name || '---'}</Text>
          <Tag color={isFullyCleared ? 'success' : 'warning'} style={{ marginTop: 10, borderRadius: 12 }}>Status: {isFullyCleared ? '100% Cleared' : `${approvedCount} of ${totalSteps} Approved`}</Tag>
        </div>
      </Modal>

      <Modal title="Official Student Clearance Summary Slip" open={isSlipModalOpen} onCancel={() => setIsSlipModalOpen(false)} width={700} footer={[<Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>Print Official Slip</Button>, <Button key="close" onClick={() => setIsSlipModalOpen(false)}>Close</Button>]}>
        <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}><img src="/mau_logo.jpg" alt="MAU" style={{ width: 50, height: 50, borderRadius: 10, marginBottom: 6, objectFit: 'contain' }} /><div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>MEKDELA AMBA UNIVERSITY</div><div style={{ fontSize: 12, color: '#64748b' }}>OFFICE OF THE UNIVERSITY REGISTRAR</div></div>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}><Col span={12}><Text strong>Name:</Text> {user?.full_name || '---'}</Col><Col span={12}><Text strong>ID:</Text> {user?.id_number || '---'}</Col><Col span={12}><Text strong>College:</Text> {user?.college_name || '---'}</Col><Col span={12}><Text strong>Department:</Text> {user?.department_name || '---'}</Col></Row>
          <Table size="small" pagination={false} dataSource={stages.map((s, i) => ({ key: s.id, no: i + 1, office: s.title, status: s.approved ? 'CLEARED' : 'PENDING', note: s.note }))} columns={[{ title: '#', dataIndex: 'no', width: 40 }, { title: 'Office', dataIndex: 'office' }, { title: 'Status', dataIndex: 'status', render: (val: string) => (<Tag color={val === 'CLEARED' ? 'success' : 'warning'}>{val}</Tag>) }, { title: 'Note', dataIndex: 'note' }]} />
        </div>
      </Modal>

      <OfficeDirectoryModal open={isOfficeModalOpen} onClose={() => setIsOfficeModalOpen(false)} />
    </div>
  );
}
