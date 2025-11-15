"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Use back camera on mobile
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (err) {
      setError("Unable to access camera. Please grant camera permissions.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Simple barcode detection (this is a basic implementation)
    // In production, you'd use a library like @zxing/library or quagga2
    const barcode = await simulateBarcodeDetection(imageData)
    
    if (barcode) {
      onScan(barcode)
      stopCamera()
      onClose()
    }
  }

  // Simulate barcode detection - in production use a real barcode library
  const simulateBarcodeDetection = async (imageData: ImageData): Promise<string | null> => {
    // This is a placeholder - integrate with a real barcode scanning library
    // For now, we'll just prompt the user to enter manually
    return null
  }

  const handleManualEntry = () => {
    const barcode = prompt("Enter barcode manually:")
    if (barcode) {
      onScan(barcode)
      stopCamera()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <h2 className="text-white font-semibold">Scan Barcode</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            stopCamera()
            onClose()
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-4">
            <p className="mb-4">{error}</p>
            <Button onClick={handleManualEntry} variant="outline" className="bg-white text-black">
              Enter Manually
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-full max-h-full"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-primary rounded-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-black/80 space-y-2">
        <p className="text-white text-center text-sm mb-3">
          Position the barcode within the frame
        </p>
        <div className="flex gap-2">
          <Button
            onClick={captureAndDecode}
            disabled={!isScanning}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Capture & Scan
          </Button>
          <Button
            onClick={handleManualEntry}
            variant="outline"
            className="flex-1 bg-white text-black"
          >
            Enter Manually
          </Button>
        </div>
      </div>
    </div>
  )
}
