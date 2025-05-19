"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { ModeToggle } from "./mode-toggle"
import { Menu, Radio, Sparkles } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Logo from "./logo"

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/events",
      label: "Events",
      active: pathname === "/events",
    },
    {
      href: "/my-events",
      label: "My Events",
      active: pathname === "/my-events",
    },
    {
      href: "/friends",
      label: "Friends",
      active: pathname === "/friends",
    },
    {
      href: "/chat-rooms",
      label: "Chat Rooms",
      active: pathname === "/chat-rooms",
    },
    {
      href: "/streams",
      label: "Live Streams",
      active: pathname === "/streams" || pathname.startsWith("/streams/"),
    },
    {
      href: "/beta-guide",
      label: "Beta Guide",
      active: pathname === "/beta-guide",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="mr-2 text-white">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gray-950 border-gray-800">
            <nav className="flex flex-col gap-4 mt-8">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    route.active ? "text-white" : "text-gray-400"
                  }`}
                >
                  {route.label}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    href="/dj-profile"
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary flex items-center ${
                      pathname === "/dj-profile" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    DJ Profile
                  </Link>

                  <Link
                    href="/dj/streams"
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary flex items-center ${
                      pathname.startsWith("/dj/streams") ? "text-white" : "text-gray-400"
                    }`}
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    My Streams
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`transition-colors hover:text-primary ${route.active ? "text-white" : "text-gray-400"}`}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {/* Beta Signup Button - NEW */}
          {!user && (
            <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-blue-500 rounded-full">
              <Link href="/signup" className="flex items-center">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Join Beta
              </Link>
            </Button>
          )}

          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || undefined}
                      alt={user.user_metadata?.name || "User"}
                    />
                    <AvatarFallback>{user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-950 border-gray-800" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.user_metadata?.name || "User"}</p>
                    <p className="text-xs leading-none text-gray-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                  <Link href="/dj-profile">DJ Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                  <Link href="/dj/streams">My Streams</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                  <Link href="/admin/streaming-setup">Streaming Setup</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                  <Link href="/admin/streaming-testing">Streaming Testing Guide</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-gray-300 focus:text-white focus:bg-gray-800"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full">
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
