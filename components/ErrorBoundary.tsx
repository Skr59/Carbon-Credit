"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 text-center p-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-black text-stone-800 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-md">
            An unexpected error occurred:{" "}
            <span className="font-mono text-rose-500">
              {this.state.error?.message}
            </span>
          </p>
          <button
            onClick={this.handleReset}
            className="bg-estate-600 hover:bg-estate-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
