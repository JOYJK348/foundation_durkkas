import { useState, useEffect } from 'react';
import { brandingService, BrandingSettings } from '@/services/brandingService';

export function useBranding() {
    const [branding, setBranding] = useState<BrandingSettings>({
        platform_logo_url: '/logo.svg',
        platform_favicon_url: '/favicon.ico',
        platform_tagline: 'Advanced Enterprise Architecture',
        system_name: 'Durkkas ERP'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBranding();
    }, []);

    const loadBranding = async () => {
        setLoading(true);
        try {
            const settings = await brandingService.getBrandingSettings();
            setBranding(settings);
        } catch (error) {
            console.error('[useBranding] Failed to load branding:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateBranding = async (settings: Partial<BrandingSettings>) => {
        const success = await brandingService.updateBrandingSettings(settings);
        if (success) {
            await loadBranding(); // Reload to get fresh data
        }
        return success;
    };

    return {
        branding,
        loading,
        updateBranding,
        reload: loadBranding
    };
}
