import { AppDiagnostics } from "@/components/app-diagnostics"

export default function TestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Mix & Mingle System Test</h1>
      <div className="max-w-md mx-auto">
        <AppDiagnostics />
      </div>
    </div>
  )
}
