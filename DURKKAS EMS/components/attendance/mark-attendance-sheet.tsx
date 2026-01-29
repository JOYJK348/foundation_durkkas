"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Camera, CheckCircle2, AlertCircle, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRScanner } from "./qr-scanner";
import { Card, CardContent } from "@/components/ui/card";

interface MarkAttendanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AttendanceData) => void;
}

interface AttendanceData {
  qrCode: string;
  location: { lat: number; lng: number; address?: string };
  timestamp: Date;
  photo?: string;
  deviceInfo: string;
  ipAddress?: string;
}

interface VerificationStatus {
  qrCode: boolean;
  location: boolean;
  time: boolean;
  photo: boolean;
  device: boolean;
}

export function MarkAttendanceSheet({ isOpen, onClose, onSuccess }: MarkAttendanceSheetProps) {
  const [step, setStep] = useState<"qr" | "location" | "photo" | "confirm">("qr");
  const [qrData, setQrData] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationStatus>({
    qrCode: false,
    location: false,
    time: false,
    photo: false,
    device: true, // Device info is always available
  });
  const [timeValid, setTimeValid] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Expected location (institution coordinates - should be from backend)
  const EXPECTED_LOCATION = {
    lat: 12.9716, // Example: Bangalore coordinates
    lng: 77.5946,
    radius: 100, // 100 meters radius
  };

  // Allowed time window (9:00 AM - 10:00 AM)
  const ALLOWED_TIME_START = 9; // 9 AM
  const ALLOWED_TIME_END = 10; // 10 AM

  useEffect(() => {
    if (isOpen) {
      checkTimeValidity();
      getLocation();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep("qr");
    setQrData(null);
    setLocation(null);
    setPhoto(null);
    setLocationError(null);
    setTimeError(null);
    setVerification({
      qrCode: false,
      location: false,
      time: false,
      photo: false,
      device: true,
    });
  };

  const checkTimeValidity = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    if (currentTime >= ALLOWED_TIME_START && currentTime <= ALLOWED_TIME_END) {
      setTimeValid(true);
      setVerification((prev) => ({ ...prev, time: true }));
      setTimeError(null);
    } else {
      setTimeValid(false);
      setVerification((prev) => ({ ...prev, time: false }));
      setTimeError(
        `Attendance can only be marked between ${ALLOWED_TIME_START}:00 AM and ${ALLOWED_TIME_END}:00 AM`
      );
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Calculate distance from expected location
        const distance = calculateDistance(
          latitude,
          longitude,
          EXPECTED_LOCATION.lat,
          EXPECTED_LOCATION.lng
        );

        if (distance <= EXPECTED_LOCATION.radius) {
          // Get address from coordinates (using reverse geocoding)
          let address = "Location verified";
          try {
            // In production, use a geocoding API
            address = await reverseGeocode(latitude, longitude);
          } catch (err) {
            console.error("Geocoding failed:", err);
          }

          setLocation({ lat: latitude, lng: longitude, address });
          setVerification((prev) => ({ ...prev, location: true }));
          setLocationError(null);
        } else {
          setLocationError(
            `You are ${Math.round(distance)}m away from the institution. Please be within ${EXPECTED_LOCATION.radius}m to mark attendance.`
          );
          setVerification((prev) => ({ ...prev, location: false }));
        }
        setLoading(false);
      },
      (error) => {
        setLocationError("Failed to get your location. Please enable location services.");
        setVerification((prev) => ({ ...prev, location: false }));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // In production, use a proper geocoding service like Google Maps API
    // For demo, return a mock address
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  const capturePhoto = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not available");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0);
          const photoData = canvas.toDataURL("image/jpeg", 0.8);
          setPhoto(photoData);
          setVerification((prev) => ({ ...prev, photo: true }));
          stream.getTracks().forEach((track) => track.stop());
        };
      })
      .catch((err) => {
        alert("Failed to access camera: " + err.message);
      });
  };

  const handleQRScanSuccess = (data: string) => {
    // Validate QR code format
    if (data.startsWith("ATTENDANCE_")) {
      setQrData(data);
      setVerification((prev) => ({ ...prev, qrCode: true }));
      setStep("location");
    } else {
      alert("Invalid QR code. Please scan the correct attendance QR code.");
    }
  };

  const handleSubmit = async () => {
    if (!qrData || !location || !timeValid) {
      alert("Please complete all verification steps");
      return;
    }

    setLoading(true);

    // Get device info
    const deviceInfo = `${navigator.userAgent} - ${navigator.platform}`;
    
    // Get IP address (in production, get from backend)
    let ipAddress = "unknown";
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ipAddress = data.ip;
    } catch (err) {
      console.error("Failed to get IP:", err);
    }

    const attendanceData: AttendanceData = {
      qrCode: qrData,
      location,
      timestamp: new Date(),
      photo: photo || undefined,
      deviceInfo,
      ipAddress,
    };

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onSuccess(attendanceData);
      resetForm();
      onClose();
    }, 1500);
  };

  const allVerified = Object.values(verification).every((v) => v === true) && timeValid;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Mark Attendance</h3>
              <p className="text-sm text-gray-600 mt-1">Complete verification steps</p>
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

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[
                { key: "qr", label: "QR Code", icon: CheckCircle2 },
                { key: "location", label: "Location", icon: MapPin },
                { key: "photo", label: "Photo", icon: Camera },
                { key: "confirm", label: "Confirm", icon: Shield },
              ].map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.key;
                const isCompleted = 
                  (stepItem.key === "qr" && verification.qrCode) ||
                  (stepItem.key === "location" && verification.location) ||
                  (stepItem.key === "photo" && verification.photo) ||
                  (stepItem.key === "confirm" && allVerified);

                return (
                  <div key={stepItem.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-gray-200 border-gray-300 text-gray-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {stepItem.label}
                      </span>
                    </div>
                    {index < 3 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 -mt-5 ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {step === "qr" && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 1: Scan QR Code</h4>
                          <p className="text-sm text-gray-600">
                            Scan the QR code displayed in your classroom to verify your presence.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {!verification.qrCode ? (
                    <QRScanner
                      isOpen={true}
                      onClose={() => {}}
                      onScanSuccess={handleQRScanSuccess}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">QR Code Verified!</p>
                      <p className="text-sm text-gray-600">Code: {qrData?.substring(0, 30)}...</p>
                      <Button
                        onClick={() => setStep("location")}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        Continue to Location Verification
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {step === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 2: Location Verification</h4>
                          <p className="text-sm text-gray-600">
                            We need to verify that you are physically present at the institution.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Getting your location...</p>
                    </div>
                  ) : verification.location ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-green-900 mb-1">Location Verified</p>
                            <p className="text-sm text-green-700">{location?.address}</p>
                            <p className="text-xs text-green-600 mt-1">
                              Coordinates: {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time Verification */}
                      <Card className={timeValid ? "border-2 border-green-200 bg-green-50" : "border-2 border-red-200 bg-red-50"}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3">
                            {timeValid ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className={`font-semibold mb-1 ${timeValid ? "text-green-900" : "text-red-900"}`}>
                                Time Verification
                              </p>
                              <p className={`text-sm ${timeValid ? "text-green-700" : "text-red-700"}`}>
                                {timeValid
                                  ? `Current time: ${new Date().toLocaleTimeString()} - Within allowed window`
                                  : timeError}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        onClick={() => setStep("photo")}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!timeValid}
                      >
                        Continue to Photo Verification
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900 mb-1">Location Verification Failed</p>
                            <p className="text-sm text-red-700">{locationError}</p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={getLocation} variant="outline" className="w-full">
                        Retry Location
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {step === "photo" && (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 3: Photo Verification</h4>
                          <p className="text-sm text-gray-600">
                            Capture a selfie to verify your identity (optional but recommended).
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {photo ? (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-200">
                        <img src={photo} alt="Verification photo" className="w-full h-auto" />
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Verified
                        </div>
                      </div>
                      <Button
                        onClick={capturePhoto}
                        variant="outline"
                        className="w-full"
                      >
                        Retake Photo
                      </Button>
                      <Button
                        onClick={() => setStep("confirm")}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Continue to Confirmation
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Capture a selfie for verification</p>
                      <Button
                        onClick={capturePhoto}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button
                        onClick={() => setStep("confirm")}
                        variant="outline"
                        className="w-full mt-3"
                      >
                        Skip (Optional)
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 4: Confirm Attendance</h4>
                          <p className="text-sm text-gray-600">
                            Review your attendance details and confirm submission.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">QR Code</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {verification.qrCode ? "✓ Verified" : "✗ Not verified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {verification.location ? "✓ Verified" : "✗ Not verified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Time Window</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {timeValid ? "✓ Valid" : "✗ Invalid"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Photo</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {verification.photo ? "✓ Captured" : "○ Skipped"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Timestamp</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!allVerified && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                          Please complete all required verification steps before submitting.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!allVerified || loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Confirm & Submit Attendance"
                      )}
                    </Button>
                    <Button onClick={onClose} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

