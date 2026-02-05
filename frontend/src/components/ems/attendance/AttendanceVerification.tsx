"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, MapPin, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, User, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface AttendanceVerificationProps {
    sessionId: number;
    verificationType: "OPENING" | "CLOSING";
    courseName?: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

export const AttendanceVerification = ({
    sessionId,
    verificationType,
    courseName,
    onSuccess,
    onClose,
}: AttendanceVerificationProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [location, setLocation] = useState<{ lat: number; long: number; accuracy: number } | null>(null);
    const [step, setStep] = useState<"PERMISSION" | "CAPTURE" | "VERIFYING" | "SUCCESS" | "ERROR">("PERMISSION");
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    // Link stream to video element when stream or videoRef changes
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => {
                console.error("Error playing video:", err);
            });
        }
    }, [stream]);

    // Clean up stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    const startVerification = async () => {
        setError(null);
        try {
            // 1. Get Location
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                });
            });
            setLocation({
                lat: pos.coords.latitude,
                long: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
            });

            // 2. Get Camera - Use simpler constraints for better compatibility
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { min: 320, ideal: 640 },
                    height: { min: 240, ideal: 640 }
                },
            });
            setStream(mediaStream);
            setStep("CAPTURE");
        } catch (err: any) {
            console.error("Verification Error:", err);
            let msg = "Failed to access camera/location.";
            if (err.name === 'NotAllowedError' || err.code === 1) msg = "Camera or Location access denied. Please enable both in browser settings.";
            if (err.name === 'NotFoundError') msg = "No camera found on this device.";
            setError(msg);
            setStep("ERROR");
            toast.error(msg);
        }
    };

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current || !location) return;

        setVerifying(true);
        setStep("VERIFYING");

        try {
            const context = canvasRef.current.getContext("2d");
            canvasRef.current.width = 480;
            canvasRef.current.height = 480;

            // Draw centered square from video
            const video = videoRef.current;
            const size = Math.min(video.videoWidth, video.videoHeight);
            const startX = (video.videoWidth - size) / 2;
            const startY = (video.videoHeight - size) / 2;

            context?.drawImage(video, startX, startY, size, size, 0, 0, 480, 480);

            const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8);

            // Stop camera stream
            stream?.getTracks().forEach((track) => track.stop());
            setStream(null);

            // Submit to API
            const response = await api.post("/ems/attendance?mode=student-mark", {
                session_id: sessionId,
                verification_type: verificationType,
                face_image_url: imageData,
                latitude: location.lat,
                longitude: location.long,
                location_accuracy: location.accuracy,
                device_info: {
                    platform: navigator.platform,
                    userAgent: navigator.userAgent,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                },
            });

            if (response.data.success) {
                setStep("SUCCESS");
                toast.success("Attendance verified successfully!");
                setTimeout(() => {
                    onSuccess?.();
                }, 2000);
            } else {
                throw new Error(response.data.message || "Verification failed");
            }
        } catch (err: any) {
            console.error("Submission Error:", err);
            const msg = err.response?.data?.message || err.message || "Attendance verification failed";
            setError(msg);
            setStep("ERROR");
            toast.error(msg);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Smart Attendance</h2>
                            <p className="text-blue-100 text-sm opacity-80">{verificationType === 'OPENING' ? 'Session Check-in' : 'Session Check-out'}</p>
                        </div>
                    </div>
                    {courseName && (
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium inline-block border border-white/10">
                            {courseName}
                        </div>
                    )}
                </div>

                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        {step === "PERMISSION" && (
                            <motion.div
                                key="permission"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                                    <MapPin className="h-10 w-10" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Permissions Required</h3>
                                    <p className="text-gray-500 text-sm mt-2 px-4">
                                        We need access to your camera and GPS location to verify your presence at the institution.
                                    </p>
                                </div>
                                <Button
                                    onClick={startVerification}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100"
                                >
                                    Start Verification
                                </Button>
                            </motion.div>
                        )}

                        {step === "CAPTURE" && (
                            <motion.div
                                key="capture"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-900 border-4 border-gray-100 shadow-inner group">
                                    {!stream && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="h-10 w-10 text-white/20 animate-spin" />
                                        </div>
                                    )}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        webkit-playsinline="true"
                                        muted
                                        onLoadedMetadata={() => videoRef.current?.play()}
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${stream ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                    {/* Face Guide Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-64 h-64 border-2 border-dashed border-white/20 rounded-full" />
                                    </div>

                                    {/* Safety Refresh Button */}
                                    {stream && (
                                        <button
                                            onClick={startVerification}
                                            className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                                            title="Restart Camera"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Button
                                    onClick={captureAndVerify}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                                >
                                    <Camera className="h-6 w-6" />
                                    Capture & Mark Attendance
                                </Button>
                            </motion.div>
                        )}

                        {step === "VERIFYING" && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-12 space-y-6"
                            >
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                                    <RefreshCw className="h-24 w-24 text-blue-600 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Verifying Presence</h3>
                                    <p className="text-gray-500 text-sm mt-2">Connecting to secure verification server...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === "SUCCESS" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 space-y-6"
                            >
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                                    <CheckCircle2 className="h-12 w-12" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Completed!</h3>
                                    <p className="text-green-600 font-semibold mt-1">Verification Successful</p>
                                </div>
                                <p className="text-gray-500 text-sm">You can now close this window and continue your class.</p>
                            </motion.div>
                        )}

                        {step === "ERROR" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 space-y-6"
                            >
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                                    <AlertCircle className="h-10 w-10" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Verification Failed</h3>
                                    <p className="text-red-500 text-sm mt-2 bg-red-50 p-4 rounded-xl border border-red-100">
                                        {error || "An unexpected error occurred during verification."}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => {
                                            setError(null);
                                            setStep("PERMISSION");
                                        }}
                                        className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold"
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="w-full h-12 text-gray-500 font-medium"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </motion.div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

