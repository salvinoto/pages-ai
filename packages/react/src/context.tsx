"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { DomObserver, serializeNode, handleClick, handleFill, handleSetAttr } from '@page-ai/dom'; // Import handlers
import type { DomPatch, DomSnapshot } from '@page-ai/dom';
import { executeCommand } from '@page-ai/core'; // Import core executor
import type { ExecutionContext, CommandHandlerMap, InverseOperation, AICommand } from '@page-ai/core'; // Import core types

export interface PageAIContextValue { // Export the interface
  snapshot: DomSnapshot | null;
  patches: DomPatch[];
  /** Function to dispatch an AI command for execution */
  dispatchCommand: (command: AICommand) => Promise<void>;
  isDevToolsEnabled: boolean;
  toggleDevTools: () => void;
}

const PageAIContext = createContext<PageAIContextValue | undefined>(undefined);

interface PageAIProviderProps {
  children: ReactNode;
  observerOptions?: MutationObserverInit; // Use standard MutationObserverInit
  rootElement?: Element | Document | DocumentFragment | null; // Allow specifying root, allow null initially
  // engineOptions?: CommandEngineOptions; // Placeholder
  enableDevToolsQueryParam?: string; // e.g., 'debugAI'
}

export const PageAIProvider: React.FC<PageAIProviderProps> = ({
  children,
  observerOptions,
  rootElement: rootElementProp, // Rename prop to avoid conflict
  // engineOptions,
  enableDevToolsQueryParam = 'debugAI',
}: PageAIProviderProps) => {
  const [snapshot, setSnapshot] = useState<DomSnapshot | null>(null);
  const [patches, setPatches] = useState<DomPatch[]>([]);
  const [isDevToolsEnabled, setIsDevToolsEnabled] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false); // State to track client readiness
  // State for the effective root element, defaulting if on client and prop is null/undefined
  const [effectiveRootElement, setEffectiveRootElement] = useState<Element | Document | DocumentFragment | null>(rootElementProp ?? null);
  const observerRef = useRef<DomObserver | null>(null);
  // State for the execution context, including undo stack and handlers
  const executionContextRef = useRef<ExecutionContext | null>(null);

  // Define command handlers (memoize if necessary, but likely stable)
  const commandHandlers: CommandHandlerMap = {
      // Note: Handlers from @page-ai/dom might need adjustments
      // if they don't perfectly match the expected signature (e.g., returning InverseOperation)
      // For now, we assume they can be adapted or the core engine handles mutation tracking.
      // This wiring assumes the handlers perform the action directly.
      // A more robust implementation might have handlers return mutation details
      // for the core engine to create the InverseOperation.
      // Let's proceed with the simpler direct execution for now.
      // Add explicit types for command parameters
      click: async (command: Extract<AICommand, { type: 'click' }>) => { await handleClick(command); return null; },
      fill: async (command: Extract<AICommand, { type: 'fill' }>) => { await handleFill(command); return null; },
      setAttr: async (command: Extract<AICommand, { type: 'setAttr' }>) => { await handleSetAttr(command); return null; },
  };


  // Callback for the DomObserver
  const handlePatches = useCallback((newPatches: DomPatch[]) => {
    // console.log('PageAIProvider: Received patches:', newPatches);
    setPatches((prevPatches: DomPatch[]) => [...prevPatches, ...newPatches]); // Append new patches
  }, []);

  useEffect(() => {
    // Determine effective root element only on client
    if (isClientReady && !effectiveRootElement) {
      setEffectiveRootElement(document.body);
    }

    // Initialize execution context only once
    if (!executionContextRef.current) {
        executionContextRef.current = {
            undoStack: [],
            handlers: commandHandlers,
        };
    }

    // Only proceed if we have an effective root element
    if (!effectiveRootElement) {
      return; // Don't initialize observer etc. if no root element yet
    }

    // Initialize Observer with the callback
    observerRef.current = new DomObserver(handlePatches);

    // Start observing
    console.log('PageAIProvider: Starting observer...');
    observerRef.current.observe(effectiveRootElement, observerOptions);

    // Set client ready state after mount
    setIsClientReady(true);

    // NOTE: Initial snapshot generation moved to the isClientReady effect

    return () => {
      console.log('PageAIProvider: Disconnecting observer...');
      observerRef.current?.disconnect();
      // window.removeEventListener('popstate', checkDevToolsParam);
    };
    // Ensure dependencies are correct
  }, [observerOptions, effectiveRootElement, handlePatches, isClientReady]); // Added isClientReady, use effectiveRootElement

  // Wrap checkDevToolsParam in useCallback
  const checkDevToolsParam = useCallback(() => {
    if (typeof window !== 'undefined' && enableDevToolsQueryParam) {
      const params = new URLSearchParams(window.location.search);
      setIsDevToolsEnabled(params.has(enableDevToolsQueryParam));
    }
  }, [enableDevToolsQueryParam, setIsDevToolsEnabled]);

  // Effect to run client-only logic once ready (dev tools check, initial snapshot)
  useEffect(() => {
    if (isClientReady && effectiveRootElement) {
      // Check dev tools param
      checkDevToolsParam();

      // Generate initial snapshot now that we are fully client-side
      console.log('PageAIProvider: Generating initial snapshot (client-side)...');
      const initialSnapshot = serializeNode(effectiveRootElement);
      setSnapshot(initialSnapshot);
      setPatches([]); // Clear patches on new snapshot

      // Optionally listen for history changes if using SPA routing
      // window.addEventListener('popstate', checkDevToolsParam);
    }
    // Cleanup for history listener if added
    // return () => {
    //   window.removeEventListener('popstate', checkDevToolsParam);
    // };
  }, [isClientReady, checkDevToolsParam, effectiveRootElement]); // Add effectiveRootElement dependency

  const toggleDevTools = () => {
    setIsDevToolsEnabled((prev: boolean) => !prev);
    // Optionally update URL query param here if desired
  };

  // Function to dispatch commands using the core executor and context
  const dispatchCommand = useCallback(async (command: AICommand) => {
    if (!executionContextRef.current) {
      console.error("Execution context not initialized.");
      throw new Error("Execution context not initialized.");
    }
    try {
      // Use the core executeCommand function with the stored context
      await executeCommand(command, executionContextRef.current);
      console.log("Command dispatched successfully:", command.type);
      // Potentially trigger snapshot update or other side effects if needed
    } catch (error) {
      console.error("Error dispatching command:", error);
      // Re-throw or handle as appropriate for the application
      throw error;
    }
  }, []); // No dependencies needed if executeCommand and contextRef are stable

  const contextValue: PageAIContextValue = {
    snapshot,
    patches,
    dispatchCommand, // Provide the dispatch function
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