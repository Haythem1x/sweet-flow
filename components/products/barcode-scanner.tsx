"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/library'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

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
        
        readerRef.current = new BrowserMultiFormatReader()
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
    if (readerRef.current) {
      readerRef.current.reset()
    }
  }

  const captureAndDecode = async () => {
    if (!videoRef.current || !readerRef.current) return

    try {
      const result = await readerRef.current.decodeFromVideoElement(videoRef.current)
      
      if (result) {
        const barcode = result.getText()
        onScan(barcode)
        stopCamera()
        onClose()
      }
    } catch (err) {
      // If no barcode detected, show error or let user try again
      console.log("No barcode detected, try again")
      setError("No barcode detected. Please try again or enter manually.")
      setTimeout(() => setError(null), 2000)
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
