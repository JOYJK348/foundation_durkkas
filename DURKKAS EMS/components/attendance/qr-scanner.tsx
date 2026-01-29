"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ isOpen, onClose, onScanSuccess, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setPermissionGranted(true);
        setScanning(true);
      }
    } catch (err: any) {
      const errorMsg = err.name === "NotAllowedError" 
        ? "Camera permission denied. Please allow camera access."
        : err.name === "NotFoundError"
        ? "No camera found on your device."
        : "Failed to access camera. Please try again.";
      
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setPermissionGranted(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setPermissionGranted(false);
  };

  // Simulate QR code scanning (in production, use a library like html5-qrcode)
  const handleManualScan = () => {
    // This is a demo - in production, use html5-qrcode or similar library
    // For now, we'll simulate a successful scan
    const mockQRData = `ATTENDANCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onScanSuccess(mockQRData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
              <p className="text-sm text-gray-600 mt-1">Point your camera at the QR code</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Camera View */}
          <div className="relative bg-black aspect-square flex items-center justify-center">
            {error ? (
              <div className="text-center p-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-white mb-4">{error}</p>
                <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </div>
            ) : permissionGranted && videoRef.current ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-blue-500 rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                  </div>
                </div>
                {scanning && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium"
                    >
                      Scanning...
                    </motion.div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-8">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-4">Initializing camera...</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-6 bg-gray-50">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Ensure good lighting and hold your device steady</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Position the QR code within the frame</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Wait for automatic detection</p>
              </div>
            </div>

            {/* Manual Entry (for testing) */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleManualScan}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Simulate Scan (Demo)
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

