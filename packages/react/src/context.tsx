import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { DomObserver, serializeNode } from '@page-ai/dom';
import type { DomPatch, DomSnapshot } from '@page-ai/dom';
// import { CommandEngine, CommandEngineOptions } from '@page-ai/core/src/engine'; // Placeholder

export interface PageAIContextValue { // Export the interface
  snapshot: DomSnapshot | null;
  patches: DomPatch[];
  // callTool?: CommandEngine['callTool']; // Placeholder
  isDevToolsEnabled: boolean;
  toggleDevTools: () => void;
}

const PageAIContext = createContext<PageAIContextValue | undefined>(undefined);

interface PageAIProviderProps {
  children: ReactNode;
  observerOptions?: MutationObserverInit; // Use standard MutationObserverInit
  rootElement?: Element | Document | DocumentFragment; // Allow specifying root
  // engineOptions?: CommandEngineOptions; // Placeholder
  enableDevToolsQueryParam?: string; // e.g., 'debugAI'
}

export const PageAIProvider: React.FC<PageAIProviderProps> = ({
  children,
  observerOptions,
  rootElement = document.body, // Default to document.body
  // engineOptions,
  enableDevToolsQueryParam = 'debugAI',
}: PageAIProviderProps) => {
  const [snapshot, setSnapshot] = useState<DomSnapshot | null>(null);
  const [patches, setPatches] = useState<DomPatch[]>([]);
  const [isDevToolsEnabled, setIsDevToolsEnabled] = useState(false);
  const observerRef = useRef<DomObserver | null>(null);
  // const engineRef = useRef<CommandEngine | null>(null); // Placeholder

  // Callback for the DomObserver
  const handlePatches = useCallback((newPatches: DomPatch[]) => {
    // console.log('PageAIProvider: Received patches:', newPatches);
    setPatches((prevPatches: DomPatch[]) => [...prevPatches, ...newPatches]); // Append new patches
  }, []);

  useEffect(() => {
    // Initialize Observer with the callback
    observerRef.current = new DomObserver(handlePatches);
    // engineRef.current = new CommandEngine(engineOptions); // Placeholder

    // Get initial snapshot
    console.log('PageAIProvider: Generating initial snapshot...');
    const initialSnapshot = serializeNode(rootElement);
    setSnapshot(initialSnapshot);
    setPatches([]); // Clear patches on new snapshot

    // Start observing
    console.log('PageAIProvider: Starting observer...');
    observerRef.current.observe(rootElement, observerOptions);

    // Check for dev tools query param
    const checkDevToolsParam = () => {
      if (typeof window !== 'undefined' && enableDevToolsQueryParam) {
        const params = new URLSearchParams(window.location.search);
        setIsDevToolsEnabled(params.has(enableDevToolsQueryParam));
      }
    };

    checkDevToolsParam();
    // Optionally listen for history changes if using SPA routing
    // window.addEventListener('popstate', checkDevToolsParam);

    return () => {
      console.log('PageAIProvider: Disconnecting observer...');
      observerRef.current?.disconnect();
      // window.removeEventListener('popstate', checkDevToolsParam);
    };
    // Ensure dependencies are correct
  }, [observerOptions, rootElement, enableDevToolsQueryParam, handlePatches]); // engineOptions

  const toggleDevTools = () => {
    setIsDevToolsEnabled((prev: boolean) => !prev);
    // Optionally update URL query param here if desired
  };

  const contextValue: PageAIContextValue = {
    snapshot,
    patches,
    // callTool: engineRef.current?.callTool.bind(engineRef.current), // Placeholder
    isDevToolsEnabled,
    toggleDevTools,
  };

  return (
    <PageAIContext.Provider value={contextValue}>
      {children}
    </PageAIContext.Provider>
  );
};

// Custom hook to use the context (no changes needed here)
export const usePageAIContext = (): PageAIContextValue => {
  const context = useContext(PageAIContext);
  if (context === undefined) {
    throw new Error('usePageAIContext must be used within a PageAIProvider');
  }
  return context;
};