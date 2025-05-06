// Export the core functionalities and types from the @page-ai/dom package

// Re-export from serializer
export { serializeNode } from './serializer';
export type { DomSnapshot } from './serializer';

// Re-export from observer
export { DomObserver } from './observer';
export type { DomPatch, PatchCallback } from './observer';

// Potentially add a higher-level function or class here later
// that combines serialization and observation if needed.
// For now, exporting the building blocks as per requirements.
// Export command handlers
export * from './handlers';