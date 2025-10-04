import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p className="text-sm">Grafik yüklenirken hata oluştu</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs text-blue-500 hover:underline"
          >
            Tekrar dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}