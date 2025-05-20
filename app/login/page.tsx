import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"
import { AuthDiagnostics } from "@/components/auth-diagnostics"

export const metadata: Metadata = {
  title: "Login | Mix & Mingle",
  description: "Login to your Mix & Mingle account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <AuthDiagnostics />
    </div>
  )
}
