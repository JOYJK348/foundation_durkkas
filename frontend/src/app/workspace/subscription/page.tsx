"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Crown,
    Check,
    Zap,
    Users,
    Building2,
    Layers,
    Briefcase,
    ArrowLeft,
    Sparkles,
    Shield,
    Clock,
    BarChart3,
    Star,
    ChevronRight,
    Phone,
    Mail,
    MessageCircle,
    Calculator,
    Minus,
    Plus,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Loader2,
    Settings
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { platformService } from "@/services/platformService";
import { Rocket } from "lucide-react";

interface PlanFeature {
    text: string;
    included: boolean;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    display_name: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    plan_type: string;
    max_users: number;
    max_branches: number;
    max_departments: number;
    max_designations: number;
    enabled_modules: string[];
    features: string[];
    support_level: string;
    badge?: string;
    is_current?: boolean;
}

// Hardcoded PLANS removed - now dynamic from DB
const PLANS: SubscriptionPlan[] = [];

const MODULE_PRICING: Record<string, { name: string; price: number }> = {
    'HR': { name: 'Human Resources', price: 0 }, // Included in base
    'ATTENDANCE': { name: 'Attendance', price: 0 }, // Included in base
    'PAYROLL': { name: 'Payroll', price: 1500 },
    'CRM': { name: 'CRM & Sales', price: 2000 },
    'LMS': { name: 'Learning (LMS)', price: 2500 },
    'FINANCE': { name: 'Finance & Accounting', price: 3000 },
};

