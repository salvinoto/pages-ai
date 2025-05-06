/**
 * @page-ai/core Entry Point
 *
 * This package provides the core data structures, validation logic,
 * and execution engine primitives for Page AI commands.
 * It is designed to be environment-agnostic and Edge-runtime safe.
 */

// --- Command Definitions ---
export {
    BaseAICommandSchema,
    ClickCommandSchema,
    FillCommandSchema,
    SetAttrCommandSchema,
    BatchCommandSchema,
    UndoCommandSchema,
    AICommandSchema,
} from './commands';

export type {
    BaseAICommand,
    ClickCommand,
    FillCommand,
    SetAttrCommand,
    BatchCommand,
    UndoCommand,
    AICommand,
} from './commands';

// --- Selector Validation ---
export {
    isValidSelector,
    parseAndValidateSelector,
    ALLOWED_SELECTOR_REGEX // Exporting regex might be useful for consumers
} from './selector';

// --- Execution Engine ---
export {
    executeCommand,
    executeBatch,
    executeUndo,
    // ExecutionContext, // Export type separately below
    ExecutionError,
} from './engine';
// Export necessary types from engine
export type {
    ExecutionContext,
    CommandHandlerMap,
    InverseOperation,
    Mutation // Export Mutation as well, might be useful
} from './engine';

// --- Edge-Safe Helpers ---
export {
    parseQueryString,
    delay,
} from './engine';