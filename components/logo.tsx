import { Music } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-1 text-3xl font-bold">
      <span className="neon-text-orange">MIX</span>
      <Music className="h-8 w-8 text-secondary animate-pulse-glow" />
      <span className="neon-text-blue">MINGLE</span>
    </div>
  )
}
