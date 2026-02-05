"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, User, X, Loader2, Calendar, Clock, BookOpen, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import * as faceapi from "@vladmandic/face-api";

const FaceRegistration = dynamic(
    () => import("./FaceRegistration").then(mod => mod.FaceRegistration),
    { ssr: false }
);

interface AttendanceVerificationProps {
    sessions: any[]; // Array of all active sessions
    onSuccess: () => void;
    onClose: () => void;
}

export const AttendanceVerification = ({ sessions, onSuccess, onClose }: AttendanceVerificationProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [step, setStep] = useState<"SELECT_SESSION" | "SCANNING" | "VERIFYING" | "SUCCESS" | "ERROR" | "NEED_REGISTRATION">("SELECT_SESSION");
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    // Initial load: Prepare AI Models
    useEffect(() => {
        const load = async () => {
            try {
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
            } catch (err) { }
        };
        load();
    }, []);

    // Check enrollment status
    useEffect(() => {
        const checkEnrollment = async () => {
            try {
                const { data } = await api.get("/ems/face-profile/register");
                if (!data.data.is_enrolled) setStep("NEED_REGISTRATION");
            } catch (err) { }
        };
        checkEnrollment();
    }, []);

    const startVerification = async (session: any) => {
        setSelectedSession(session);
        setError(null);
        setStep("SCANNING");

        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => console.log("Location delayed"),
            { enableHighAccuracy: true, timeout: 10000 }
        );

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
        } catch (err: any) {
            setError("Camera access required.");
            setStep("ERROR");
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video && stream && step === "SCANNING") {
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play().catch(console.error);
        }
    }, [stream, step]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === "SCANNING" && stream && isModelsLoaded) {
            interval = setInterval(async () => {
                const video = videoRef.current;
                if (!video || video.readyState < 2 || video.paused) return;
                try {
                    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }));
                    setFaceDetected(!!detection);
                } catch (e) { }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [step, stream, isModelsLoaded]);

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    };

    const captureAndVerify = async () => {
        const video = videoRef.current;
        if (!video || !canvasRef.current || !faceDetected || isCapturing || !selectedSession) return;
        if (!location) {
            toast.error("Waiting for GPS...");
            return;
        }
        setIsCapturing(true);
        setStep("VERIFYING");
        try {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (!detection) throw new Error("Face not detected clearly. Try again.");
            const canvas = canvasRef.current;
            canvas.width = 480; canvas.height = 480;
            const ctx = canvas.getContext("2d");
            const size = Math.min(video.videoWidth, video.videoHeight);
            ctx?.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, 480, 480);
            const response = await api.post("/ems/attendance?mode=student-mark", {
                attendance_session_id: selectedSession.id,
                captured_image: canvas.toDataURL("image/jpeg", 0.6),
                face_descriptor: Array.from(detection.descriptor),
                location: { latitude: location.lat, longitude: location.lng }
            });
            if (response.data.success) {
                setStep("SUCCESS");
                setTimeout(onSuccess, 1500);
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            setError(err.message || "Verification failed");
            setStep("ERROR");
        } finally {
            setIsCapturing(false);
        }
    };

    useEffect(() => {
        return () => stopStream();
    }, [stream]);

    if (step === "NEED_REGISTRATION") {
        return <FaceRegistration onSuccess={() => setStep("SELECT_SESSION")} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={() => { stopStream(); onClose(); }} className="absolute top-6 right-6 z-10 p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition-colors font-black">
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Punch Attendance</h2>
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">Biometric Verification</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        {step === "SELECT_SESSION" && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 leading-none">Select Active Course</h3>
                                    <p className="text-gray-500 text-xs font-semibold">Multiple classes are in progress. Select one to mark attendance.</p>
                                </div>
                                <div className="space-y-4">
                                    {sessions.map((session, idx) => (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => startVerification(session)}
                                            className="group relative p-5 bg-blue-50/50 hover:bg-blue-600 rounded-[2rem] border border-blue-100 hover:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-blue-500/20 active:scale-95"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-3">
                                                    <div className="w-10 h-10 bg-white group-hover:bg-blue-400 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                                                        <BookOpen className="h-5 w-5 text-blue-600 group-hover:text-white" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-gray-900 group-hover:text-white leading-tight transition-colors">{session.course?.course_name}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/50 group-hover:bg-blue-500 rounded-full text-[9px] font-black text-blue-600 group-hover:text-white transition-colors border border-blue-100 group-hover:border-blue-400 uppercase tracking-tighter">
                                                                <Calendar className="h-2.5 w-2.5" /> {session.batch?.batch_name || "Regular"}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 group-hover:bg-green-500 rounded-full text-[9px] font-black text-green-700 group-hover:text-white transition-colors border border-green-200 group-hover:border-green-400 uppercase tracking-tighter">
                                                                <Clock className="h-2.5 w-2.5" /> {session.verification_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/50 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                                                    <ChevronRight className="h-5 w-5 text-blue-600 group-hover:text-white" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4 italic">Confirm session details before biometric scan</p>
                            </div>
                        )}

                        {step === "SCANNING" && (
                            <div className="space-y-6">
                                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gray-950 border-4 border-gray-50 shadow-2xl">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[2px] bg-blue-400/50 blur-[1px] animate-[scan_2s_ease-in-out_infinite]" />
                                    <style jsx>{` @keyframes scan { 0%, 100% { top: 20%; opacity: 0; } 50% { top: 80%; opacity: 1; } } `}</style>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className={`w-64 h-64 border-2 rounded-full transition-all duration-500 ${faceDetected ? 'border-green-400 scale-105' : 'border-white/20 border-dashed'}`} />
                                    </div>
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                                        <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md border ${faceDetected ? 'bg-green-500 text-white border-green-400' : 'bg-black/40 text-white border-white/20'}`}>
                                            {selectedSession?.course?.course_name.substring(0, 15)}...
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-white text-[10px] font-bold border ${location ? 'border-green-400/30' : 'border-white/10'}`}>
                                            <MapPin className={`h-3 w-3 ${location ? 'text-green-400' : 'text-gray-400 animate-pulse'}`} />
                                            {location ? "GPS VALID" : "GPS SEARCHING..."}
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={captureAndVerify} disabled={!faceDetected || isCapturing} className="w-full h-15 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3">
                                    <ShieldCheck className={`h-5 w-5 ${faceDetected ? 'animate-bounce' : ''}`} />
                                    Verify & Mark Attendance
                                </Button>
                                <Button variant="ghost" onClick={() => { stopStream(); setStep("SELECT_SESSION"); }} className="w-full text-gray-500 font-bold text-xs uppercase">Choose another course</Button>
                            </div>
                        )}

                        {step === "VERIFYING" && (
                            <div className="text-center py-12 space-y-6">
                                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
                                <h3 className="text-xl font-black text-gray-900">Confirming Biometrics...</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Marking presence for {selectedSession?.course?.course_name}</p>
                            </div>
                        )}

                        {step === "SUCCESS" && (
                            <div className="text-center py-12 space-y-6">
                                <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
                                <h3 className="text-2xl font-black text-gray-900 uppercase">Verified!</h3>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-sm font-medium italic">Attendance marked for:</p>
                                    <p className="text-blue-600 font-black tracking-tight">{selectedSession?.course?.course_name}</p>
                                </div>
                            </div>
                        )}

                        {step === "ERROR" && (
                            <div className="text-center py-8 space-y-6">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                                <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>
                                <Button onClick={() => setStep("SELECT_SESSION")} className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold uppercase">Back to List</Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
