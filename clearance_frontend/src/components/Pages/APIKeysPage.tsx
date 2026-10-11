import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Modal, Input, Typography, Tag, Space,
  Alert, message, Popconfirm, Empty, Tooltip,
} from 'antd';
import {
  KeyOutlined, PlusOutlined, CopyOutlined, DeleteOutlined,
  StopOutlined, CodeOutlined, ArrowLeftOutlined, SettingOutlined,
  LockOutlined, LoginOutlined,
} from '@ant-design/icons';
import { apiFetch, getSession } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

interface APIKey {
  id: number;
  name: string;
  prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export default function APIKeysPage() {
  const navigate = useNavigate();
  const user = getSession();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api-keys');
      setKeys(Array.isArray(data) ? data : []);
    } catch (e: any) {
      message.error(e.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ No redirect — just skip fetching if not logged in
    if (!user) {
      setLoading(false);
      return;
    }
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newKeyName.trim()) {
      message.warning('Please enter a key name');
      return;
    }
    setCreating(true);
    try {
      const data = await apiFetch('/api-keys/create', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      setGeneratedKey(data.key);
      setNewKeyName('');
      fetchKeys();
    } catch (e: any) {
      message.error(e.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await apiFetch(`/api-keys/${id}/revoke`, { method: 'DELETE' });
      message.success('API key revoked');
      fetchKeys();
    } catch (e: any) {
      message.error(e.message || 'Failed to revoke');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
      message.success('API key deleted');
      fetchKeys();
    } catch (e: any) {
      message.error(e.message || 'Failed to delete');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, borderRadius: 10 }}
      >
        Back
      </Button>

      {/* HEADER */}
      <Card style={{ borderRadius: 20, marginBottom: 20, border: 'none', background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)' }}>
        <Space align="start" size={16}>
          <div
            style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 28,
            }}
          >
            <KeyOutlined />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 900 }}>
              Developer API Keys
            </Title>
            <Text style={{ color: '#cbd5e1' }}>
              Generate API keys to integrate the University Clearance System into your own apps.
            </Text>
          </div>
        </Space>
      </Card>

      {/* NOT-LOGGED-IN BANNER */}
      {!user && (
        <Alert
          type="warning"
          showIcon
          icon={<LockOutlined />}
          message="Sign in required to generate API keys"
          description={
            <div>
              <Paragraph style={{ marginBottom: 12, marginTop: 4 }}>
                API keys are personal to each account, so you need to be logged in
                to create, revoke, or manage them. You can still read the documentation below.
              </Paragraph>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                style={{ borderRadius: 10, fontWeight: 600 }}
              >
                Sign In to Manage Keys
              </Button>
            </div>
          }
          style={{ marginBottom: 20, borderRadius: 14 }}
        />
      )}

      {/* HOW-TO ALERT */}
      <Alert
        type="info"
        showIcon
        icon={<CodeOutlined />}
        message="How to use your API key"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              Send your key in the <code>X-API-Key</code> HTTP header on every request:
            </Paragraph>
            <pre
              style={{
                background: '#0f172a', color: '#e2e8f0', padding: 14, borderRadius: 10,
                fontSize: 12, overflow: 'auto', margin: 0,
              }}
            >
{`curl -H "X-API-Key: ucs_xxxxxxxx.your_secret_here" \\
     http://localhost:8000/api/student/forms`}
            </pre>
          </div>
        }
        style={{ marginBottom: 20, borderRadius: 14 }}
      />

      {/* KEYS TABLE — only when logged in */}
      {user ? (
        <Card
          style={{ borderRadius: 20 }}
          title={
            <Space>
              <SettingOutlined />
              <span>Your API Keys</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              style={{ borderRadius: 10, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', border: 'none', fontWeight: 600 }}
            >
              Generate New Key
            </Button>
          }
        >
          <Table
            dataSource={keys}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: <Empty description="No API keys yet" /> }}
            columns={[
              {
                title: 'Name', dataIndex: 'name', key: 'name',
                render: (t: string) => <Text strong>{t}</Text>,
              },
              {
                title: 'Key Prefix', dataIndex: 'prefix', key: 'prefix',
                render: (p: string) => (
                  <code style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                    {p}••••••••
                  </code>
                ),
              },
              {
                title: 'Status', dataIndex: 'is_active', key: 'is_active',
                render: (a: boolean) =>
                  a ? <Tag color="green">Active</Tag> : <Tag color="red">Revoked</Tag>,
              },
              {
                title: 'Created', dataIndex: 'created_at', key: 'created_at',
                render: (d: string) => new Date(d).toLocaleDateString(),
              },
              {
                title: 'Last Used', dataIndex: 'last_used_at', key: 'last_used_at',
                render: (d: string | null) =>
                  d ? new Date(d).toLocaleString() : <Text type="secondary">Never</Text>,
              },
              {
                title: 'Actions', key: 'actions',
                render: (_: any, record: APIKey) => (
                  <Space>
                    {record.is_active && (
                      <Popconfirm
                        title="Revoke this key?"
                        description="The key will stop working immediately."
                        onConfirm={() => handleRevoke(record.id)}
                        okText="Revoke" cancelText="Cancel"
                      >
                        <Tooltip title="Revoke">
                          <Button size="small" icon={<StopOutlined />} danger />
                        </Tooltip>
                      </Popconfirm>
                    )}
                    <Popconfirm
                      title="Delete permanently?"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Delete" cancelText="Cancel"
                    >
                      <Tooltip title="Delete">
                        <Button size="small" icon={<DeleteOutlined />} danger />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: 20, textAlign: 'center', padding: 40 }}>
          <LockOutlined style={{ fontSize: 42, color: '#94a3b8', marginBottom: 12 }} />
          <Title level={4} style={{ marginTop: 0 }}>
            Sign in to view your API keys
          </Title>
          <Text type="secondary">
            Once logged in, you can generate keys and manage them from this page.
          </Text>
        </Card>
      )}

      {/* CREATE MODAL */}
      <Modal
        title="Generate New API Key"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); setGeneratedKey(null); setNewKeyName(''); }}
        footer={null}
        width={560}
      >
        {!generatedKey ? (
          <>
            <Paragraph type="secondary">
              Give your key a descriptive name (e.g. "My Thesis Project", "Mobile App").
            </Paragraph>
            <Input
              size="large"
              placeholder="Key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onPressEnter={handleCreate}
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setCreateOpen(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" loading={creating} onClick={handleCreate}>
                Generate Key
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert
              type="warning"
              showIcon
              message="Copy your API key now"
              description="For security reasons, you won't be able to see this key again. Store it somewhere safe."
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
            <div
              style={{
                background: '#0f172a', color: '#e2e8f0', padding: 14,
                borderRadius: 10, fontFamily: 'monospace', fontSize: 13,
                wordBreak: 'break-all', marginBottom: 16,
              }}
            >
              {generatedKey}
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(generatedKey)}
                style={{ marginRight: 8 }}
              >
                Copy Key
              </Button>
              <Button onClick={() => { setGeneratedKey(null); setCreateOpen(false); }}>
                Done
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