export default function SubscriptionPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [usage, setUsage] = useState<any>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('TRIAL');
    const [showCustomBuilder, setShowCustomBuilder] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Subscription Templates
                const templates = await platformService.getSubscriptionTemplates();
                const mappedPlans = templates
                    .filter((t: any) => t.is_active && t.is_published)
                    .map((t: any) => {
                        let icon = Star;
                        const code = t.code?.toUpperCase() || "";
                        const base = t.base_plan?.toUpperCase() || "";

                        if (code.includes('TRIAL') || base === 'TRIAL') icon = Zap;
                        else if (code.includes('BASIC') || base === 'BASIC') icon = Star;
                        else if (code.includes('STANDARD') || base === 'STANDARD') icon = Crown;
                        else if (code.includes('ENTERPRISE') || base === 'ENTERPRISE') icon = Rocket;

                        return {
                            id: t.id,
                            name: t.base_plan || t.code,
                            display_name: t.display_name,
                            description: t.description,
                            monthly_price: t.monthly_price,
                            yearly_price: t.yearly_price,
                            max_users: t.max_users,
                            max_branches: t.max_branches,
                            features: t.features || [],
                            support_level: t.support_level,
                            badge: code.includes('STANDARD') ? 'POPULAR' : code.includes('ENTERPRISE') ? 'BEST VALUE' : undefined
                        };
                    });

                mappedPlans.sort((a: any, b: any) => a.monthly_price - b.monthly_price);
                setPlans(mappedPlans);

                // Fetch Usage & Current Plan
                const usageData = await platformService.getCompanyUsage();
                setUsage(usageData);
                if (usageData?.subscription_plan) {
                    setCurrentPlan(usageData.subscription_plan);
                }
            } catch (error) {
                console.error("Failed to fetch subscription data", error);
                toast.error("Failed to load subscription details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Custom Plan Builder State
    const [customUsers, setCustomUsers] = useState(50);
    const [customBranches, setCustomBranches] = useState(5);
    const [customModules, setCustomModules] = useState<string[]>(['HR', 'ATTENDANCE']);

    const calculateCustomPrice = () => {
        const basePrice = 3999;
        const userPrice = Math.max(0, customUsers - 25) * 50; // ₹50 per additional user above 25
        const branchPrice = Math.max(0, customBranches - 3) * 500; // ₹500 per additional branch above 3
        const modulePrice = customModules.reduce((sum, mod) => sum + (MODULE_PRICING[mod]?.price || 0), 0);

        return basePrice + userPrice + branchPrice + modulePrice;
    };

    const handleUpgrade = async (plan: SubscriptionPlan) => {
        setLoading(true);
        try {
            // TODO: Integrate with payment gateway
            toast.success(`Upgrade to ${plan.display_name} initiated!`);
        } catch (error) {
            toast.error('Failed to process upgrade');
        } finally {
            setLoading(false);
        }
    };

    const getPrice = (plan: SubscriptionPlan) => {
        if (billingCycle === 'yearly') {
            return plan.yearly_price;
        }
        return plan.monthly_price;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto pb-12 px-4 md:px-6">
                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <Link href="/workspace/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Settings
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Subscription Plans</h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">Choose the perfect plan for your organization</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Yearly
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Save 17%</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current Plan Banner */}
                <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-violet-200 text-sm font-medium">Current Plan</p>
                            <h3 className="text-xl font-bold">{currentPlan}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-violet-200 text-sm">Active Users</p>
                            <p className="font-bold">
                                {usage?.active_users || 0} / {(usage?.max_users === 0 || usage?.max_employees === 0) ? '∞' : (usage?.max_users || usage?.max_employees || 0)}
                            </p>
                        </div>
                        <div className="w-px h-10 bg-white/20 hidden md:block"></div>
                        <div className="text-right hidden md:block">
                            <p className="text-violet-200 text-sm">Branches</p>
                            <p className="font-bold">
                                {usage?.active_branches || 0} / {usage?.max_branches === 0 ? '∞' : (usage?.max_branches || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-96 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse" />
                        ))
                    ) : (
                        plans.map((plan) => {
                            const isCurrent = plan.name === currentPlan;
                            const isPopular = plan.badge === 'POPULAR';

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white rounded-2xl border-2 transition-all hover:shadow-xl ${isPopular
                                        ? 'border-violet-500 shadow-lg shadow-violet-100'
                                        : isCurrent
                                            ? 'border-emerald-500'
                                            : 'border-slate-200 hover:border-violet-200'
                                        }`}
                                >
                                    {/* Badge */}
                                    {plan.badge && (
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${plan.badge === 'POPULAR'
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-amber-500 text-white'
                                            }`}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                                            CURRENT
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Plan Header */}
                                        <div className="text-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.display_name}</h3>
                                            <p className="text-xs text-slate-500">{plan.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="text-center mb-6">
                                            {plan.monthly_price === 0 ? (
                                                <div>
                                                    <span className="text-4xl font-black text-slate-900">Free</span>
                                                    <p className="text-sm text-slate-500 mt-1">30 days trial</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="text-4xl font-black text-slate-900">{formatPrice(getPrice(plan))}</span>
                                                    <span className="text-slate-500 text-sm">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Limits */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                                                <p className="text-sm font-bold text-slate-900">
                                                    {plan.max_users === 0 ? '∞' : plan.max_users}
                                                </p>
                                                <p className="text-[10px] text-slate-500">Users</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <Building2 className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                                                <p className="text-sm font-bold text-slate-900">
                                                    {plan.max_branches === 0 ? '∞' : plan.max_branches}
                                                </p>
                                                <p className="text-[10px] text-slate-500">Branches</p>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2 mb-6">
                                            {(plan.features || []).slice(0, 5).map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-xs text-slate-600">{feature}</span>
                                                </div>
                                            ))}
                                            {(plan.features || []).length > 5 && (
                                                <p className="text-xs text-violet-600 font-medium pl-6">+{(plan.features || []).length - 5} more features</p>
                                            )}
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={isCurrent || loading}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isCurrent
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : isPopular
                                                    ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            {isCurrent ? 'Current Plan' : plan.monthly_price === 0 ? 'Start Free Trial' : 'Upgrade Now'}
                                        </button>
                                    </div>

                                    {/* Support Level Footer */}
                                    <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                            {plan.support_level === '24X7' && <Phone className="w-3.5 h-3.5" />}
                                            {plan.support_level === 'PRIORITY' && <MessageCircle className="w-3.5 h-3.5" />}
                                            {plan.support_level === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                                            <span className="font-medium">
                                                {plan.support_level === '24X7' ? '24/7 Phone Support' :
                                                    plan.support_level === 'PRIORITY' ? 'Priority Support' : 'Email Support'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Custom Plan Builder */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold mb-3">
                                <Calculator className="w-3.5 h-3.5" />
                                CUSTOM BUILDER
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Build Your Custom Plan</h2>
                            <p className="text-slate-400">Configure exactly what you need and get real-time pricing</p>
                        </div>
                        <button
                            onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            {showCustomBuilder ? 'Hide Builder' : 'Open Builder'}
                        </button>
                    </div>

                    {showCustomBuilder && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Configuration */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Users Slider */}
                                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-violet-400" />
                                            <span className="font-semibold">Number of Users</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setCustomUsers(Math.max(25, customUsers - 25))}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-2xl font-bold w-16 text-center">{customUsers}</span>
                                            <button
                                                onClick={() => setCustomUsers(customUsers + 25)}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="25"
                                        max="500"
                                        step="25"
                                        value={customUsers}
                                        onChange={(e) => setCustomUsers(Number(e.target.value))}
                                        className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-violet-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                                        <span>25</span>
                                        <span>250</span>
                                        <span>500+</span>
                                    </div>
                                </div>

                                {/* Branches Slider */}
                                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-violet-400" />
                                            <span className="font-semibold">Number of Branches</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setCustomBranches(Math.max(1, customBranches - 1))}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-2xl font-bold w-16 text-center">{customBranches}</span>
                                            <button
                                                onClick={() => setCustomBranches(customBranches + 1)}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        step="1"
                                        value={customBranches}
                                        onChange={(e) => setCustomBranches(Number(e.target.value))}
                                        className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-violet-500"
                                    />
                                </div>

                                {/* Modules Selection */}
                                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Layers className="w-5 h-5 text-violet-400" />
                                        <span className="font-semibold">Select Modules</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(MODULE_PRICING).map(([key, mod]) => {
                                            const isSelected = customModules.includes(key);
                                            const isRequired = key === 'HR' || key === 'ATTENDANCE';

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        if (isRequired) return;
                                                        if (isSelected) {
                                                            setCustomModules(customModules.filter(m => m !== key));
                                                        } else {
                                                            setCustomModules([...customModules, key]);
                                                        }
                                                    }}
                                                    disabled={isRequired}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                        ? 'bg-violet-600/30 border-violet-500'
                                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                                        } ${isRequired ? 'opacity-75' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold">{mod.name}</span>
                                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        {mod.price === 0 ? 'Included' : `+${formatPrice(mod.price)}/mo`}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm h-fit sticky top-6">
                                <h3 className="text-lg font-bold mb-6">Price Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Base Price</span>
                                        <span>{formatPrice(3999)}</span>
                                    </div>
                                    {customUsers > 25 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Extra Users ({customUsers - 25})</span>
                                            <span>+{formatPrice((customUsers - 25) * 50)}</span>
                                        </div>
                                    )}
                                    {customBranches > 3 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Extra Branches ({customBranches - 3})</span>
                                            <span>+{formatPrice((customBranches - 3) * 500)}</span>
                                        </div>
                                    )}
                                    {customModules.filter(m => MODULE_PRICING[m]?.price > 0).map(mod => (
                                        <div key={mod} className="flex justify-between text-sm">
                                            <span className="text-slate-400">{MODULE_PRICING[mod].name}</span>
                                            <span>+{formatPrice(MODULE_PRICING[mod].price)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/20 pt-4 mb-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-400">Total Monthly</span>
                                        <span className="text-3xl font-black">{formatPrice(calculateCustomPrice())}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 text-right mt-1">per month, billed monthly</p>
                                </div>

                                <button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25">
                                    <Phone className="w-4 h-4" />
                                    Contact Sales
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-3">Our team will reach out within 24 hours</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQ Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {[
                            { q: "Can I upgrade or downgrade anytime?", a: "Yes, you can change your plan at any time. Changes take effect immediately." },
                            { q: "What happens when I exceed my limits?", a: "You'll receive a notification and can either upgrade or remove resources." },
                            { q: "Is there a free trial for paid plans?", a: "The Trial plan gives you full access to all features for 30 days." },
                            { q: "How does billing work?", a: "We bill monthly or annually based on your preference. All prices are in INR." }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200">
                                <h4 className="font-bold text-sm text-slate-900 mb-2">{faq.q}</h4>
                                <p className="text-sm text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
