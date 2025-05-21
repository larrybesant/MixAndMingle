import { Logo } from "@/components/Logo"

export default function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Loading</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-center mt-4 text-gray-400">Please wait...</p>
      </div>
    </div>
  )
}
