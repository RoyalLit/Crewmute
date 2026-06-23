import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { brandColors, spacing } from '../design/tokens';

interface ErrorBoundaryColors {
  background: string;
  text: string;
  textSecondary: string;
  card: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  colors?: ErrorBoundaryColors;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const c = this.props.colors ?? {
        background: '#F7F7FC',
        text: '#1C1C2E',
        textSecondary: '#8B8FA8',
        card: '#FFFFFF',
      };

      return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
          <Text style={[styles.title, { color: c.text }]}>Something went wrong</Text>
          <Text style={[styles.message, { color: c.textSecondary }]}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary(props: Omit<ErrorBoundaryProps, 'colors'>) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors: ErrorBoundaryColors = {
    background: isDark ? '#0F0F1A' : '#F7F7FC',
    text: isDark ? '#F0F0FF' : '#1C1C2E',
    textSecondary: '#8B8FA8',
    card: isDark ? '#1C1C2E' : '#FFFFFF',
  };
  return <ErrorBoundaryClass {...props} colors={colors} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: brandColors.brandNavy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
