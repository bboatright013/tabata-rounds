import { withAuth } from "next-auth/middleware"

export default withAuth({
  // Redirect to this page if you’re not signed in
  pages: {
    signIn: "/login",
  },
})

export const config = {
  // Apply this middleware to everything under /admin
  matcher: ["/admin/:path*"],
}
