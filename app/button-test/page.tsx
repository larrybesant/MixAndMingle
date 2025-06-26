"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ButtonTestPage() {
  const [clickCount, setClickCount] = useState(0)
  const [lastClicked, setLastClicked] = useState("")

  const handleClick = (buttonName: string) => {
    setClickCount((prev) => prev + 1)
    setLastClicked(buttonName)
    alert(`${buttonName} clicked! Total clicks: ${clickCount + 1}`)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Card className="max-w-2xl mx-auto bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Button Clickability Test</CardTitle>
          <p className="text-gray-400">Test if buttons are working properly</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Click Counter */}
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold text-green-400">Total Clicks: {clickCount}</h3>
            <p className="text-gray-400">Last clicked: {lastClicked || "None"}</p>
          </div>

          {/* Basic Buttons */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Basic Buttons</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleClick("Primary Button")}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Primary Button
              </Button>

              <Button
                onClick={() => handleClick("Secondary Button")}
                variant="secondary"
                className="cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Secondary Button
              </Button>

              <Button
                onClick={() => handleClick("Outline Button")}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Outline Button
              </Button>

              <Button
                onClick={() => handleClick("Destructive Button")}
                variant="destructive"
                className="cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Destructive Button
              </Button>
            </div>
          </div>

          {/* Large Buttons */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Large Buttons</h4>
            <Button
              onClick={() => handleClick("Large Button")}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer text-lg py-4"
              style={{ pointerEvents: "auto" }}
            >
              Large Button - Click Me!
            </Button>
          </div>

          {/* HTML Buttons */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">HTML Buttons</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleClick("HTML Button 1")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                HTML Button 1
              </button>

              <button
                onClick={() => handleClick("HTML Button 2")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                HTML Button 2
              </button>
            </div>
          </div>

          {/* Div Buttons */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Div Buttons</h4>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => handleClick("Div Button 1")}
                className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded cursor-pointer text-center"
                style={{ pointerEvents: "auto" }}
              >
                Div Button 1
              </div>

              <div
                onClick={() => handleClick("Div Button 2")}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded cursor-pointer text-center"
                style={{ pointerEvents: "auto" }}
              >
                Div Button 2
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                setClickCount(0)
                setLastClicked("")
                alert("Reset complete!")
              }}
              variant="outline"
              className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black cursor-pointer"
              style={{ pointerEvents: "auto" }}
            >
              Reset Counter
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Instructions:</h4>
            <ul className="text-gray-400 space-y-1 text-sm">
              <li>• Click any button above</li>
              <li>• You should see an alert popup</li>
              <li>• The counter should increase</li>
              <li>• If buttons don't work, tell me which ones</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
