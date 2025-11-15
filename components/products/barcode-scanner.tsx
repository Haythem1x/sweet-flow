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
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        
        // Start continuous scanning
        startContinuousScanning()
      }
    } catch (err) {
      setError("Unable to access camera. Please grant camera permissions.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startContinuousScanning = () => {
    // @ts-ignore - Barcode Detection API might not be in types yet
    if ('BarcodeDetector' in window) {
      // @ts-ignore
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
      })

      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const barcode = barcodes[0].rawValue
              onScan(barcode)
              stopCamera()
              onClose()
            }
          } catch (err) {
            console.log("Barcode detection error:", err)
          }
        }
      }, 500) // Scan every 500ms
    }
  }

  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current) return

    // @ts-ignore
    if ('BarcodeDetector' in window) {
      try {
        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
        })
        
        const barcodes = await barcodeDetector.detect(videoRef.current)
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0].rawValue
          onScan(barcode)
          stopCamera()
          onClose()
        } else {
          setError("No barcode detected. Please try again or enter manually.")
          setTimeout(() => setError(null), 2000)
        }
      } catch (err) {
        console.error("Barcode detection error:", err)
        setError("Failed to detect barcode. Please enter manually.")
        setTimeout(() => setError(null), 2000)
      }
    } else {
      setError("Barcode scanning not supported on this device. Please enter manually.")
      setTimeout(() => setError(null), 3000)
    }
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
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg z-10 text-center">
            {error}
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="max-w-full max-h-full"
        />
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanning frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-40 border-2 border-primary rounded-lg relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
          </div>
        </div>
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
