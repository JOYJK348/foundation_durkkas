"use client";

import { useState, useEffect } from "react";
import { GSTFinanceLab } from "@/components/ems/practice/GSTFinanceLab";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Zap } from "lucide-react";
import api from "@/lib/api";

export default function GSTLabPage() {
    const [allocationId, setAllocationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllocation();
    }, []);

    const fetchAllocation = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ems/practice/student/status');
            if (response.data.success) {
                const allocations = response.data.data || [];
                // Find GST_LAB allocation
                const gstLabAllocation = allocations.find(
                    (a: any) => a.module_type === 'GST_LAB'
                );
                if (gstLabAllocation) {
                    setAllocationId(gstLabAllocation.id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch allocation:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <TopNavbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <Zap className="h-12 w-12 text-green-500 animate-pulse" />
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!allocationId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <TopNavbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            GST Finance Lab Not Allocated
                        </h2>
                        <p className="text-gray-600">
                            Please contact your instructor to get access to this module.
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
            <TopNavbar />
            <div className="container mx-auto px-4 py-8 pb-24">
                <GSTFinanceLab allocationId={allocationId} />
            </div>
            <BottomNav />
        </div>
    );
}
