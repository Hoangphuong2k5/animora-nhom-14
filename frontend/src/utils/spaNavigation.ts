import React from 'react';

/**
 * Intercept plain left-clicks on internal anchor links to perform SPA navigation
 * while preserving Cmd/Ctrl/Shift/middle-click browser defaults.
 */
export function handleSpaLinkClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  targetPath: string,
  onNavigateUrl: (path: string) => void
): void {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  e.preventDefault();
  onNavigateUrl(targetPath);
}

