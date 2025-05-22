import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LegalDocumentLayoutProps {
  title: string
  lastUpdated?: string
  children: React.ReactNode
}

export function LegalDocumentLayout({ title, lastUpdated, children }: LegalDocumentLayoutProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>}
        </div>

        <div className="prose prose-slate max-w-none">{children}</div>

        <div className="mt-8 pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Mix & Mingle. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Button variant="link" size="sm" asChild>
                <Link href="/terms">Terms</Link>
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/privacy">Privacy</Link>
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
