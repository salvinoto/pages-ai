// Core Provider and Context Hook
export { PageAIProvider, usePageAIContext } from './context'; // Export context hook for advanced use cases if needed
export type { PageAIContextValue } from './context'; // Export context type

// Primary Hook
export { usePageAI } from './hooks';

// Components
export { ClientWrapper } from './components/ClientWrapper';
export { AIDevTools } from './components/AIDevTools';

// Re-export relevant types from dependencies if needed for consumers
// Consumers should use the standard MutationObserverInit type from lib.dom.d.ts
export type { DomSnapshot, DomPatch } from '@page-ai/dom';