"use client"

import { useState } from "react"

export default function SimpleTestPage() {
  const [testMessage, setTestMessage] = useState("Click button to test")

  const handleClick = () => {
    console.log("Button clicked!")
    alert("Button works!")
    setTestMessage("Button clicked at " + new Date().toLocaleTimeString())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Button Test Page</h1>
        
        <p className="mb-4 text-gray-300">
          Message: {testMessage}
        </p>
        
        {/* HTML button test */}
        <button
          onClick={handleClick}
          className="w-full mb-4 p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          HTML Button Test
        </button>
        
        {/* Form test */}
        <form onSubmit={(e) => {
          e.preventDefault()
          console.log("Form submitted!")
          alert("Form works!")
        }}>
          <input 
            type="text" 
            placeholder="Test input"
            className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          />
          <button 
            type="submit"
            className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Form Submit Test
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-400">
          Open browser console (F12) to see logs
        </div>
      </div>
    </div>
  )
}
