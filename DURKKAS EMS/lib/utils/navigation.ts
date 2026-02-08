/**
 * Navigation utility to trigger loading animation before navigation
 */

/**
 * Navigate with loading animation
 * Use this instead of router.push() to ensure loading animation shows
 */
export function navigateWithLoading(
  router: { push: (href: string) => void },
  href: string
) {
  // Trigger loading animation
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('navigation-start', { 
      detail: { path: href } 
    }));
  }
  // Navigate
  router.push(href);
}

