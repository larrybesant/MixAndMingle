"use client"

import { LoginForm } from "@/components/login-form"
import Logo from "@/components/Logo"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-gradient flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="max-w-md mx-auto bg-muted/30 backdrop-blur-sm p-8 rounded-xl border border-border">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
          <LoginForm />
        </div>
      </div>

      <footer className="mt-auto border-t border-border/40 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-foreground/60">
            © {new Date().getFullYear()} Mix & Mingle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
