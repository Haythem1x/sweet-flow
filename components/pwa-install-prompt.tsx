"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from 'lucide-react'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(true) // Always show for testing
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('[v0] Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('[v0] Service Worker registration failed:', error)
        })
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If not installable via prompt, show instructions
      alert(
        'To install SweetFlow:\n\n' +
        'Android Chrome: Tap menu (⋮) → "Install app" or "Add to Home screen"\n' +
        'iOS Safari: Tap share (↑) → "Add to Home Screen"'
      )
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('[v0] User choice:', outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-amber-900 text-white rounded-lg shadow-2xl p-4 border border-amber-700">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-800 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Install SweetFlow</h3>
            <p className="text-xs text-amber-100 mb-3">
              {isInstallable 
                ? "Install our app for a better experience with offline access and quick launch."
                : "Add SweetFlow to your home screen for quick access and offline functionality."}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-amber-700 hover:bg-amber-600 text-white"
              >
                {isInstallable ? "Install" : "How to Install"}
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-amber-100 hover:bg-amber-800"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-amber-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
