import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import MotionButton from './ui/MotionButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <div className="p-4 rounded-full bg-red-500/10 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md">
            An unexpected error occurred in this section of the application. We've logged the issue.
          </p>
          
          <MotionButton
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary-500)] text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCcw size={18} />
            <span>Reload Application</span>
          </MotionButton>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-[var(--bg-card)] rounded-lg overflow-x-auto text-left max-w-2xl w-full border border-red-500/20">
              <p className="font-mono text-sm text-red-400 mb-2">{this.state.error?.toString()}</p>
              <pre className="font-mono text-xs text-[var(--text-muted)]">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
