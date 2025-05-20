"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "../contexts/AuthContext"
import Logo from "./Logo"
import Button from "./Button"
import { Menu, X, User, LogOut } from "lucide-react"

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [router.pathname])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-gradient">
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/rooms" className="text-foreground/80 hover:text-foreground transition-colors">
                Browse Rooms
              </Link>
              {currentUser ? (
                <>
                  <Link href="/create-room" className="text-foreground/80 hover:text-foreground transition-colors">
                    Create Room
                  </Link>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <User size={18} />
                      <span>{currentUser.displayName}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Button href="/login" variant="outline" className="py-2">
                    Sign In
                  </Button>
                  <Button href="/signup" className="py-2">
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 flex flex-col gap-4">
              <Link href="/rooms" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                Browse Rooms
              </Link>
              {currentUser ? (
                <>
                  <Link href="/create-room" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                    Create Room
                  </Link>
                  <Link href="/profile" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-foreground/80 hover:text-foreground transition-colors py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button href="/login" variant="outline">
                    Sign In
                  </Button>
                  <Button href="/signup">Sign Up</Button>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} Mix & Mingle. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
