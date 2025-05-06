"use client";

import React, { ReactNode } from 'react';
import { PageAIProvider } from '../context';

// Re-export props type for convenience if needed, or define inline
interface ClientWrapperProps {
  children: ReactNode;
  observerOptions?: MutationObserverInit;
  rootElement?: Element | Document | DocumentFragment;
  enableDevToolsQueryParam?: string;
  // Add engineOptions here if/when CommandEngine is integrated
}

/**
 * A client-side wrapper component for easy integration with frameworks
 * like Next.js (RSC). It ensures that the PageAIProvider and its
 * associated hooks and effects run only on the client.
 *
 * It accepts the same props as PageAIProvider and passes them through.
 */
export const ClientWrapper: React.FC<ClientWrapperProps> = ({
  children,
  ...providerProps // Pass remaining props directly to PageAIProvider
}) => {
  return (
    <PageAIProvider {...providerProps}>
      {children}
    </PageAIProvider>
  );
};