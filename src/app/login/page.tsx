"use client"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={() => signIn("github", {
            callbackUrl: "/admin"
            })
        }
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Sign in with GitHub
      </button>
    </div>
  )
}
