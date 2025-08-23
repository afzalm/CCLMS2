import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { comparePassword } from "@/lib/jwt"

const prisma = new PrismaClient()

export async function getAuthConfig() {
  // Load SSO providers from database
  const ssoProviders = await prisma.sSOProvider.findMany({
    where: { enabled: true }
  })

  const providers = [
    // Always include credentials provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              avatar: true,
              password: true
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await comparePassword(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar
          }
        } catch (error) {
          console.error("Credentials authentication error:", error)
          return null
        }
      }
    })
  ]

  // Add enabled SSO providers
  for (const provider of ssoProviders) {
    if (!provider.clientId || !provider.clientSecret) continue

    try {
      const scopes = provider.scopes ? JSON.parse(provider.scopes) : []

      switch (provider.name) {
        case "google":
          providers.push(GoogleProvider({
            clientId: provider.clientId,
            clientSecret: provider.clientSecret,
            authorization: {
              params: {
                scope: scopes.join(" ") || "openid email profile"
              }
            }
          }))
          break

        case "facebook":
          providers.push(FacebookProvider({
            clientId: provider.clientId,
            clientSecret: provider.clientSecret,
            authorization: {
              params: {
                scope: scopes.join(" ") || "email"
              }
            }
          }))
          break

        case "linkedin":
          providers.push(LinkedInProvider({
            clientId: provider.clientId,
            clientSecret: provider.clientSecret,
            authorization: {
              params: {
                scope: scopes.join(" ") || "openid profile email"
              }
            },
            issuer: "https://www.linkedin.com",
            jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
            profile(profile, tokens) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture
              }
            }
          }))
          break
      }
    } catch (error) {
      console.error(`Failed to configure ${provider.name} provider:`, error)
    }
  }

  return {
    providers,
    callbacks: {
      async signIn({ user, account, profile }: any) {
        if (account?.provider === "credentials") {
          return true
        }

        // Handle OAuth sign-in
        try {
          if (!user.email) {
            return false
          }

          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // Create new user for OAuth sign-in
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                avatar: user.image,
                role: "STUDENT", // Default role for OAuth users
                password: null // OAuth users don't have passwords
              }
            })
          } else {
            // Update existing user's avatar if provided
            if (user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { avatar: user.image }
              })
            }
          }

          return true
        } catch (error) {
          console.error("OAuth sign-in error:", error)
          return false
        }
      },

      async jwt({ token, user, account }: any) {
        if (user) {
          // Get user data from database
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              avatar: true
            }
          })

          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            token.avatar = dbUser.avatar
          }
        }
        return token
      },

      async session({ session, token }: any) {
        if (token) {
          session.user.id = token.userId as string
          session.user.role = token.role as string
          session.user.image = token.avatar as string
        }
        return session
      },

      async redirect({ url, baseUrl }: any) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url
        return baseUrl
      }
    },

    pages: {
      signIn: '/auth/login',
      signUp: '/auth/signup'
    },

    session: {
      strategy: "jwt" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
  }
}