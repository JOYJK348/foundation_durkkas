import api from '@/lib/api';

export const crmService = {
    getStats: async () => {
        console.log('[CRM Service] 📊 Fetching stats (POST)...');
        const response = await api.post(`/crm/stats?_t=${Date.now()}`);
        console.log('[CRM Service] ✅ Stats received:', response.data.data);
        return response.data.data;
    },
    getRecentLeads: async () => {
        console.log('[CRM Service] 📋 Fetching recent leads (POST)...');
        const response = await api.post(`/crm/recent-leads?_t=${Date.now()}`);
        console.log('[CRM Service] ✅ Recent leads received:', response.data.data?.length || 0, 'items');
        return response.data.data;
    },
    getLead: async (type: string, id: string | number) => {
        const response = await api.get(`/crm/applications/${type}/${id}`);
        return response.data.data;
    },
    updateLead: async (type: string, id: string | number, data: any) => {
        const response = await api.patch(`/crm/applications/${type}/${id}`, data);
        return response.data;
    },
    deleteLead: async (type: string, id: string | number, reason: string = '') => {
        const response = await api.delete(`/crm/applications/${type}/${id}?reason=${encodeURIComponent(reason)}`);
        return response.data;
    },
    getArchives: async () => {
        const response = await api.get(`/crm/archives?_t=${Date.now()}`);
        return response.data.data;
    },
    restoreLead: async (typeKey: string, id: string | number) => {
        const response = await api.post(`/crm/restore`, { typeKey, id });
        return response.data;
    }
};
