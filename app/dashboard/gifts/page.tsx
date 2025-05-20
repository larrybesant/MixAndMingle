import { VirtualGifts } from "@/components/virtual-gifts"

export default function GiftsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-3xl font-bold">Virtual Gifts</h1>
      <p className="text-muted-foreground">Send virtual gifts to other users to show your appreciation.</p>
      <VirtualGifts />
    </div>
  )
}
