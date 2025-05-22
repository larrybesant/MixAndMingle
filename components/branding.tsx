import Image from "next/image"
import Link from "next/link"
import { APP_NAME } from "@/app/config"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8">
        <Image src="/logo.png" alt={APP_NAME} fill className="object-contain" priority />
      </div>
      <span className="font-bold text-xl">
        <span className="text-orange-500">MIX</span> <span className="text-purple-500">MINGLE</span>
      </span>
    </Link>
  )
}

export function FooterLogo() {
  return (
    <div className="flex flex-col items-center">
      <Logo className="mb-2" />
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  )
}
