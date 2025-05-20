"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Common emojis
const commonEmojis = [
  "😀",
  "😂",
  "😊",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "👍",
  "👏",
  "🙌",
  "❤️",
  "🔥",
  "✨",
  "🎉",
  "👋",
  "🤝",
  "🙏",
  "💯",
  "🎂",
  "🎁",
]

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter emojis based on search term
  const filteredEmojis = searchTerm ? commonEmojis.filter((emoji) => emoji.includes(searchTerm)) : commonEmojis

  return (
    <div className="w-64">
      <Input
        type="text"
        placeholder="Search emoji..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      <div className="grid grid-cols-5 gap-1">
        {filteredEmojis.map((emoji) => (
          <Button key={emoji} variant="ghost" className="h-8 w-8 p-0" onClick={() => onEmojiSelect(emoji)}>
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}
