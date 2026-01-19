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
     * Send a notification to a specific user or company
     */
    static async send(params: NotificationParams) {
        try {
            console.log('🔔 NotificationService.send:', {
                title: params.title,
                companyId: params.companyId,
                userId: params.userId
            });

            const { data, error } = await supabaseService
                .schema(SCHEMAS.AUTH)
                .from('notifications')
                .insert({
                    user_id: params.userId,
                    company_id: params.companyId,
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
        try {
            const { data, error } = await supabaseService
                .schema(SCHEMAS.AUTH)
                .from('notifications')
                .insert({
                    target_type: 'GLOBAL',  // 🔒 ONLY Platform Admins can see this
                    type: params.type,
                    priority: params.priority || 'NORMAL',
                    title: params.title,
                    message: params.message,
                    action_url: params.actionUrl,
                    metadata: {
                        ...params.metadata,
                        source_company_id: params.sourceCompanyId,
                        source_company_name: params.sourceCompanyName
                    },
                    created_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error('❌ Failed to notify Platform Admins:', error);
                return null;
            }

            console.log(`✅ [NOTIFICATION] Platform Admin notification created: ${params.title}`);
            return data[0];
        } catch (err) {
            console.error('❌ Platform Admin Notification Exception:', err);
            return null;
        }
    }

    /**
     * Notify Company Admins of a specific company ONLY
     */
    static async notifyCompanyAdmins(companyId: number, params: Omit<NotificationParams, 'companyId'>) {
        try {
            const { data, error } = await supabaseService
                .schema(SCHEMAS.AUTH)
                .from('notifications')
                .insert({
                    target_type: 'COMPANY',  // 🔒 ONLY this company's admins can see
                    company_id: companyId,
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
                console.error('❌ Failed to notify Company Admins:', error);
                return null;
            }

            console.log(`✅ [NOTIFICATION] Company Admin notification created for company ${companyId}: ${params.title}`);
            return data[0];
        } catch (err) {
            console.error('❌ Company Admin Notification Exception:', err);
            return null;
        }
    }
}
