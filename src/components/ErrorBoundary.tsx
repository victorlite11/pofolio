import React from 'react';

type State = {
  error: Error | null;
  info: React.ErrorInfo | null;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // store the stack/info for display
    this.setState({ error, info });
    // also log to console (or send to logging backend)
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React tree:', error, info);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children as React.ReactElement;

    return (
      <div className="p-6 bg-red-900 text-white h-screen w-full overflow-auto font-sans">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-4">An unexpected error occurred while rendering the application.</p>
        <div className="mb-4">
          <strong>Error:</strong>
          <pre className="whitespace-pre-wrap text-sm bg-black/30 p-2 rounded mt-2">{error && (error.message || String(error))}</pre>
        </div>
        {info && (
          <div className="mb-4">
            <strong>Component Stack:</strong>
            <pre className="whitespace-pre-wrap text-xs bg-black/20 p-2 rounded mt-2">{info.componentStack}</pre>
          </div>
        )}
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 rounded bg-white text-red-900 font-medium"
          >
            Reload
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(`${error?.message}\n\n${info?.componentStack || ''}`)}
            className="px-3 py-1 rounded bg-white/20 border border-white/30"
          >
            Copy details
          </button>
        </div>
      </div>
    );
  }
}
