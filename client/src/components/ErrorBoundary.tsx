import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Game error:", error, errorInfo);
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="font-game-display text-3xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-white/60 mb-6 max-w-sm">
            Don't worry, your progress is saved. Try refreshing the page.
          </p>
          <Button
            onClick={this.handleReset}
            className="bg-game-primary hover:bg-game-primary/90"
          >
            Return Home
          </Button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-8 text-xs text-left text-white/40 overflow-auto max-w-lg">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
