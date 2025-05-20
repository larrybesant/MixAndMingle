import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { FirebaseError } from "firebase/app"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "./firebase-client"

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        try {
          const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

          if (userCredential.user) {
            // Get the ID token
            const idToken = await userCredential.user.getIdToken()

            return {
              id: userCredential.user.uid,
              name: userCredential.user.displayName,
              email: userCredential.user.email,
              image: userCredential.user.photoURL,
              idToken,
            }
          }
          return null
        } catch (error) {
          if (error instanceof FirebaseError) {
            throw new Error(error.code)
          }
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.idToken = (user as any).idToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session as any).idToken = token.idToken
      }
      return session
    },
  },
}
