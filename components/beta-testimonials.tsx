import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function BetaTestimonials() {
  const testimonials = [
    {
      quote:
        "Being a beta tester for Mix & Mingle has been amazing. I've discovered so many new artists and made friends with similar music tastes.",
      name: "Alex Johnson",
      role: "Music Producer",
      avatar: "/avatars/alex.png",
      initials: "AJ",
    },
    {
      quote:
        "The video quality in the DJ rooms is incredible. I feel like I'm actually at a live event when I join sessions.",
      name: "Samantha Lee",
      role: "Music Enthusiast",
      avatar: "/avatars/samantha.png",
      initials: "SL",
    },
    {
      quote:
        "As a DJ, this platform gives me a way to connect with fans in a much more personal way than just streaming my sets.",
      name: "Marcus Chen",
      role: "Professional DJ",
      avatar: "/avatars/marcus.png",
      initials: "MC",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="bg-background/50 backdrop-blur-sm border-primary/20">
          <CardContent className="pt-6">
            <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
          </CardContent>
          <CardFooter className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
              <AvatarFallback>{testimonial.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
