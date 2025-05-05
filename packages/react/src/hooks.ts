import { usePageAIContext } from './context';

/**
 * Hook to access the Page-AI context.
 *
 * Provides access to the latest DOM snapshot, streamed patches,
 * and developer tools state.
 *
 * Must be used within a `<PageAIProvider>`.
 *
 * @returns The Page-AI context value.
 */
export const usePageAI = () => {
  // Directly use the context hook defined alongside the provider
  return usePageAIContext();
};