import PolyfillTest from "@/components/polyfill-test"

export default function PolyfillTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Node.js Polyfill Test</h1>
      <p className="mb-6">This page tests whether Node.js built-in modules are correctly polyfilled for browser use.</p>
      <PolyfillTest />
    </div>
  )
}
