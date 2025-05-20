import { Users, MessageSquare, Video, Gift, CreditCard, Shield } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features That Connect People</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Mix & Mingle offers a comprehensive suite of features designed to create meaningful connections.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">User Profiles</h3>
            <p className="text-center text-muted-foreground">
              Create detailed profiles to showcase your interests and connect with like-minded people.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <MessageSquare className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Chat Rooms</h3>
            <p className="text-center text-muted-foreground">
              Join public chat rooms or create private ones to discuss topics that matter to you.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Video className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Video & Audio Rooms</h3>
            <p className="text-center text-muted-foreground">
              Experience real-time video and audio conversations with friends and new connections.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Gift className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Virtual Gifts</h3>
            <p className="text-center text-muted-foreground">
              Send and receive virtual gifts to show appreciation to other users.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <CreditCard className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Premium Subscriptions</h3>
            <p className="text-center text-muted-foreground">
              Unlock exclusive features and benefits with our premium subscription plans.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Shield className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Privacy & Security</h3>
            <p className="text-center text-muted-foreground">
              Your data is protected with advanced security measures and privacy controls.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
