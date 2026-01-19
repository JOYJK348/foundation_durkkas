import { supabaseService, app_auth } from '@/lib/supabase';
import { NotificationService } from './NotificationService';
import { headers } from 'next/headers';

/**
 * Service for Security and Audit Logging
 */
export class AuditService {
    /**
     * Helper to get IP from Request with Deep Detection
     */
    static getIP(req: any): string {
        try {
            let ip = req.ip || '';

            // Standard Header Deep Scan
            const getHeader = (name: string) => {
                if (req.headers && typeof req.headers.get === 'function') return req.headers.get(name);
                if (req.headers && req.headers[name]) return req.headers[name];
                return null;
            };

            if (!ip) {
                ip = getHeader('cf-connecting-ip') ||
                    getHeader('x-forwarded-for') ||
                    getHeader('x-real-ip') ||
                    getHeader('x-client-ip') ||
                    getHeader('true-client-ip') ||
                    '127.0.0.1';
            }

            if (typeof ip === 'string' && ip.includes(',')) {
                ip = ip.split(',')[0].trim();
            }

            if (typeof ip === 'string' && ip.includes(':') && !ip.includes('::')) {
                if (ip.includes('[') && ip.includes(']')) {
                    ip = ip.split(']')[0].replace('[', '');
                } else if (ip.split(':').length === 2) {
                    ip = ip.split(':')[0];
                }
            }

            if (ip === '::1' || (typeof ip === 'string' && ip.includes('ffff:127.0.0.1'))) {
                ip = '127.0.0.1';
            }

            return String(ip);
        } catch (e) {
            return '127.0.0.1';
        }
    }

    /**
     * Primary Audit Logger with Identity Self-Correction
     */
    static async logAction(params: {
        userId?: number;
        userEmail?: string;
        action: string;
        tableName: string;
        schemaName?: string;
        recordId?: string;
        oldData?: any;
        newData?: any;
        ipAddress?: string;
        userAgent?: string;
        companyId?: number;
    }) {
        try {
            let userEmail = params.userEmail;
            let ipAddress = params.ipAddress;
            let userAgent = params.userAgent;

            // Deep Context-Awareness: Try to harvest IP/UA/Email from request context if missing
            try {
                const headerStore = headers();
                if (!ipAddress) {
                    ipAddress = headerStore.get('cf-connecting-ip') ||
                        headerStore.get('x-forwarded-for')?.split(',')[0].trim() ||
                        headerStore.get('x-real-ip') ||
                        '127.0.0.1';
                }
                if (!userAgent) {
                    userAgent = headerStore.get('user-agent') || 'unknown';
                }
                if (!userEmail) {
                    userEmail = headerStore.get('x-user-email') || undefined;
                }
            } catch (hErr) {
                // Headers not available (outside request context)
                if (!ipAddress) ipAddress = '127.0.0.1';
                if (!userAgent) userAgent = 'system-internal';
            }

            // Identity Self-Correction: If email is still missing but ID exists, resolve it
            if (!userEmail && params.userId) {
                const { data } = await app_auth.users()
                    .select('email')
                    .eq('id', params.userId)
                    .single();
                if (data?.email) userEmail = data.email;
            }

            const rawId = params.recordId ? parseInt(params.recordId.toString()) : null;
            const validResourceId = (rawId !== null && !isNaN(rawId)) ? rawId : null;
            const cleanIp = (ipAddress && ipAddress.trim() !== '') ? ipAddress.trim() : null;

            const auditLogData = {
                user_id: params.userId || null,
                user_email: userEmail || null,
                action: params.action,
                resource_type: params.tableName,
                table_name: params.tableName,
                schema_name: params.schemaName || 'core',
                resource_id: validResourceId,
                old_values: params.oldData,
                new_values: params.newData,
                ip_address: cleanIp,
                user_agent: userAgent || 'unknown',
                company_id: params.companyId || null
            };

            const { data, error } = await app_auth.auditLogs().insert(auditLogData).select();

            if (error) {
                console.error('❌ [AUDIT SERVICE] DB Insert Error:', error.message, error.details);
                return null;
            }

            console.log(`✅ [AUDIT SERVICE] Event Registered: ${params.action} by ${userEmail || 'System'}`);

            // Trigger Notifications
            await this.triggerNotifications({ ...params, userEmail });

            return data;
        } catch (err: any) {
            console.error('❌ [AUDIT SERVICE] Exception:', err.message);
            return null;
        }
    }

