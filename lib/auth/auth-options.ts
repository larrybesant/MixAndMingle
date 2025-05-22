import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getFirebaseAuth } from "@/lib/firebase/firebase-admin"
import { FirebaseError } from "firebase-admin/app"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const auth = getFirebaseAuth()
          const userRecord = await auth.getUserByEmail(credentials.email)

          // In a real implementation, you would verify the password
          // This is just a placeholder since Firebase Admin SDK doesn't have a direct way to verify passwords

          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
            image: userRecord.photoURL,
          }
        } catch (error) {
          if (error instanceof FirebaseError) {
            console.error("Firebase auth error:", error.code, error.message)
          } else {
            console.error("Unknown auth error:", error)
          }
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
