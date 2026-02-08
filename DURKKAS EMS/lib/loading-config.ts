/**
 * Global Loading Configuration
 * All loading animations and delays are optimized for 2-second maximum duration
 */
export const LOADING_CONFIG = {
  // Maximum loading duration (2 seconds)
  MAX_DURATION: 2000,
  
  // Animation durations (in milliseconds)
  ANIMATIONS: {
    FADE_IN: 150,      // Fast fade in
    FADE_OUT: 200,     // Fast fade out
    SPRING: 200,       // Spring animation
    TRANSITION: 200,   // General transition
  },
  
  // Timeouts (in milliseconds)
  TIMEOUTS: {
    CHAT_RESPONSE: 800,        // AI chat response delay
    FORM_SUBMIT: 1000,         // Form submission delay
    TOAST_DISMISS: 2000,       // Toast auto-dismiss
    CLOSE_ANIMATION: 200,      // Close animation delay
    MOUNT_DELAY: 50,           // Component mount delay
  },
  
  // Progress update interval (60fps for smooth animation)
  PROGRESS_INTERVAL: 16,
} as const;

