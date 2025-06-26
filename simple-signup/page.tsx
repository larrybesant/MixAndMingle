"use client"

import { useState } from "react"

export default function SimpleSignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with:", { username, email, password })
    setMessage(`Form submitted! Username: ${username}, Email: ${email}`)
    alert("Form submission works!")
  }

  const handleTestClick = () => {
    console.log("Test button clicked!")
    alert("Test button works!")
    setMessage("Test button clicked at " + new Date().toLocaleTimeString())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-6">
          Simple Signup Test
        </h1>
        
        {message && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded text-green-400 text-sm">
            {message}
          </div>
        )}
        
        <div className="mb-4 text-xs text-gray-400 bg-gray-900/30 p-2 rounded">
          Debug: Username: {username.length}, Email: {email.length}, Password: {password.length}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 rounded"
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 rounded"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 rounded"
          />
          
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Sign Up (Form Submit)
          </button>
          
          <button
            type="button"
            onClick={handleTestClick}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            Test Button (Outside Form)
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          Open browser console (F12) to see debug logs<br/>
          <a href="/signup" className="text-purple-400 hover:text-purple-300 underline">
            Back to main signup
          </a>
        </div>
      </div>
    </div>
  )
}
