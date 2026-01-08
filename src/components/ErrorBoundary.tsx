import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logErrorTelemetry } from '../utils/telemetry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    logErrorTelemetry(error, { componentStack: errorInfo.componentStack })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="h-full w-full flex items-center justify-center bg-neutral-950 text-neutral-200">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Algo salió mal</h2>
            <p className="text-sm text-neutral-400 mb-4">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

