import React, { useState } from 'react';
import {
  Card, Typography, Tabs, Table, Tag, Button, Input, Select,
  Space, Row, Col, Alert, Modal, Form, Switch, Badge, message, Divider, Tooltip
} from 'antd';
import {
  CodeOutlined, KeyOutlined, ApiOutlined, SendOutlined, CopyOutlined,
  CheckCircleOutlined, SyncOutlined, SafetyCertificateOutlined,
  DisconnectOutlined, RocketOutlined, GlobalOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { getStoredForms, getStoredValidStudents } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'staging';
  created: string;
  lastUsed: string;
  scopes: string[];
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused';
  secret: string;
  lastPing: string;
}

export default function DeveloperApiPortal() {
  const [activeTab, setActiveTab] = useState('keys');

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'KEY-001',
      name: 'MAU University Main CMS Integration',
      key: 'mau_live_pk_9f82a71b4e3c8d1045a2b',
      environment: 'production',
      created: '2026-07-15',
      lastUsed: '2 minutes ago',
      scopes: ['read:clearance', 'verify:digital_seal', 'webhook:events']
    },
    {
      id: 'KEY-002',
      name: 'Moodle LMS Clearance Sync',
      key: 'mau_test_sk_3c11f98e2d4a70198c6b3',
      environment: 'staging',
      created: '2026-07-20',
      lastUsed: '1 hour ago',
      scopes: ['read:clearance', 'write:dues']
    }
  ]);

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyForm] = Form.useForm();

  // Webhooks state
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: 'WH-101',
      url: 'https://cms.mau.edu.et/api/v1/clearance-webhook',
      events: ['student.cleared', 'certificate.generated'],
      status: 'active',
      secret: 'whsec_9841ab76c5d43e21098f',
      lastPing: '2026-07-29 12:40 PM (200 OK)'
    }
  ]);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookForm] = Form.useForm();

  // API Tester State
  const [selectedEndpoint, setSelectedEndpoint] = useState('get_status');
  const [studentIdInput, setStudentIdInput] = useState('UGR/1234/14');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python'>('javascript');

  // Create API Key handler
  const handleCreateKey = (values: any) => {
    const newKey: ApiKey = {
      id: `KEY-00${apiKeys.length + 1}`,
      name: values.name,
      key: `mau_${values.environment}_key_${Math.random().toString(36).substring(2, 15)}`,
      environment: values.environment,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      scopes: values.scopes || ['read:clearance']
    };
    setApiKeys([...apiKeys, newKey]);
    setIsKeyModalOpen(false);
    keyForm.resetFields();
    message.success('Developer API Key successfully generated!');
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    message.warning('API Key revoked.');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  // Webhook creation handler
  const handleCreateWebhook = (values: any) => {
    const newWh: Webhook = {
      id: `WH-${Math.floor(100 + Math.random() * 900)}`,
      url: values.url,
      events: values.events,
      status: 'active',
      secret: `whsec_${Math.random().toString(36).substring(2, 12)}`,
      lastPing: 'Not tested yet'
    };
    setWebhooks([...webhooks, newWh]);
    setIsWebhookModalOpen(false);
    webhookForm.resetFields();
    message.success('Webhook endpoint registered!');
  };

  const handleTestWebhook = (id: string) => {
    message.loading({ content: 'Sending test ping payload to external CMS webhook...', key: 'wh_ping' });
    setTimeout(() => {
      setWebhooks(prev => prev.map(w => w.id === id ? { ...w, lastPing: `${new Date().toLocaleTimeString()} (200 OK - Delivered)` } : w));
      message.success({ content: 'Test Webhook ping delivered successfully! Response: 200 OK', key: 'wh_ping' });
    }, 1000);
  };

  // API Runner Execution
  const handleExecuteApi = () => {
    setLoadingApi(true);
    setTimeout(() => {
      if (selectedEndpoint === 'get_status') {
        const forms = getStoredForms();
        const found = forms.find(f => f.id_number.toLowerCase() === studentIdInput.toLowerCase());
        setApiResponse({
          status_code: found ? 200 : 404,
          status: found ? "success" : "not_found",
          timestamp: new Date().toISOString(),
          data: found || { message: `No clearance form found for Student ID ${studentIdInput}` }
        });
      } else if (selectedEndpoint === 'verify_seal') {
        setApiResponse({
          status_code: 200,
          status: "success",
          verified: true,
          verification_code: "MAU-CLEARANCE-SEAL-98412",
          timestamp: new Date().toISOString(),
          details: {
            student_name: "Abebe Kebede",
            id_number: studentIdInput,
            department: "Software Engineering",
            registrar_seal: "APPROVED_CRYPTOGRAPHIC_SEAL",
            issued_by: "University Registrar Office"
          }
        });
      } else if (selectedEndpoint === 'get_dues') {
        setApiResponse({
          status_code: 200,
          status: "success",
          total_dues_count: 2,
          currency: "ETB",
          records: [
            { department: "Main Library", due_amount: 350.00, reason: "Overdue Book: Introduction to Algorithms", status: "CLEARED" },
            { department: "Cafeteria", due_amount: 120.00, reason: "Unreturned Meal Card Badge", status: "PENDING" }
          ]
        });
      }
      setLoadingApi(false);
    }, 600);
  };

  // Generate Snippets
  const getCodeSnippet = () => {
    const key = apiKeys[0]?.key || 'YOUR_API_KEY';
    if (selectedEndpoint === 'get_status') {
      if (codeLanguage === 'curl') {
        return `curl -X GET "https://mau.edu.et/api/v1/clearance/status?id_number=${studentIdInput}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json"`;
      }
      if (codeLanguage === 'javascript') {
        return `// JavaScript / Node.js Fetch Integration for MAU CMS
const response = await fetch('https://mau.edu.et/api/v1/clearance/status?id_number=${studentIdInput}', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ${key}',
    'Content-Type': 'application/json'
  }
});
const clearanceData = await response.json();
console.log('Student Clearance Status:', clearanceData);`;
      }
      if (codeLanguage === 'python') {
        return `# Python Requests Integration for University Backend
import requests

url = "https://mau.edu.et/api/v1/clearance/status"
params = {"id_number": "${studentIdInput}"}
headers = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`;
      }
    }
    return `// API Endpoint documentation snippet available.`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
      {/* HEADER HERO */}
      <Card
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          marginBottom: 24,
          border: 'none',
          boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)'
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space style={{ marginBottom: 8 }}>
              <Tag color="cyan" style={{ fontWeight: 800, borderRadius: 12 }}>UNIVERSITY IT DEVELOPER SUITE</Tag>
              <Tag color="green" style={{ fontWeight: 800, borderRadius: 12 }}>v1.4 REST API & WEBHOOKS</Tag>
            </Space>
            <Title level={2} style={{ color: '#ffffff', margin: '4px 0 8px', fontWeight: 900 }}>
              Mekdela Amba University Staff API & CMS Integration Portal
            </Title>
            <Paragraph style={{ color: '#cbd5e1', margin: 0, fontSize: 14 }}>
              Enable university developers and IT staff to securely integrate clearance data, verify digital seals, and synchronize student status directly into external campus CMS, Moodle LMS, or Mobile Apps.
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<KeyOutlined />}
              onClick={() => setIsKeyModalOpen(true)}
              style={{ borderRadius: 12, background: '#2563eb', fontWeight: 700, border: 'none', height: 48 }}
            >
              Generate New API Key
            </Button>
          </Col>
        </Row>
      </Card>

      {/* MAIN TABS */}
      <Card style={{ borderRadius: 24, borderColor: '#e2e8f0' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'keys',
              label: (
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  <KeyOutlined /> API Keys & Access Management
                </span>
              ),
              children: (
                <div style={{ paddingTop: 12 }}>
                  <Alert
                    type="info"
                    showIcon
                    message="API Authentication Guidelines"
                    description="Pass your API Key in the Authorization header as a Bearer token: 'Authorization: Bearer mau_live_pk_...'. Never share secret keys in public client-side repositories."
                    style={{ marginBottom: 20, borderRadius: 12 }}
                  />

                  <Table
                    dataSource={apiKeys}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Application / Key Name',
                        dataIndex: 'name',
                        key: 'name',
                        render: (text: string, r: ApiKey) => (
                          <div>
                            <Text strong style={{ color: '#0f172a', display: 'block' }}>{text}</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 11 }}>ID: {r.id} | Environment: </Text>
                            <Tag color={r.environment === 'production' ? 'green' : 'orange'} style={{ borderRadius: 6, fontSize: 10 }}>
                              {r.environment.toUpperCase()}
                            </Tag>
                          </div>
                        )
                      },
                      {
                        title: 'API Key String',
                        dataIndex: 'key',
                        key: 'key',
                        render: (keyStr: string) => (
                          <Space>
                            <Text code style={{ fontSize: 12 }}>{keyStr.substring(0, 18)}...</Text>
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(keyStr, 'API Key')}
                              style={{ borderRadius: 6 }}
                            >
                              Copy
                            </Button>
                          </Space>
                        )
                      },
                      {
                        title: 'Scopes',
                        dataIndex: 'scopes',
                        key: 'scopes',
                        render: (scopes: string[]) => (
                          <Space wrap size={4}>
                            {scopes.map(s => <Tag key={s} color="blue" style={{ borderRadius: 6, fontSize: 11 }}>{s}</Tag>)}
                          </Space>
                        )
                      },
                      {
                        title: 'Last Used',
                        dataIndex: 'lastUsed',
                        key: 'lastUsed',
                        render: (lu: string) => <Text style={{ fontSize: 12, color: '#64748b' }}>{lu}</Text>
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        render: (_: any, r: ApiKey) => (
                          <Button
                            size="small"
                            danger
                            icon={<DisconnectOutlined />}
                            onClick={() => handleRevokeKey(r.id)}
                            style={{ borderRadius: 6 }}
                          >
                            Revoke Key
                          </Button>
                        )
                      }
                    ]}
                  />
                </div>
              )
            },
            {
              key: 'tester',
              label: (
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  <ApiOutlined /> Interactive API Endpoint Tester
                </span>
              ),
              children: (
                <div style={{ paddingTop: 12 }}>
                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={12}>
                      <Card
                        title={<span style={{ fontWeight: 800 }}>1. Choose REST API Endpoint</span>}
                        style={{ borderRadius: 16, borderColor: '#e2e8f0' }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }} size={16}>
                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 6 }}>Select API Route:</Text>
                            <Select
                              style={{ width: '100%' }}
                              value={selectedEndpoint}
                              onChange={setSelectedEndpoint}
                            >
                              <Option value="get_status">GET /api/v1/clearance/status - Query Student Status</Option>
                              <Option value="verify_seal">POST /api/v1/clearance/verify-certificate - Validate Digital Seal</Option>
                              <Option value="get_dues">GET /api/v1/departments/due-records - Fetch Campus Dues</Option>
                            </Select>
                          </div>

                          <div>
                            <Text strong style={{ display: 'block', marginBottom: 6 }}>Student ID Number Parameter:</Text>
                            <Input
                              value={studentIdInput}
                              onChange={e => setStudentIdInput(e.target.value)}
                              placeholder="e.g. UGR/1234/14"
                              style={{ borderRadius: 8 }}
                            />
                          </div>

                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleExecuteApi}
                            loading={loadingApi}
                            style={{ width: '100%', borderRadius: 10, background: '#1e3a8a', fontWeight: 700, height: 42 }}
                          >
                            Send Request & Run API Test
                          </Button>

                          <Divider style={{ margin: '12px 0' }} />

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <Text strong style={{ fontSize: 13 }}>Code Integration Snippet:</Text>
                              <Space size={4}>
                                <Button size="small" type={codeLanguage === 'javascript' ? 'primary' : 'default'} onClick={() => setCodeLanguage('javascript')} style={{ borderRadius: 6 }}>JS</Button>
                                <Button size="small" type={codeLanguage === 'curl' ? 'primary' : 'default'} onClick={() => setCodeLanguage('curl')} style={{ borderRadius: 6 }}>cURL</Button>
                                <Button size="small" type={codeLanguage === 'python' ? 'primary' : 'default'} onClick={() => setCodeLanguage('python')} style={{ borderRadius: 6 }}>Python</Button>
                              </Space>
                            </div>
                            <pre style={{
                              background: '#0f172a',
                              color: '#38bdf8',
                              padding: 12,
                              borderRadius: 10,
                              fontSize: 11,
                              overflowX: 'auto',
                              fontFamily: 'monospace',
                              margin: 0
                            }}>
                              {getCodeSnippet()}
                            </pre>
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(getCodeSnippet(), 'Code snippet')}
                              style={{ marginTop: 8, borderRadius: 6 }}
                            >
                              Copy Code Snippet
                            </Button>
                          </div>
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800 }}>2. Live Server Response</span>
                            {apiResponse && <Tag color="green">{apiResponse.status_code} OK</Tag>}
                          </div>
                        }
                        style={{ borderRadius: 16, borderColor: '#e2e8f0', height: '100%' }}
                      >
                        {apiResponse ? (
                          <pre style={{
                            background: '#020617',
                            color: '#4ade80',
                            padding: 16,
                            borderRadius: 12,
                            fontSize: 12,
                            maxHeight: 440,
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            margin: 0
                          }}>
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                            <CodeOutlined style={{ fontSize: 48, marginBottom: 12, color: '#cbd5e1' }} />
                            <Paragraph style={{ color: '#64748b' }}>
                              Click "Send Request & Run API Test" to simulate live endpoint execution and view JSON response payload.
                            </Paragraph>
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'webhooks',
              label: (
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  <GlobalOutlined /> Event Webhooks Sync
                </span>
              ),
              children: (
                <div style={{ paddingTop: 12 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                      <Title level={5} style={{ margin: 0 }}>Registered CMS Webhook Callbacks</Title>
                      <Text style={{ color: '#64748b', fontSize: 13 }}>Receive instant HTTP POST payloads when student clearance approvals occur.</Text>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        onClick={() => setIsWebhookModalOpen(true)}
                        style={{ borderRadius: 10, background: '#047857', fontWeight: 700 }}
                      >
                        Register Webhook Endpoint
                      </Button>
                    </Col>
                  </Row>

                  <Table
                    dataSource={webhooks}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Webhook URL',
                        dataIndex: 'url',
                        key: 'url',
                        render: (u: string, r: Webhook) => (
                          <div>
                            <Text strong style={{ color: '#0f172a', display: 'block' }}>{u}</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 11 }}>Signing Secret: {r.secret}</Text>
                          </div>
                        )
                      },
                      {
                        title: 'Subscribed Events',
                        dataIndex: 'events',
                        key: 'events',
                        render: (evs: string[]) => (
                          <Space wrap size={4}>
                            {evs.map(e => <Tag key={e} color="purple" style={{ borderRadius: 6, fontSize: 11 }}>{e}</Tag>)}
                          </Space>
                        )
                      },
                      {
                        title: 'Last Delivery Status',
                        dataIndex: 'lastPing',
                        key: 'lastPing',
                        render: (lp: string) => <Tag color="blue">{lp}</Tag>
                      },
                      {
                        title: 'Actions',
                        key: 'action',
                        render: (_: any, r: Webhook) => (
                          <Button
                            size="small"
                            icon={<SendOutlined />}
                            onClick={() => handleTestWebhook(r.id)}
                            style={{ borderRadius: 6 }}
                          >
                            Send Test Ping
                          </Button>
                        )
                      }
                    ]}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* CREATE API KEY MODAL */}
      <Modal
        title="Generate New University Developer API Key"
        open={isKeyModalOpen}
        onCancel={() => setIsKeyModalOpen(false)}
        onOk={() => keyForm.submit()}
        okText="Generate Key"
        okButtonProps={{ style: { borderRadius: 8, background: '#2563eb' } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={keyForm} layout="vertical" onFinish={handleCreateKey} style={{ marginTop: 12 }}>
          <Form.Item name="name" label="Application / Integration Name" rules={[{ required: true, message: 'Please enter key name' }]}>
            <Input placeholder="e.g. MAU Main Website CMS Sync" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="environment" label="Target Environment" initialValue="production">
            <Select style={{ width: '100%' }}>
              <Option value="production">Production (Live University Data)</Option>
              <Option value="staging">Staging / Test Sandbox</Option>
            </Select>
          </Form.Item>

          <Form.Item name="scopes" label="Granted Permissions / Scopes" initialValue={['read:clearance', 'verify:digital_seal']}>
            <Select mode="multiple" style={{ width: '100%' }}>
              <Option value="read:clearance">read:clearance - Access student status</Option>
              <Option value="verify:digital_seal">verify:digital_seal - Validate Registrar certificates</Option>
              <Option value="write:dues">write:dues - Update department dues & payments</Option>
              <Option value="webhook:events">webhook:events - Subscribe to real-time events</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* REGISTER WEBHOOK MODAL */}
      <Modal
        title="Register External Webhook Endpoint"
        open={isWebhookModalOpen}
        onCancel={() => setIsWebhookModalOpen(false)}
        onOk={() => webhookForm.submit()}
        okText="Save Endpoint"
        okButtonProps={{ style: { borderRadius: 8, background: '#047857' } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={webhookForm} layout="vertical" onFinish={handleCreateWebhook} style={{ marginTop: 12 }}>
          <Form.Item name="url" label="HTTPS Webhook URL" rules={[{ required: true, message: 'Please enter Webhook URL' }]}>
            <Input placeholder="https://cms.mau.edu.et/api/clearance-webhook" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="events" label="Event Subscriptions" initialValue={['student.cleared', 'certificate.generated']}>
            <Select mode="multiple" style={{ width: '100%' }}>
              <Option value="student.applied">student.applied - New clearance request submitted</Option>
              <Option value="department.approved">department.approved - Department officer signed off</Option>
              <Option value="student.cleared">student.cleared - Registrar issued final seal</Option>
              <Option value="certificate.generated">certificate.generated - Digital PDF ready</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
