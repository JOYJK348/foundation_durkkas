"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, MapPin, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface AttendanceVerificationProps {
    classId: number;
    type: 'IN' | 'OUT';
    onSuccess?: () => void;
    onClose?: () => void;
}

export const AttendanceVerification = ({ classId, type, onSuccess, onClose }: AttendanceVerificationProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
    const [step, setStep] = useState<'PERMISSION' | 'CAPTURE' | 'VERIFYING' | 'SUCCESS'>('PERMISSION');
    const [error, setError] = useState<string | null>(null);

    // 1. Get Location & Camera Permissions
    const startVerification = async () => {
        setError(null);
        try {
            // Get Location
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude });

            // Get Camera
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setStep('CAPTURE');
        } catch (err: any) {
            setError(err.message || "Failed to get camera/location permissions");
            toast.error("Permissions denied!");
        }
    };

    // 2. Capture Photo
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0);

            const imageData = canvasRef.current.toDataURL('image/jpeg');
            setCapturedImage(imageData);

            // Stop camera stream
            stream?.getTracks().forEach(track => track.stop());
            setStep('VERIFYING');
            submitAttendance(imageData);
        }
    };

    // 3. Submit to API
    const submitAttendance = async (base64Image: string) => {
        try {
            const res = await api.post("/ems/attendance/mark", {
                classId,
                type,
                lat: location?.lat,
                long: location?.long,
                faceUrl: base64Image, // In real world, upload to S3/Cloudinary first
                faceScore: 0.95 // Mocked for now, will integrate AI later
            });

            if (res.data.success) {
                setStep('SUCCESS');
                setTimeout(() => {
                    onSuccess?.();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
            setStep('CAPTURE');
            startVerification(); // restart
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden border-0 shadow-2xl rounded-3xl">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-90" />
                <h2 className="text-xl font-bold">Attendance Security</h2>
                <p className="text-white/70 text-sm">Face & Location Verification</p>
            </div>

            <CardContent className="p-8">
                <AnimatePresence mode="wait">
                    {step === 'PERMISSION' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                            <div className="p-4 bg-blue-50 rounded-2xl">
                                <p className="text-sm text-blue-700">We need to verify your location and face to mark attendance.</p>
                            </div>
                            <Button onClick={startVerification} className="w-full h-12 bg-purple-600 hover:bg-purple-700 rounded-xl">
                                Allow & Start Verification
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 'CAPTURE' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black ring-4 ring-purple-100">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none border-dashed m-4"></div>
                            </div>
                            <Button onClick={capturePhoto} className="w-full h-12 bg-purple-600 hover:bg-purple-700 rounded-xl">
                                <Camera className="h-4 w-4 mr-2" />
                                Capture Face
                            </Button>
                        </motion.div>
                    )}

                    {step === 'VERIFYING' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 space-y-4">
                            <RefreshCw className="h-12 w-12 text-purple-600 animate-spin mx-auto" />
                            <h3 className="text-lg font-medium">Verifying Session...</h3>
                            <p className="text-gray-500 text-sm italic">Dont close the browser</p>
                        </motion.div>
                    )}

                    {step === 'SUCCESS' && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-4">
                            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Attendance Marked!</h3>
                            <p className="text-green-600 font-medium">Verified for {type === 'IN' ? 'Check-In' : 'Check-Out'}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs shadow-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </CardContent>

            <canvas ref={canvasRef} className="hidden" />
        </Card>
    );
};

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);
