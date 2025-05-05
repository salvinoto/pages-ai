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

**2. Access Page-AI in components:**

Use the `usePageAI` hook to interact with the Page-AI engine.

```jsx
import { usePageAI } from '@page-ai/react';

function MyInteractiveComponent() {
  const { engine, state } = usePageAI();

  // Use the engine to execute commands or get information
  // Access the current state (e.g., serialized DOM, available tools)

  return (
    <div>
      {/* Your component UI */}
    </div>
  );
}
```

**3. Enable DevTools (Development):**

Include the `AIDevTools` component within the provider during development to inspect the Page-AI state.