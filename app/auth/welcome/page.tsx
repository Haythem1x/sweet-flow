import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"

export default async function WelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-card rounded-lg p-8 shadow-lg border-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to SweetFlow!</h1>
          <p className="text-muted-foreground mb-6">
            Your account is now active. Let&apos;s set up your business to get started.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
