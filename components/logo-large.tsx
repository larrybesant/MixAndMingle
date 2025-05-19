import { Music } from "lucide-react"

export default function LogoLarge() {
  return (
    <div className="flex items-center space-x-3">
      <span className="font-bold text-3xl text-orange-500">MIX</span>
      <Music className="h-7 w-7 text-white" />
      <span className="font-bold text-3xl text-blue-500">MINGLE</span>
    </div>
  )
}
