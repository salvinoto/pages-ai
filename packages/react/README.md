# @page-ai/react

This package provides React components and hooks to integrate the Page-AI SDK into React applications.

## Purpose

*   **React Integration:** Offers seamless integration with React applications.
*   **Provider Component:** Includes `PageAIProvider` (and potentially `ClientWrapper` for specific use cases like Next.js Client Components) to manage the Page-AI context.
*   **`usePageAI` Hook:** Provides easy access to Page-AI functionalities within React components.
*   **`AIDevTools` Component:** A development tool component for visualizing Page-AI state and interactions.

## Installation

Install the package along with its core and DOM dependencies:

```bash
bun install @page-ai/react @page-ai/core @page-ai/dom
```

## Basic Usage

**1. Wrap your application:**

Use `PageAIProvider` (or `ClientWrapper` if needed for client-side boundaries) at the root of your application or relevant subtree.

```jsx
// In your main App component or layout
import { PageAIProvider } from '@page-ai/react';
import { MyAppComponent } from './MyAppComponent';

function App() {
  return (
    <PageAIProvider config={{ /* configuration options */ }}>
      <MyAppComponent />
      {/* Optionally include DevTools during development */}
      {process.env.NODE_ENV === 'development' && <AIDevTools />}
    </PageAIProvider>
  );
}

export default App;
```

**2. Access Page-AI state and dispatch commands:**

Use the `usePageAI` hook (or `usePageAIContext`) to access the DOM snapshot, patches, and the `dispatchCommand` function.

```jsx
'use client'; // Required if dispatching commands or using state/effects

import { usePageAI } from '@page-ai/react'; // Or usePageAIContext
import { useState } from 'react';

function MyInteractiveComponent() {
  // Get snapshot, patches, and the command dispatcher from the hook
  const { snapshot, patches, dispatchCommand } = usePageAI();
  const [commandStatus, setCommandStatus] = useState('');

  const handleButtonClick = async () => {
    setCommandStatus('Executing...');
    try {
      const command = { type: 'click', selector: '#my-button-id' };
      // Use the dispatchCommand function provided by the hook
      await dispatchCommand(command);
      setCommandStatus('Click command dispatched successfully!');
    } catch (error) {
      console.error("Dispatch error:", error);
      setCommandStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <button id="my-button-id" onClick={handleButtonClick}>
        Dispatch AI Click
      </button>
      <p>Status: {commandStatus}</p>

      {/* Display snapshot or patches */}
      {/* <pre>{JSON.stringify(snapshot, null, 2)}</pre> */}
    </div>
  );
}
```

**3. Enable DevTools (Development):**

Include the `AIDevTools` component within the provider during development to inspect the Page-AI state.