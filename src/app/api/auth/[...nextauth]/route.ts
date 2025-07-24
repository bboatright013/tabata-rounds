import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // …any other providers…
  ],
  secret: process.env.NEXTAUTH_SECRET,
}

// single handler instance
const handler = NextAuth(authOptions)

// re-export for the App Router
export { handler as GET, handler as POST }
