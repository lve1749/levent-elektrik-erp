'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console (production'da Sentry/monitoring'e gönderilir)
    console.error('Error Boundary caught error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/stok-analiz'
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback varsa onu kullan
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] p-6 text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
              </div>

              {/* Başlık */}
              <h2 className="text-xl font-semibold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-2">
                Bir Hata Oluştu
              </h2>

              {/* Açıklama */}
              <p className="text-[13px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)] mb-6">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 p-3 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                  <summary className="text-xs font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] cursor-pointer mb-2">
                    Hata Detayları (Geliştirici)
                  </summary>
                  <pre className="text-xs text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleReload}
                  className="w-full h-[38px] rounded-lg bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.50_0.22_263)] text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sayfayı Yenile
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full h-[38px] rounded-lg border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfaya Dön
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}