import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Input, message, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiFetch } from '../../utils/api';

const { Title, Text } = Typography;

export default function StaffChecklistManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('staff/checklist');
      setItems(data);
    } catch (err) {
      message.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleAdd = async (values: any) => {
    try {
      await apiFetch('staff/checklist', { method: 'POST', body: JSON.stringify(values) });
      message.success('Checklist item added!');
      form.resetFields();
      loadItems();
    } catch (err: any) {
      message.error(err.message || 'Failed to add item');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`staff/checklist/${id}`, { method: 'DELETE' });
      message.success('Item deleted');
      loadItems();
    } catch (err: any) {
      message.error('Failed to delete item');
    }
  };

  return (
    <Card style={{ borderRadius: 16, marginTop: 24 }}>
      <Title level={4}>Manage My Department's Pre-Clearance Checklist</Title>
      <Text type="secondary">Students will see these items before they can apply for clearance.</Text>

      <Form layout="inline" onFinish={handleAdd} style={{ margin: '20px 0', gap: 8, flexWrap: 'wrap' }}>
        <Form.Item name="label" rules={[{ required: true }]} style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Requirement Title (e.g. Return Lab Kit)" size="large" />
        </Form.Item>
        <Form.Item name="description" rules={[{ required: true }]} style={{ flex: 2, minWidth: 300 }}>
          <Input placeholder="Detailed description for the student..." size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" icon={<PlusOutlined />}>Add Requirement</Button>
      </Form>

      <Table dataSource={items} rowKey="id" loading={loading} size="small" pagination={false}>
        <Table.Column title="Title" dataIndex="label" render={(t) => <Text strong>{t}</Text>} />
        <Table.Column title="Description" dataIndex="description" />
        <Table.Column title="Action" width={80} render={(_, r: any) => (
          <Popconfirm title="Delete this item?" onConfirm={() => handleDelete(r.id)}>
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        )} />
      </Table>
    </Card>
  );
}
