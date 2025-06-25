export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Debug Page</h1>
        <p className="text-gray-600">
          This is a basic debug page. For advanced authentication debugging, visit{' '}
          <a href="/auth-debug" className="text-blue-600 hover:underline">
            /auth-debug
          </a>
        </p>
      </div>
    </div>
  );
}
