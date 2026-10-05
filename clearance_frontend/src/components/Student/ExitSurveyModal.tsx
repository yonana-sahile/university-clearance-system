import React, { useState } from 'react';
import { Modal, Rate, Input, Button, Typography, Space, message, Card, Progress } from 'antd';
import { SmileOutlined, CheckCircleFilled, FileDoneOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ExitSurveyProps {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export const ExitSurveyModal: React.FC<ExitSurveyProps> = ({ open, onClose, onCompleted }) => {
  const [libraryRating, setLibraryRating] = useState(4);
  const [cafeRating, setCafeRating] = useState(4);
  const [dormRating, setDormRating] = useState(4);
  const [departmentRating, setDepartmentRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem('mau_exit_survey_done') === 'true';
  });

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      localStorage.setItem('mau_exit_survey_done', 'true');
      setSubmitted(true);
      setSubmitting(false);
      onCompleted();
    }, 600);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={650}
      title={
        <Space align="center">
          <FileDoneOutlined style={{ color: '#2563eb' }} />
          <span style={{ fontWeight: 800, fontSize: 18 }}>MAU Graduating Class Exit Feedback Survey</span>
        </Space>
      }
    >
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <CheckCircleFilled style={{ fontSize: 56, color: '#16a34a', marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0, color: '#14532d', fontWeight: 800 }}>
            Exit Feedback Received!
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 14 }}>
            Thank you for contributing to the quality assurance of Mekdela Amba University. Your responses have been submitted to the Senate Committee.
          </Paragraph>
          <Button type="primary" onClick={onClose} style={{ borderRadius: 10, background: '#16a34a' }}>
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div style={{ padding: '10px 0' }}>
          <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 20 }}>
            Government university regulations require graduating students to complete an anonymous service feedback survey before final Registrar degree clearance.
          </Paragraph>

          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Card size="small" style={{ borderRadius: 12, background: '#f8fafc' }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>1. Main Library & E-Learning Resources</Text>
              <Rate value={libraryRating} onChange={setLibraryRating} />
            </Card>

            <Card size="small" style={{ borderRadius: 12, background: '#f8fafc' }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>2. Student Cafeteria & Catering Services</Text>
              <Rate value={cafeRating} onChange={setCafeRating} />
            </Card>

            <Card size="small" style={{ borderRadius: 12, background: '#f8fafc' }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>3. Dormitory & Residential Facilities</Text>
              <Rate value={dormRating} onChange={setDormRating} />
            </Card>

            <Card size="small" style={{ borderRadius: 12, background: '#f8fafc' }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>4. Department Academic Support & Advising</Text>
              <Rate value={departmentRating} onChange={setDepartmentRating} />
            </Card>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>5. Suggestions for MAU University Improvements</Text>
              <TextArea
                rows={3}
                placeholder="Share any additional comments or suggestions for future students..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={submitting}
              onClick={handleSubmit}
              style={{ borderRadius: 12, background: '#2563eb', fontWeight: 700, height: 48 }}
            >
              Submit Exit Survey & Confirm Clearance Status
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default ExitSurveyModal;

