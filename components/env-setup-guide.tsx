"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"

export function EnvSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" /> Firebase Environment Setup Guide
        </CardTitle>
        <CardDescription>Follow these steps to configure your Firebase environment variables</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              {isOpen ? "Hide Setup Guide" : "Show Setup Guide"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">1. Create a Firebase Project</h3>
                <p className="text-muted-foreground mt-1">
                  Go to the{" "}
                  <a
                    href="https://console.firebase.google.com/"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Firebase Console
                  </a>{" "}
                  and create a new project.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">2. Add a Web App to Your Project</h3>
                <p className="text-muted-foreground mt-1">Click on the web icon (&lt;/&gt;) and register your app.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium">3. Copy Firebase Configuration</h3>
                <p className="text-muted-foreground mt-1">Copy the firebaseConfig object from the setup code.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium">4. Create Environment Variables</h3>
                <p className="text-muted-foreground mt-1">
                  Create a <code className="bg-muted px-1 rounded">.env.local</code> file in your project root with the
                  following variables:
                </p>
                <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                  <code>{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# For Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour Private Key Here\\n-----END PRIVATE KEY-----\\n"
`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium">5. Generate Admin SDK Credentials</h3>
                <p className="text-muted-foreground mt-1">
                  For server-side functions, go to Project Settings &gt; Service Accounts &gt; Generate new private key.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">6. Enable Authentication Methods</h3>
                <p className="text-muted-foreground mt-1">
                  Go to Authentication &gt; Sign-in method and enable Email/Password authentication.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">7. Start the Development Server</h3>
                <p className="text-muted-foreground mt-1">
                  Run <code className="bg-muted px-1 rounded">npm run dev</code> to start your application with the new
                  environment variables.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          After setting up the environment variables, restart your development server for the changes to take effect.
        </p>
      </CardFooter>
    </Card>
  )
}
