export default function MinimalTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Test Page</h1>
      <p>This page contains no Firebase or complex dependencies.</p>
      <p className="mt-4">
        If this page builds but others don't, the issue is likely with Firebase or other dependencies.
      </p>
    </div>
  )
}
