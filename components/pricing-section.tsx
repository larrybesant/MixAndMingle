import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose Your Plan</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Select the perfect plan that suits your needs and budget.
            </p>
          </div>
        </div>
        <div className="grid gap-6 pt-12 lg:grid-cols-3 lg:gap-8">
          <Card>
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <CardTitle className="text-2xl font-bold">Free</CardTitle>
              <CardDescription>Essential features for everyone</CardDescription>
              <div className="mt-4 text-4xl font-bold">$0</div>
              <p className="text-sm text-muted-foreground">Forever free</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic user profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Join public chat rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Limited audio rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Send basic virtual gifts</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
          <Card className="border-primary">
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <CardTitle className="text-2xl font-bold">Premium</CardTitle>
              <CardDescription>Advanced features for enthusiasts</CardDescription>
              <div className="mt-4 text-4xl font-bold">$9.99</div>
              <p className="text-sm text-muted-foreground">Per month</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Enhanced user profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Create private chat rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited audio rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>HD video quality</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Premium virtual gifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Ad-free experience</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button className="w-full">Subscribe Now</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <CardTitle className="text-2xl font-bold">VIP</CardTitle>
              <CardDescription>Ultimate features for power users</CardDescription>
              <div className="mt-4 text-4xl font-bold">$19.99</div>
              <p className="text-sm text-muted-foreground">Per month</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All Premium features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Exclusive VIP chat rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>4K video quality</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Exclusive virtual gifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Profile boosts</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button className="w-full">Go VIP</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
