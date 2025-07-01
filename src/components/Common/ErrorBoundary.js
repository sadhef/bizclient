import React from 'react';
import { useTheme } from '../../context/ThemeContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg rounded-lg p-8 text-center`}>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Something went wrong
        </h3>
        
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-6`}>
          An unexpected error occurred. Please try refreshing the page.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className={`text-left text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            <summary className="cursor-pointer mb-2">Error Details</summary>
            <pre className="whitespace-pre-wrap break-words">{error.toString()}</pre>
          </details>
        )}
        
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 ${
              isDark 
                ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500' 
                : 'bg-gray-300 text-gray-900 hover:bg-gray-400 focus:ring-gray-500'
            }`}
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;