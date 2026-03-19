'use client';

import { Toaster } from 'sonner';
import { FeatureAccessProvider } from '@/contexts/FeatureAccessContext';
import { ChatWidget } from '@/components/ems/chat/chat-widget';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Client-side providers wrapper
 * Wraps all client-side context providers
 * Updated: Forces FeatureAccessProvider
 */
export function Providers({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    return (
        <FeatureAccessProvider>
            {/* 
              CRITICAL: We use user?.id as a key to force the ChatWidget to 
              completely unmount and remount when the user changes.
              This ensures all local states and initial greetings are fresh.
            */}
            <ChatWidget key={user?.id || 'guest'} />
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
