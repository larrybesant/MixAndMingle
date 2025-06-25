"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2, Database } from "lucide-react";

export default function Auth405FixComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const applyFix = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/fix-auth-405", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to apply fix",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Auth 405 Error Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>
            If users are experiencing &quot;405 status code returned from
            hook&quot; errors during password reset or signup, this indicates a
            database trigger issue that can be automatically fixed.
          </p>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <div>
                  <strong>{result.success ? "Success!" : "Error:"}</strong>{" "}
                  {result.message}
                  {result.error && (
                    <div className="mt-1 text-sm opacity-75">
                      Details: {result.error}
                    </div>
                  )}
                  {!result.success && (
                    <div className="mt-2 text-sm">
                      <strong>Manual Fix:</strong> Go to your Supabase dashboard
                      → SQL Editor and run the SQL from
                      <code className="mx-1 px-1 bg-gray-100 rounded">
                        database/ENHANCED-AUTH-FIX.sql
                      </code>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={applyFix}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying Fix...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Apply Database Fix
              </>
            )}
          </Button>

          {result?.success && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Test Password Reset
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>What this fix does:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Creates/updates the database trigger function for automatic
              profile creation
            </li>
            <li>Adds proper error handling to prevent 405 errors</li>
            <li>Ensures compatibility with Supabase auth flows</li>
            <li>Updates existing profiles with default usernames if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
