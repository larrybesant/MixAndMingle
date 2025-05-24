import { AuthProvider } from "@/contexts/auth-context"
import LoginTestSystem from "@/components/auth/login-test-system"

export default function TestLoginPage() {
  return (
    <AuthProvider>
      <LoginTestSystem />
    </AuthProvider>
  )
}
