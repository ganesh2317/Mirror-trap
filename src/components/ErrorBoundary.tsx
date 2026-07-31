import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Unhandled React Error Boundary Exception', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="card max-w-md w-full p-8 border-red-500/30 bg-bg-surface/80 backdrop-blur-xl shadow-glow space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Application Fault Intercepted</h2>
              <p className="mt-1 text-xs text-text-muted">
                MirrorTrap's SRE isolation layer caught an unexpected error. Your state and active traps remain secure.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-xl border border-red-500/20 bg-black/40 p-3 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button onClick={this.handleReset} className="btn-primary w-full !py-2.5 text-xs">
                <RefreshCw className="h-4 w-4 mr-1.5" /> Recover Session & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
