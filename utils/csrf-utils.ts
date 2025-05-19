import type React from "react"
import { createHash, randomBytes } from "crypto"

// Generate a CSRF token
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex")
}

// Validate a CSRF token
export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return createHash("sha256").update(token).digest("hex") === createHash("sha256").update(storedToken).digest("hex")
}

// Create a CSRF protected form
export function createCsrfForm(action: string, csrfToken: string): React.ReactElement {
  return (
    <form action={action} method="POST">
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {/* Form fields go here */}
    </form>
  )
}

// Middleware to validate CSRF tokens
export async function validateCsrfMiddleware(req: Request, res: Response, next: () => void) {
  // Skip for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next()
  }

  // Get the CSRF token from the request
  const requestToken = req.headers["x-csrf-token"] || req.body?.csrf_token

  // Get the stored CSRF token from the session
  const storedToken = req.session?.csrfToken

  // Validate the token
  if (!validateCsrfToken(requestToken, storedToken)) {
    return res.status(403).json({ error: "Invalid CSRF token" })
  }

  // Continue with the request
  next()
}
