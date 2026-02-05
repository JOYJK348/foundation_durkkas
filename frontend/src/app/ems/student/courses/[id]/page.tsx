"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronRight,
    FileText,
    PlayCircle,
    Loader2,
    Lock,
    CheckCircle,
    Calendar,
    Users,
    MapPin,
    Camera,
    RefreshCw,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

interface Material {
    id: number;
    material_name: string;
    material_type: string;
    file_url: string;
}

interface Lesson {
    id: number;
    lesson_name: string;
    lesson_number: string;
    is_locked: boolean;
    course_materials: Material[];
}

interface Module {
    id: number;
    module_name: string;
    module_number: number;
    lessons: Lesson[];
}

interface CourseDetails {
    id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    course_modules: Module[];
    active_session?: {
        id: number;
        status: string;
        opening_window_start: string;
        opening_window_end: string;
        closing_window_start: string;
        closing_window_end: string;
    } | null;
}

export default function StudentCourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'curriculum' | 'attendance'>('curriculum');
    const [attendance, setAttendance] = useState<any[]>([]);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        fetchCourseDetails();
        fetchAttendance();
    }, [params.id]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ems/courses/${params.id}?include_active_session=true`);
            if (response.data.success) {
                setCourse(response.data.data);
                if (response.data.data.course_modules?.length > 0) {
                    setExpandedModules([response.data.data.course_modules[0].id]);
                }
            }
        } catch (error: any) {
            console.error("Error fetching course details:", error);
            if (error.response?.status === 403) {
                toast.error("Not enrolled or content locked");
            } else {
                toast.error("Failed to load course materials");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const response = await api.get(`/ems/attendance?mode=student-history&course_id=${params.id}`);
            if (response.data.success) {
                setAttendance(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    const toggleModule = (id: number) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const startCapture = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsCaptureModalOpen(true);
        } catch (err) {
            toast.error("Camera access denied");
        }
    };

    const stopCapture = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCaptureModalOpen(false);
    };

    const handleCheckIn = async () => {
        if (!course?.active_session) return;

        try {
            setVerifying(true);
            toast.loading("Verifying your location & biometrics...");

            // 1. Get Location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            // 2. Capture Frame from Video
            const video = document.getElementById('capture-video') as HTMLVideoElement;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const faceImageUrl = canvas.toDataURL('image/jpeg');

            // 3. Submit
            const response = await api.post("/ems/attendance?mode=student-mark", {
                session_id: course.active_session.id,
                verification_type: "OPENING", // Or check window logic
                face_image_url: faceImageUrl,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                location_accuracy: position.coords.accuracy,
                device_info: {
                    platform: navigator.platform,
                    vendor: navigator.vendor
                }
            });

            toast.dismiss();
            if (response.data.success) {
                if (response.data.data.locationResult.is_valid) {
                    toast.success("Attendance marked successfully!");
                    fetchAttendance();
                    stopCapture();
                } else {
                    toast.error(`Out of range: ${Math.round(response.data.data.locationResult.distance_meters)}m away from campus`);
                }
            }
        } catch (err: any) {
            toast.dismiss();
            toast.error(err.message || "Failed to mark attendance");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <TopNavbar />
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-500 font-medium">Unlocking your learning material...</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!course) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Lock className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Access Restricted</h2>
            <p className="text-gray-500 text-center mt-2">This course is either not available or you are not enrolled.</p>
            <Button onClick={() => router.push('/ems/student/courses')} className="mt-6 bg-blue-600">Back to Courses</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 hover:bg-white text-gray-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.course_name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{course.course_code}</span>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Users className="h-4 w-4 text-orange-400" />
                                    <span>Morning Batch A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'curriculum' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Curriculum
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'attendance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Attendance
                    </button>
                </div>

                <div className="space-y-6">
                    {activeTab === 'curriculum' ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-800 ml-1">Learning Curriculum</h2>

                            {(!course.course_modules || course.course_modules.length === 0) ? (
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-12 text-center text-gray-500">
                                        <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No items have been published for this course yet.</p>
                                        <p className="text-xs mt-2">Check back later when your tutor releases the first section.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {course.course_modules.map((module) => (
                                        <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            {/* Module Header */}
                                            <div
                                                className={`p-5 flex items-center justify-between cursor-pointer group hover:bg-gray-50 transition-colors ${expandedModules.includes(module.id) ? 'border-b border-gray-50' : ''}`}
                                                onClick={() => toggleModule(module.id)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                        {module.module_number}
                                                    </div>
                                                    <h3 className="font-bold text-gray-800 text-lg">{module.module_name}</h3>
                                                </div>
                                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedModules.includes(module.id) ? 'rotate-180' : ''}`} />
                                            </div>

                                            {/* Lessons list */}
                                            <AnimatePresence>
                                                {expandedModules.includes(module.id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-2 space-y-2">
                                                            {module.lessons?.map((lesson) => (
                                                                <div key={lesson.id} className={`p-4 rounded-xl transition-all ${lesson.is_locked ? 'bg-gray-100/30 grayscale-[50%]' : 'bg-gray-50/50 hover:bg-gray-50'}`}>
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xs font-bold text-blue-400 w-8">{lesson.lesson_number}</span>
                                                                            <PlayCircle className={`h-5 w-5 ${lesson.is_locked ? 'text-gray-400' : 'text-blue-600'}`} />
                                                                            <span className={`font-semibold ${lesson.is_locked ? 'text-gray-400' : 'text-gray-800'}`}>{lesson.lesson_name}</span>
                                                                        </div>
                                                                        {lesson.is_locked ? <Lock className="h-4 w-4 text-gray-400" /> : <CheckCircle className="h-4 w-4 text-gray-300" />}
                                                                    </div>

                                                                    {!lesson.is_locked && (
                                                                        <div className="pl-8 space-y-2 border-l-2 border-gray-100 mt-2">
                                                                            {lesson.course_materials?.map(mat => (
                                                                                <div key={mat.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                                                        <span className="text-sm font-medium text-gray-700">{mat.material_name}</span>
                                                                                    </div>
                                                                                    <Button size="sm" variant="ghost" className="h-8 text-blue-600 font-bold text-[10px] uppercase tracking-tighter hover:bg-blue-50">
                                                                                        Download
                                                                                    </Button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* Attendance Controls */}
                            {course.active_session && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-[2rem] shadow-xl text-white">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/10">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                                                    Session Active Now
                                                </div>
                                                <h3 className="text-2xl font-bold">Class Attendance</h3>
                                                <p className="text-white/70 text-sm mt-1">Please verify your presence to mark attendance.</p>
                                            </div>
                                            <Calendar className="h-10 w-10 text-white/20" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                                    <Clock className="h-3 w-3" /> Start Window
                                                </div>
                                                <div className="text-lg font-bold">09:00 AM</div>
                                            </div>
                                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                                    <MapPin className="h-3 w-3" /> Location
                                                </div>
                                                <div className="text-lg font-bold">Campus Zone</div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={startCapture}
                                            className="w-full bg-white text-blue-700 hover:bg-gray-100 h-14 rounded-2xl font-bold text-lg shadow-lg"
                                        >
                                            <Camera className="h-5 w-5 mr-3" />
                                            Check-in Now
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Attendance History */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 ml-1">Attendance History</h3>
                                <div className="space-y-3">
                                    {attendance.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                            <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-400 font-medium">No attendance records yet</p>
                                        </div>
                                    ) : (
                                        attendance.map((record, idx) => (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.status === 'PRESENT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {record.status === 'PRESENT' ? <CheckCircle className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{new Date(record.session?.session_date).toLocaleDateString()}</p>
                                                        <p className="text-xs text-gray-500">{record.session?.session_type} Session</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${record.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {record.status}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Verified via GPS</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {isCaptureModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
                    >
                        <div className="w-full max-w-sm">
                            <h2 className="text-2xl font-bold text-white mb-2 text-center">Face Verification</h2>
                            <p className="text-white/60 text-sm text-center mb-8">Align your face in the center of the camera</p>

                            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-gray-900 border-4 border-white/20">
                                <video
                                    id="capture-video"
                                    autoPlay
                                    playsInline
                                    ref={el => { if (el && stream) el.srcObject = stream; }}
                                    className="w-full h-full object-cover"
                                />
                                {/* Face Overlay Guide */}
                                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                                    <div className="w-full h-full border-2 border-dashed border-white/50 rounded-full" />
                                </div>
                            </div>

                            <div className="mt-12 space-y-4">
                                <Button
                                    onClick={handleCheckIn}
                                    disabled={verifying}
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-bold text-lg"
                                >
                                    {verifying ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Camera className="h-5 w-5 mr-2" />}
                                    Capture & Verify
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={stopCapture}
                                    className="w-full text-white hover:bg-white/10 h-14 rounded-2xl font-medium"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
