export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-card rounded-lg p-8 shadow-lg border-2">
          <div className="flex justify-center mb-4">
            <div className="bg-accent text-accent-foreground rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a confirmation link to your email. Please check your inbox and click the link to verify your
            account.
          </p>
          <p className="text-sm text-muted-foreground">Once confirmed, you can log in to SweetFlow.</p>
        </div>
      </div>
    </div>
  )
}
