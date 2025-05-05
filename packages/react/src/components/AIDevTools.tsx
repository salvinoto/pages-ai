'use client'; // This component interacts with context and state, likely client-side

import React from 'react';
import { usePageAI } from '../hooks';

const devToolsStyles: React.CSSProperties = {
  position: 'fixed',
  bottom: '10px',
  right: '10px',
  width: '350px',
  maxHeight: '40vh',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  border: '1px solid #555',
  borderRadius: '5px',
  padding: '10px',
  zIndex: 9999,
  overflow: 'auto',
  fontSize: '12px',
  fontFamily: 'monospace',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #555',
  paddingBottom: '5px',
  marginBottom: '5px',
};

const closeButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontSize: '16px',
  cursor: 'pointer',
};

const contentStyles: React.CSSProperties = {
  flexGrow: 1,
  overflowY: 'auto', // Allow content scrolling
};

const sectionStyles: React.CSSProperties = {
  marginBottom: '10px',
};

const sectionTitleStyles: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#88f',
  marginBottom: '5px',
};

/**
 * A developer tools overlay component that displays the current Page-AI
 * snapshot and patches when enabled via the context.
 */
export const AIDevTools: React.FC = () => {
  const { snapshot, patches, isDevToolsEnabled, toggleDevTools } = usePageAI();

  if (!isDevToolsEnabled) {
    return null; // Don't render anything if not enabled
  }

  // Simple serialization for display
  const formatData = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return `Error serializing data: ${e instanceof Error ? e.message : String(e)}`;
    }
  };

  return (
    <div style={devToolsStyles}>
      <div style={headerStyles}>
        <span>Page-AI DevTools</span>
        <button onClick={toggleDevTools} style={closeButtonStyles} title="Close DevTools">&times;</button>
      </div>
      <div style={contentStyles}>
        <div style={sectionStyles}>
          <div style={sectionTitleStyles}>Snapshot:</div>
          <pre>{snapshot ? formatData(snapshot) : 'No snapshot yet.'}</pre>
        </div>
        <div style={sectionStyles}>
          <div style={sectionTitleStyles}>Patches ({patches.length}):</div>
          <pre>{patches.length > 0 ? formatData(patches) : 'No patches yet.'}</pre>
        </div>
      </div>
    </div>
  );
};