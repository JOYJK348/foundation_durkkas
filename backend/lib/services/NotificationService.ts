import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM' | 'BROADCAST';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationParams {
    userId?: number;
    companyId?: number;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: any;
}

/**
 * Service to handle real-time notifications for Platform and Company Admins
 */
export class NotificationService {
    /**
     * Send a notification to a specific user, company, or branch
     */
    static async send(params: NotificationParams & { branchId?: number, targetType?: string }) {
        try {
            console.log('🔔 NotificationService.send:', {
                title: params.title,
                companyId: params.companyId,
                branchId: params.branchId,
                userId: params.userId
            });

            const { data, error } = await supabaseService
                .schema(SCHEMAS.AUTH)
                .from('notifications')
                .insert({
                    user_id: params.userId,
                    company_id: params.companyId,
                    branch_id: params.branchId,
                    target_type: params.targetType || (params.userId ? 'USER' : (params.branchId ? 'BRANCH' : (params.companyId ? 'COMPANY' : 'GLOBAL'))),
                    type: params.type,
                    priority: params.priority || 'NORMAL',
                    title: params.title,
                    message: params.message,
                    action_url: params.actionUrl,
                    metadata: params.metadata,
                    created_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error('❌ Failed to create notification:', error);
                return null;
            }

            return data[0];
        } catch (err) {
            console.error('❌ Notification Service Exception:', err);
            return null;
        }
    }

    /**
     * Broadcast to all Platform Admins ONLY (not visible to Company/Branch Admins)
     */
    static async notifyPlatformAdmins(params: Omit<NotificationParams, 'userId' | 'companyId'> & { sourceCompanyId?: number, sourceCompanyName?: string }) {
        return this.send({
            ...params,
            targetType: 'GLOBAL',
            companyId: params.sourceCompanyId,
            metadata: {
                ...params.metadata,
                source_company_id: params.sourceCompanyId,
                source_company_name: params.sourceCompanyName
            }
        });
    }

    /**
     * Notify Company Admins of a specific company ONLY
     */
    static async notifyCompanyAdmins(companyId: number, params: Omit<NotificationParams, 'companyId'>) {
        return this.send({
            ...params,
            companyId,
            targetType: 'COMPANY'
        });
    }

    /**
     * Notify Branch Admins of a specific branch ONLY
     */
    static async notifyBranchAdmins(companyId: number, branchId: number, params: Omit<NotificationParams, 'companyId' | 'branchId'>) {
        return this.send({
            ...params,
            companyId,
            branchId,
            targetType: 'BRANCH'
        });
    }
}
