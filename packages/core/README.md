# @page-ai/core

This package provides the core functionalities for the Page-AI SDK.

## Purpose

*   **Tool Descriptors:** Defines a schema for describing available actions (tools) that an AI agent can perform on a web page.
*   **Selector DSL:** Implements a domain-specific language for selecting DOM elements in a way that's robust to minor UI changes.
*   **Execution Engine:** Provides the `executeCommand` function and related logic (batching, undo stack) for processing validated AI commands. It relies on environment-specific handlers (like those in `@page-ai/dom`) provided via its `ExecutionContext` to perform actual actions (e.g., clicking an element).
*   **Edge Compatibility:** Designed to be compatible with edge computing environments.

## Installation

While typically installed as part of the main SDK (`@page-ai/react`), you can install it individually if needed:

```bash
bun install @page-ai/core
```

## Basic Usage (Conceptual)

Define command schemas using libraries like Zod to structure the expected inputs and outputs for AI interactions.

```typescript
import { z } from 'zod';

const clickSchema = z.object({
  selector: z.string().describe("CSS selector for the element to click"),
});

// Use this schema within the Page-AI engine to define a 'click' command.
```

The core engine uses these schemas and the selector DSL to interpret AI instructions. The actual interaction with the target environment (e.g., DOM manipulation) is performed by handlers provided to the `executeCommand` function, typically managed by an integration layer like `@page-ai/react`.