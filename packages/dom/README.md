# @page-ai/dom

This package handles interaction with the browser's Document Object Model (DOM) for the Page-AI SDK.

## Purpose

*   **DOM Serialization:** Provides mechanisms to serialize the relevant parts of the DOM into a format that AI models can understand.
*   **MutationObserver Diffing:** Uses `MutationObserver` to efficiently detect changes in the DOM and generate concise diffs, minimizing the data sent to the AI model.
*   **Command Handlers:** Exports functions (`handleClick`, `handleFill`, `handleSetAttr`) that perform the actual DOM manipulation for core AI commands. These are typically used by an integration layer like `@page-ai/react`.

## Installation

While typically installed as part of the main SDK (`@page-ai/react`), you can install it individually if needed:

```bash
bun install @page-ai/dom
```

## Basic Usage (Conceptual)

Initialize the DOM observer to monitor changes within a specific part of the application.

```typescript
import { DomObserver } from '@page-ai/dom';

// Get the root element of your application
const appRoot = document.getElementById('root');

if (appRoot) {
  // Initialize the observer, potentially passing configuration options
  const observer = new DomObserver(appRoot, { /* options */ });

  // Start observing
  observer.start();

  // Listen for changes
  observer.onChange((diff) => {
    console.log('DOM changed:', diff);
    // Send the diff to the AI agent or core engine
  });

  // Remember to stop observing when the component unmounts
  // observer.stop();
}
```

The serialized DOM and subsequent diffs are used by `@page-ai/core` to provide context to the AI agent.