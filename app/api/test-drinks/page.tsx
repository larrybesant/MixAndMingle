"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function TestDrinksAPI() {
  const [drinks, setDrinks] = useState<any[]>([])
  const [selectedDrink, setSelectedDrink] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET")
  const [endpoint, setEndpoint] = useState("/api/drinks")
  const [requestBody, setRequestBody] = useState("")

  // Fetch drinks on initial load
  useEffect(() => {
    fetchDrinks()
  }, [])

  const fetchDrinks = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/drinks")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch drinks")
      }

      setDrinks(data)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDrink = (drink: any) => {
    setSelectedDrink(drink)
    setEndpoint(`/api/drinks/${drink.id}`)
    setMethod("GET")
    setRequestBody("")
  }

  const handleNewDrink = () => {
    setSelectedDrink(null)
    setEndpoint("/api/drinks")
    setMethod("POST")
    setRequestBody(
      JSON.stringify(
        {
          name: "",
          description: "",
          category: "cocktail",
          alcoholic: true,
          ingredients: [],
          instructions: "",
          image: "",
          popular: false,
        },
        null,
        2,
      ),
    )
  }

  const handleEditDrink = () => {
    if (!selectedDrink) return

    setEndpoint(`/api/drinks/${selectedDrink.id}`)
    setMethod("PUT")
    setRequestBody(JSON.stringify(selectedDrink, null, 2))
  }

  const handleDeleteDrink = () => {
    if (!selectedDrink) return

    setEndpoint(`/api/drinks/${selectedDrink.id}`)
    setMethod("DELETE")
    setRequestBody("")
  }

  const handleSendRequest = async () => {
    try {
      setLoading(true)
      setError(null)

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (method !== "GET" && method !== "DELETE" && requestBody) {
        options.body = requestBody
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }

      setResult(data)

      // Refresh drinks list if we modified data
      if (method !== "GET") {
        fetchDrinks()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatCurlCommand = () => {
    let curl = `curl -X ${method} "${window.location.origin}${endpoint}"`

    if (method !== "GET" && method !== "DELETE" && requestBody) {
      curl += ` -H "Content-Type: application/json" -d '${requestBody}'`
    }

    return curl
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Drinks API Tester</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Drinks</CardTitle>
            <CardDescription>Select a drink to test API operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={handleNewDrink} className="w-full">
                New Drink
              </Button>

              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {drinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {drinks.map((drink) => (
                    <div
                      key={drink.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                        selectedDrink?.id === drink.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSelectDrink(drink)}
                    >
                      <p className="font-medium">{drink.name}</p>
                      <p className="text-sm text-muted-foreground">{drink.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Request</CardTitle>
            <CardDescription>Configure and send API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-24">
                    <Label htmlFor="method">Method</Label>
                    <select
                      id="method"
                      className="w-full p-2 border rounded-md"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as any)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <Input id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
                  </div>
                </div>

                {(method === "POST" || method === "PUT") && (
                  <div>
                    <Label htmlFor="body">Request Body</Label>
                    <Textarea
                      id="body"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="font-mono h-64"
                    />
                  </div>
                )}

                <div>
                  <Label>cURL Command</Label>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto">{formatCurlCommand()}</div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSendRequest} disabled={loading}>
                    {loading ? "Sending..." : "Send Request"}
                  </Button>

                  {selectedDrink && (
                    <>
                      <Button variant="outline" onClick={handleEditDrink}>
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteDrink}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="response">
                {result && (
                  <div>
                    <Label>Response</Label>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto h-96 overflow-y-auto">
                      <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
