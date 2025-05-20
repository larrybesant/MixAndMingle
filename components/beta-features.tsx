import { Music, Video, MessageSquare, Gift, Users, Zap } from "lucide-react"

export function BetaFeatures() {
  const features = [
    {
      icon: <Music className="h-10 w-10 text-primary" />,
      title: "Live DJ Rooms",
      description:
        "Join live DJ sets from around the world. Chat and mingle with other music lovers in real-time audio rooms.",
    },
    {
      icon: <Video className="h-10 w-10 text-primary" />,
      title: "Video Chat Rooms",
      description:
        "Connect face-to-face with friends and new connections in our high-quality video rooms with up to 16 participants.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Enhanced Chat",
      description: "Test our feature-rich chat system with emoji reactions, file sharing, and threaded conversations.",
    },
    {
      icon: <Gift className="h-10 w-10 text-primary" />,
      title: "Virtual Gifts",
      description: "Send and receive virtual gifts to show appreciation for great DJ sets and engaging conversations.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Community Building",
      description:
        "Create and join communities based on music genres, interests, and more. Build your network of music enthusiasts.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Premium Features",
      description:
        "Experience all premium features during the beta period, including HD streaming, extended room limits, and more.",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-6 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors"
        >
          <div className="mb-4">{feature.icon}</div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
