import React, { ErrorInfo, ReactNode } from 'react';
import { Card, Button, Typography } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f8fafc'
        }}>
          <Card
            style={{
              maxWidth: 500,
              width: '100%',
              borderRadius: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              textAlign: 'center',
              padding: 20
            }}
          >
            <WarningOutlined style={{ fontSize: 56, color: '#faad14', marginBottom: 16 }} />
            <Title level={3}>Something went wrong</Title>
            <Paragraph type="secondary">
              {this.state.error?.message || 'An unexpected error occurred in the application.'}
            </Paragraph>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                marginTop: 12
              }}
            >
              Refresh Application
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
