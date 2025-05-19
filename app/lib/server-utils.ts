import { cookies, headers } from "next/headers"

export function getServerCookies() {
  return cookies()
}

export function getServerHeaders() {
  return headers()
}
