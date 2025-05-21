"use client"

import { FirebaseImportChecker } from "@/components/firebase-import-checker"

export default function FirebaseImportTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Firebase Import Test</h1>
      <p className="mb-8">This page tests if all required Firebase exports are available.</p>

      <FirebaseImportChecker />
    </div>
  )
}
