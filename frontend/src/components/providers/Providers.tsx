'use client';

import { Toaster } from 'sonner';
import { FeatureAccessProvider } from '@/contexts/FeatureAccessContext';

/**
 * Client-side providers wrapper
 * Wraps all client-side context providers
 * Updated: Forces FeatureAccessProvider
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FeatureAccessProvider>
            {children}
            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={3000}
            />
        </FeatureAccessProvider>
    );
}
