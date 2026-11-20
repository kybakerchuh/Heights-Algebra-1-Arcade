import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendlyMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed && typeof parsed.error === 'string') {
          friendlyMessage = `Database permission or sync error (${parsed.operationType || 'read'}): ${parsed.error}`;
        }
      } catch {
        // Use plain message
      }

      return (
        <div className="min-h-screen bg-[#0A0A0C] text-[#F8F7F4] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#131317] border border-[#F5B700]/30 rounded-xl p-8 space-y-5">
            <div className="flex items-center gap-3 text-[#F5B700]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Something Went Off Track
              </h1>
            </div>
            <p className="text-sm text-[#B3B1AA] leading-relaxed">
              {friendlyMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5B700] text-[#0A0A0C] font-semibold text-sm rounded-lg hover:bg-[#FFD038] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Arcade
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
