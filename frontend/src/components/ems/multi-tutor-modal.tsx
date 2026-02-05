/**
 * Multi-Tutor Assignment Modal
 * Allows selecting multiple tutors for a course
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Loader2, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Tutor {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    employeeCode: string;
}

interface AssignedTutor {
    id: number;
    tutorId: number;
    name: string;
    email: string;
    role: string;
    isPrimary: boolean;
}

interface MultiTutorModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    onSuccess: () => void;
}

export function MultiTutorModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    onSuccess
}: MultiTutorModalProps) {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [assignedTutors, setAssignedTutors] = useState<AssignedTutor[]>([]);
    const [selectedTutorIds, setSelectedTutorIds] = useState<number[]>([]);
    const [primaryTutorId, setPrimaryTutorId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTutors();
            fetchAssignedTutors();
        }
    }, [isOpen, courseId]);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/ems/tutors');
            if (response.data.success) {
                setTutors(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching tutors:', error);
            toast.error('Failed to load tutors');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedTutors = async () => {
        try {
            const response = await api.get(`/ems/courses/${courseId}/tutors`);
            if (response.data.success) {
                const assigned = response.data.data || [];
                setAssignedTutors(assigned);
                setSelectedTutorIds(assigned.map((t: AssignedTutor) => t.tutorId));
                const primary = assigned.find((t: AssignedTutor) => t.isPrimary);
                if (primary) setPrimaryTutorId(primary.tutorId);
            }
        } catch (error) {
            console.error('Error fetching assigned tutors:', error);
        }
    };

    const handleTutorToggle = (tutorId: number) => {
        setSelectedTutorIds(prev => {
            if (prev.includes(tutorId)) {
                // If removing and it was primary, clear primary
                if (primaryTutorId === tutorId) {
                    setPrimaryTutorId(null);
                }
                return prev.filter(id => id !== tutorId);
            } else {
                return [...prev, tutorId];
            }
        });
    };

    const handleSetPrimary = (tutorId: number) => {
        // Can only set primary if tutor is selected
        if (selectedTutorIds.includes(tutorId)) {
            setPrimaryTutorId(tutorId);
        }
    };

    const handleAssignTutors = async () => {
        if (selectedTutorIds.length === 0) {
            toast.error('Please select at least one tutor');
            return;
        }

        setAssigning(true);
        try {
            await api.post(`/ems/courses/${courseId}/tutors`, {
                tutorIds: selectedTutorIds,
                isPrimary: primaryTutorId !== null,
                role: 'INSTRUCTOR'
            });

            toast.success('Tutors assigned successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error assigning tutors:', error);
            toast.error(error.response?.data?.message || 'Failed to assign tutors');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveTutor = async (tutorId: number) => {
        try {
            await api.delete(`/ems/courses/${courseId}/tutors?tutorId=${tutorId}`);
            toast.success('Tutor removed successfully');
            fetchAssignedTutors();
            onSuccess();
        } catch (error: any) {
            console.error('Error removing tutor:', error);
            toast.error('Failed to remove tutor');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                Assign Tutors (Multiple)
                            </CardTitle>
                            <p className="text-purple-100 mt-1 font-medium">
                                {courseName}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-10 w-10 p-0 hover:bg-white/20 text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Currently Assigned */}
                    {assignedTutors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                                Currently Assigned ({assignedTutors.length})
                            </h3>
                            <div className="space-y-2">
                                {assignedTutors.map((tutor) => (
                                    <div
                                        key={tutor.id}
                                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                                {tutor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {tutor.name}
                                                    {tutor.isPrimary && (
                                                        <Badge className="bg-yellow-500 text-white">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-800 font-medium">{tutor.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500 text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveTutor(tutor.tutorId)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                            <span className="text-gray-600 font-medium">Loading tutors...</span>
                        </div>
                    ) : tutors.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="h-10 w-10 text-purple-600" />
                            </div>
                            <p className="text-gray-900 font-semibold text-lg mb-2">No tutors available</p>
                            <p className="text-gray-600">
                                Please add tutors first before assigning
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-1 flex-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded"></div>
                                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Select Tutors ({selectedTutorIds.length} selected)
                                </p>
                                <div className="h-1 flex-1 bg-gradient-to-l from-purple-600 to-purple-400 rounded"></div>
                            </div>

                            {tutors.map((tutor) => {
                                const isSelected = selectedTutorIds.includes(tutor.id);
                                const isPrimary = primaryTutorId === tutor.id;
                                const isAssigned = assignedTutors.some(t => t.tutorId === tutor.id);

                                return (
                                    <div
                                        key={tutor.id}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'border-purple-500 bg-white shadow-lg'
                                            : 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-md'
                                            }`}
                                        onClick={() => handleTutorToggle(tutor.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleTutorToggle(tutor.id)}
                                                    className="h-5 w-5"
                                                />
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isSelected
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-300 text-gray-800'
                                                    }`}>
                                                    {(() => {
                                                        const first = tutor.firstName?.charAt(0) || tutor.name?.charAt(0) || 'T';
                                                        const last = tutor.lastName?.charAt(0) || tutor.name?.charAt(1) || 'U';
                                                        return `${first}${last}`;
                                                    })()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                        {tutor.name}
                                                        {isAssigned && !isSelected && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Currently Assigned
                                                            </Badge>
                                                        )}
                                                    </p>
                                                    <div className="space-y-1 mt-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-800">
                                                            <span className="font-medium">📧</span>
                                                            <span className="font-medium">{tutor.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-800">
                                                            <span className="font-medium">🆔</span>
                                                            <span className="font-medium">Code: {tutor.employeeCode}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={isPrimary ? "default" : "outline"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetPrimary(tutor.id);
                                                        }}
                                                        className={isPrimary ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "border-gray-400 text-gray-900"}
                                                    >
                                                        <Star className={`h-4 w-4 mr-1 ${isPrimary ? 'fill-current' : ''}`} />
                                                        {isPrimary ? 'Primary' : 'Set Primary'}
                                                    </Button>
                                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                                                        <Check className="h-5 w-5 text-white font-bold" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                <div className="border-t bg-gray-50 p-5 flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={assigning}
                        className="border-2 font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignTutors}
                        disabled={selectedTutorIds.length === 0 || assigning}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold shadow-lg"
                    >
                        {assigning ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign {selectedTutorIds.length} Tutor{selectedTutorIds.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
