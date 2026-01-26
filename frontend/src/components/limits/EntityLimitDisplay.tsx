'use client';

import { AlertCircle, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { EntityType, EntityLimitInfo } from '@/hooks/useEntityLimit';

interface EntityLimitBadgeProps {
    entityType: EntityType;
    limitInfo: EntityLimitInfo | null;
    loading?: boolean;
    showDetails?: boolean;
}

/**
 * Professional badge showing entity usage and limits
 * Color-coded based on usage percentage
 */
export function EntityLimitBadge({
    entityType,
    limitInfo,
    loading = false,
    showDetails = true
}: EntityLimitBadgeProps) {
    if (loading) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full animate-pulse">
                <div className="w-16 h-4 bg-slate-200 rounded"></div>
            </div>
        );
    }

    if (!limitInfo) return null;

    const { current, maximum, remaining, percentage, allowed } = limitInfo;

    // Determine color based on usage
    const getColorClasses = () => {
        if (maximum === 0) {
            return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                icon: 'text-emerald-600'
            };
        }

        if (percentage >= 90) {
            return {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: 'text-red-600'
            };
        }

        if (percentage >= 75) {
            return {
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: 'text-amber-600'
            };
        }

        return {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: 'text-emerald-600'
        };
    };

    const colors = getColorClasses();
    const Icon = allowed ? CheckCircle2 : AlertCircle;

    const displayText = maximum === 0
        ? `${current} / Unlimited`
        : `${current} / ${maximum}`;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-bold`}>
            <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
            <span>{displayText}</span>
            {showDetails && maximum > 0 && (
                <span className="opacity-70">({percentage}%)</span>
            )}
        </div>
    );
}

interface EntityLimitCardProps {
    entityType: EntityType;
    limitInfo: EntityLimitInfo | null;
    loading?: boolean;
    onUpgrade?: () => void;
}

/**
 * Detailed card showing entity limits with upgrade prompt
 */
export function EntityLimitCard({
    entityType,
    limitInfo,
    loading = false,
    onUpgrade
}: EntityLimitCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!limitInfo) return null;

    const { current, maximum, remaining, percentage, allowed, message } = limitInfo;

    const entityNames: Record<EntityType, { singular: string; plural: string }> = {
        department: { singular: 'Department', plural: 'Departments' },
        designation: { singular: 'Designation', plural: 'Designations' },
        branch: { singular: 'Branch', plural: 'Branches' },
        employee: { singular: 'Employee', plural: 'Employees' }
    };

    const names = entityNames[entityType];

    const getProgressColor = () => {
        if (maximum === 0) return 'bg-emerald-500';
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{names.plural}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {maximum === 0 ? 'Unlimited' : `Maximum: ${maximum}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-slate-900">{current}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Active</div>
                    </div>
                </div>

                {/* Progress Bar */}
                {maximum > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-600">Usage</span>
                            <span className="text-slate-900">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor()} transition-all duration-500`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">{remaining} remaining</span>
                            {!allowed && (
                                <span className="text-red-600 font-bold">Limit Reached</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Unlimited Badge */}
                {maximum === 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            Unlimited Plan
                        </span>
                    </div>
                )}

                {/* Warning Message */}
                {!allowed && message && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-xs text-red-700 leading-relaxed">{message}</p>
                        {onUpgrade && (
                            <button
                                onClick={onUpgrade}
                                className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                                Upgrade Subscription
                            </button>
                        )}
                    </div>
                )}

                {/* Near Limit Warning */}
                {allowed && maximum > 0 && percentage >= 75 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-amber-900 mb-1">Approaching Limit</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                You're using {percentage}% of your {names.plural.toLowerCase()} quota.
                                Consider upgrading to avoid disruption.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface LimitReachedPromptProps {
    entityType: EntityType;
    message?: string;
    onClose?: () => void;
    onUpgrade?: () => void;
}

/**
 * Full-screen professional prompt when limit is reached
 */
export function LimitReachedPrompt({
    entityType,
    message,
    onClose,
    onUpgrade
}: LimitReachedPromptProps) {
    const entityNames: Record<EntityType, string> = {
        department: 'Departments',
        designation: 'Designations',
        branch: 'Branches',
        employee: 'Employees'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>

                <div className="p-8 text-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-slate-900">
                            Subscription Limit Reached
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            {message || `You've reached the maximum number of ${entityNames[entityType].toLowerCase()} allowed in your current subscription plan.`}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4">
                        {onUpgrade && (
                            <button
                                onClick={onUpgrade}
                                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
                            >
                                Upgrade Subscription
                            </button>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Go Back
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-slate-400 pt-4">
                        Contact your administrator or our support team for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}
