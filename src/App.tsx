import React from 'react'
import { IdeLayout } from './layout/IdeLayout'
import { ErrorBoundary } from './components/ErrorBoundary'

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <IdeLayout />
    </ErrorBoundary>
  )
}

export default App
