import Link from "next/link"
import { Music } from "lucide-react"

export default function Logo({ size = "default" }) {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl md:text-3xl",
    large: "text-4xl md:text-5xl",
  }

  return (
    <Link href="/" className="flex items-center gap-1">
      <span className={`font-bold neon-text-orange ${sizeClasses[size]}`}>MIX</span>
      <Music
        className={`text-secondary animate-pulse-glow ${size === "small" ? "h-5 w-5" : size === "large" ? "h-10 w-10" : "h-7 w-7"}`}
      />
      <span className={`font-bold neon-text-blue ${sizeClasses[size]}`}>MINGLE</span>
    </Link>
  )
}