    private static async triggerNotifications(params: any) {
        try {
            const { action, tableName, companyId, userEmail, userId, newData, oldData } = params;

            // Get user's full name for better context
            let actorName = userEmail || 'System';
            if (userId) {
                const { data: userData } = await app_auth.users()
                    .select('first_name, last_name, display_name')
                    .eq('id', userId)
                    .single();

                if (userData) {
                    actorName = userData.display_name ||
                        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                        userEmail || 'User';
                }
            }

            // Get company name for context
            let sourceCompanyName = params.companyName;
            if (!sourceCompanyName && companyId) {
                if (tableName === 'companies' && newData?.name) {
                    sourceCompanyName = newData.name;
                } else {
                    const { data } = await supabaseService
                        .schema('core')
                        .from('companies')
                        .select('name')
                        .eq('id', companyId)
                        .single();
                    sourceCompanyName = data?.name;
                }
            }

            // Format resource name
            const resourceLabel = tableName.replace(/_/g, ' ');
            const recordName = newData?.name ||
                newData?.first_name ||
                newData?.display_name ||
                newData?.title ||
                'record';

            // Create action-specific messages
            let title = '';
            let message = '';
            let priority: 'HIGH' | 'NORMAL' = 'NORMAL';

            const companyContext = sourceCompanyName ? ` from ${sourceCompanyName}` : '';

            switch (action.toUpperCase()) {
                case 'CREATE':
                    title = `New ${resourceLabel} Created`;
                    message = `${actorName}${companyContext} created a new ${resourceLabel}: "${recordName}"`;
                    break;

                case 'UPDATE':
                    title = `${resourceLabel} Updated`;
                    message = `${actorName}${companyContext} updated ${resourceLabel}: "${recordName}"`;
                    break;

                case 'DELETE':
                    title = `${resourceLabel} Deleted`;
                    message = `${actorName}${companyContext} deleted ${resourceLabel}: "${recordName}"`;
                    priority = 'HIGH';
                    break;

                case 'LOGIN':
                    title = 'User Login';
                    message = `${actorName}${companyContext} logged into the system`;
                    break;

                case 'LOGOUT':
                    title = 'User Logout';
                    message = `${actorName}${companyContext} logged out`;
                    break;

                default:
                    title = `System Event: ${action}`;
                    message = `${actorName}${companyContext} performed ${action} on ${resourceLabel}: "${recordName}"`;
            }

            // Send notification to Platform Admins
            await NotificationService.notifyPlatformAdmins({
                type: 'SYSTEM',
                title,
                message,
                priority,
                sourceCompanyId: companyId,
                sourceCompanyName,
                metadata: {
                    action,
                    resource: tableName,
                    performed_by: userEmail,
                    actor_name: actorName,
                    source_company_name: sourceCompanyName,
                    record_name: recordName
                }
            });

            // Send notification to Company Admins (if applicable)
            if (companyId && action !== 'LOGIN' && action !== 'LOGOUT') {
                await NotificationService.notifyCompanyAdmins(companyId, {
                    type: 'INFO',
                    title,
                    message,
                    priority: 'NORMAL',
                    metadata: {
                        action,
                        resource: tableName,
                        performed_by: userEmail,
                        actor_name: actorName,
                        record_name: recordName
                    }
                });
            }
        } catch (err) {
            console.error('❌ [AUDIT SERVICE] Notification Trigger Error:', err);
        }
    }

    static async logLogin(params: {
        userId: number;
        email?: string;
        ipAddress?: string;
        userAgent?: string;
        status: 'SUCCESS' | 'FAILED';
        failureReason?: string;
    }) {
        try {
            const { error } = await app_auth.loginHistory().insert({
                user_id: params.userId,
                email: params.email,
                logged_in_at: new Date().toISOString(),
                ip_address: params.ipAddress,
                user_agent: params.userAgent,
                login_status: params.status,
                failure_reason: params.failureReason
            });

            if (error) console.error('❌ [AUDIT SERVICE] Login History Error:', error.message);

            if (params.status === 'FAILED') {
                await NotificationService.notifyPlatformAdmins({
                    type: 'WARNING',
                    title: 'Security Alert: Failed Login',
                    message: `Failed login attempt for ${params.email} from IP ${params.ipAddress || 'Unknown'}`,
                    priority: 'HIGH'
                });
            }
        } catch (err) {
            console.error('❌ [AUDIT SERVICE] Login Logger Exception:', err);
        }
    }
}
