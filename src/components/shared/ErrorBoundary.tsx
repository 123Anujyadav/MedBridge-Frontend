import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
          <div className="flex max-w-md flex-col items-center text-center space-y-4 rounded-3xl border border-border-subtle bg-card p-8 shadow-card-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="font-headline text-headline-md text-foreground">Something went wrong</h2>
            <p className="text-body-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred while rendering this component."}
            </p>
            {this.state.errorInfo && (
              <details className="w-full text-left text-xs bg-surface-container-low p-3 rounded-lg overflow-auto max-h-40 border border-border-subtle">
                <summary className="cursor-pointer font-semibold mb-1 text-muted-foreground">Stack Trace</summary>
                <pre className="whitespace-pre-wrap text-[11px] font-mono text-foreground">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
