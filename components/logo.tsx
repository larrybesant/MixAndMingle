import { Music } from "lucide-react"

export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-xl text-orange-500">MIX</span>
        <Music className="h-5 w-5 text-white" />
        <span className="font-bold text-xl text-blue-500">MINGLE</span>
      </div>
      <div className="ml-2 px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-medium text-blue-400 uppercase">
        Beta
      </div>
    </div>
  )
}
