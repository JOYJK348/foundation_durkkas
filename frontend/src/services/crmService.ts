import api from '@/lib/api';

export const crmService = {
    getStats: async () => {
        const response = await api.get('/crm/stats');
        return response.data.data;
    },
    getRecentLeads: async () => {
        const response = await api.get('/crm/recent-leads');
        return response.data.data;
    }
};
