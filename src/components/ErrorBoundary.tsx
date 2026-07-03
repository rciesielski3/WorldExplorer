import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { logger } from '../../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
      errorInfo: error.toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error', {
      context: 'ErrorBoundary',
      timestamp: new Date().toISOString(),
      metadata: {
        errorMessage: error?.message,
        componentStack: errorInfo?.componentStack,
      },
    });
    // In a production app, you would send this to an error tracking service like Sentry
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#0b0b16',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 32,
            }}
            showsVerticalScrollIndicator={false}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={64}
              color="#EF4444"
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Something Went Wrong
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#9CA3AF',
                marginBottom: 24,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              The app encountered an unexpected error. We're sorry for the inconvenience.
              Please try again or restart the app.
            </Text>

            {this.state.error && (
              <View
                style={{
                  backgroundColor: '#1F2937',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 24,
                  maxHeight: 120,
                  width: '100%',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: '#F87171',
                    fontFamily: 'monospace',
                  }}
                  numberOfLines={6}
                >
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={this.handleReset}
              style={{
                backgroundColor: '#1E88E5',
                paddingVertical: 12,
                paddingHorizontal: 32,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // This would require access to navigation, but at error boundary level
                // we can only offer to try again or show error details
                logger.info('User dismissed error boundary', {
                  context: 'ErrorBoundary',
                  timestamp: new Date().toISOString(),
                });
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 32,
              }}
            >
              <Text
                style={{
                  color: '#9CA3AF',
                  fontSize: 14,
                  textAlign: 'center',
              }}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
