import { AICommand, AICommandSchema, BatchCommand, UndoCommand } from './commands';
import { isValidSelector, parseAndValidateSelector } from './selector';

/**
 * Represents a mutation performed by a command.
 * This is a conceptual representation; the actual structure will depend
 * on the environment (e.g., DOM mutations).
 */
export interface Mutation {
  type: 'attribute' | 'property' | 'style' | 'content' | 'other';
  targetSelector: string; // Selector of the element mutated
  // Information needed to revert the mutation
  previousValue: any;
  currentValue: any;
  attributeName?: string; // For attribute mutations
  // Add other relevant details
}

/**
 * Represents an operation that can undo a specific mutation.
 */
export interface InverseOperation {
  commandId: string; // ID of the command that caused the mutation
  mutation: Mutation; // The mutation to revert
  // Function or data needed to perform the undo
  revert: () => Promise<void> | void; // Placeholder for actual undo logic
}

/**
 * Type definition for a map of command types to their handler functions.
 * Handlers are responsible for executing the command in a specific environment
 * and returning the necessary information to undo the operation.
 */
export type CommandHandlerMap = {
    // Use mapped types for better type safety if possible, or define explicitly
    click?: (command: Extract<AICommand, { type: 'click' }>, context: ExecutionContext) => Promise<InverseOperation | null>;
    fill?: (command: Extract<AICommand, { type: 'fill' }>, context: ExecutionContext) => Promise<InverseOperation | null>;
    setAttr?: (command: Extract<AICommand, { type: 'setAttr' }>, context: ExecutionContext) => Promise<InverseOperation | null>;
    // Add other command types as needed
    // Note: 'batch' and 'undo' are typically handled by the engine itself, not external handlers.
};


/**
 * Represents the state required for command execution.
 * This might include the undo stack, current target context (e.g., window/document), etc.
 */
export interface ExecutionContext {
  undoStack: InverseOperation[];
  /** Optional map of command handlers for environment-specific execution */
  handlers?: CommandHandlerMap;
  // Add other context if needed, e.g., target environment access
}

/**
 * Error class for execution failures.
 */
export class ExecutionError extends Error {
  constructor(message: string, public command?: AICommand) {
    super(message);
    this.name = 'ExecutionError';
  }
}

/**
 * Processes a single AI command within a given context.
 * This is a placeholder and would delegate to specific handlers
 * in a real execution environment (like @page-ai/dom).
 *
 * @param command The command to execute.
 * @param context The current execution context.
 * @returns A promise resolving to an InverseOperation or null if no mutation occurred.
 * @throws {ExecutionError} If validation or execution fails.
 */
async function executeSingleCommand(
  command: AICommand,
  context: ExecutionContext
): Promise<InverseOperation | null> {
  // 1. Validate the command structure (already done by Zod if parsed)
  // We might re-validate here or assume it's pre-validated.

  // 2. Validate the selector (if applicable)
  if (command.selector && !isValidSelector(command.selector)) {
    throw new ExecutionError(`Invalid selector: ${command.selector}`, command);
  }
  const validatedSelector = command.selector ? parseAndValidateSelector(command.selector) : undefined;


  // 3. Find and execute the appropriate handler, if provided
  const handler = context.handlers?.[command.type as keyof CommandHandlerMap];

  if (typeof handler === 'function') {
    // Type assertion might be needed depending on CommandHandlerMap definition complexity
    // We assume the map keys align with command types correctly here.
    // The handler is responsible for the actual execution and returning the inverse operation.
    // @ts-ignore - Need to refine CommandHandlerMap/Extract for better type safety if possible
    return await handler(command, context);
  } else {
    // If no handler is provided for this command type, throw an error.
    // Batch and Undo are handled separately and shouldn't reach here via executeSingleCommand.
    console.error(`No handler found for command type: ${command.type}`, command);
    throw new ExecutionError(`Execution handler not found for command type: ${command.type}`, command);
  }
}

/**
 * Executes a batch of commands transactionally.
 * If any command fails, it attempts to revert mutations from the successful commands in the batch.
 *
 * @param batchCommand The BatchCommand containing the commands to execute.
 * @param context The execution context.
 * @returns A promise resolving when the batch is processed.
 * @throws {ExecutionError} If any command in the batch fails.
 */
export async function executeBatch(
  batchCommand: BatchCommand,
  context: ExecutionContext
): Promise<void> {
  const successfulInverseOps: InverseOperation[] = [];

  try {
    for (const command of batchCommand.commands) {
      // Validate nested commands (Zod schema handles structure, we check selector)
      if (command.selector && !isValidSelector(command.selector)) {
          throw new ExecutionError(`Invalid selector in batch: ${command.selector}`, command);
      }

      // Process nested batches recursively or handle other command types
      if (command.type === 'batch') {
        await executeBatch(command, context); // Recursive call for nested batches
      } else if (command.type === 'undo') {
        await executeUndo(command, context); // Handle undo within a batch
      } else {
        const inverseOp = await executeSingleCommand(command, context);
        if (inverseOp) {
          successfulInverseOps.push(inverseOp);
        }
      }
    }

    // If all commands succeeded, add their inverse operations to the main undo stack
    context.undoStack.push(...successfulInverseOps);

  } catch (error) {
    console.error('Batch execution failed. Reverting successful steps in batch...', error);
    // Revert successful operations within this batch in reverse order
    for (let i = successfulInverseOps.length - 1; i >= 0; i--) {
      const opToRevert = successfulInverseOps[i];
      if (opToRevert) { // Add check for undefined
          try {
            await opToRevert.revert();
          } catch (revertError) {
            console.error(`Failed to revert operation for command ${opToRevert.commandId}:`, revertError);
            // Decide how to handle revert failures (e.g., log, throw specific error)
          }
      }
    }
    // Re-throw the original error
    if (error instanceof ExecutionError) {
        throw error;
    } else if (error instanceof Error) {
        throw new ExecutionError(`Batch failed: ${error.message}`);
    } else {
        throw new ExecutionError(`Batch failed with unknown error.`);
    }
  }
}

/**
 * Executes an Undo command.
 * Pops the last operation from the undo stack and reverts it.
 *
 * @param undoCommand The UndoCommand.
 * @param context The execution context.
 * @returns A promise resolving when the undo is complete.
 * @throws {ExecutionError} If the undo stack is empty or revert fails.
 */
export async function executeUndo(
    undoCommand: UndoCommand, // Parameter currently unused but kept for consistency
    context: ExecutionContext
): Promise<void> {
    if (context.undoStack.length === 0) {
        console.warn("Undo stack is empty. Cannot perform undo.");
        // Optionally throw an error or just return
        // throw new ExecutionError("Undo stack is empty", undoCommand);
        return;
    }

    const lastOperation = context.undoStack.pop();

    if (lastOperation) {
        try {
            console.log(`Undoing command ${lastOperation.commandId}...`);
            await lastOperation.revert();
        } catch (error) {
            // If revert fails, push the operation back onto the stack? Or log?
            context.undoStack.push(lastOperation); // Put it back for potential retry?
            console.error(`Failed to revert command ${lastOperation.commandId}:`, error);
            const message = error instanceof Error ? error.message : String(error);
            throw new ExecutionError(`Undo failed: ${message}`, undoCommand);
        }
    }
}


/**
 * Main execution function for any AI Command.
 * Parses the command, validates it, and delegates to the appropriate execution logic.
 *
 * @param rawCommand The raw command object (potentially untrusted).
 * @param context The execution context.
 * @returns A promise resolving when the command execution is complete.
 */
export async function executeCommand(
    rawCommand: unknown,
    context: ExecutionContext
): Promise<void> {
    const validationResult = AICommandSchema.safeParse(rawCommand);

    if (!validationResult.success) {
        console.error("Invalid command structure:", validationResult.error);
        throw new ExecutionError(`Invalid command structure: ${validationResult.error.message}`);
    }

    const command = validationResult.data;

    // Delegate based on command type
    switch (command.type) {
        case 'batch':
            await executeBatch(command, context);
            break;
        case 'undo':
            await executeUndo(command, context);
            break;
        case 'click':
        case 'fill':
        case 'setAttr':
            // For single, non-batch/undo commands
            const inverseOp = await executeSingleCommand(command, context);
            if (inverseOp) {
                context.undoStack.push(inverseOp);
            }
            break;
       default:
           // This case should ideally be unreachable if all command types are handled above.
           // If this error occurs at runtime, it means an unknown command type was encountered.
           const unknownType = (command as any)?.type ?? 'unknown';
           console.error("Unhandled command type encountered:", unknownType, command);
           throw new ExecutionError(`Unsupported or unhandled command type: ${unknownType}`);
   }
}

// --- Edge-Runtime Safe Helpers ---

/**
 * Example of an Edge-runtime safe helper.
 * Parses a query string into an object.
 * Avoids using Node.js 'querystring' or 'URLSearchParams' if compatibility is uncertain
 * across all edge environments (though URLSearchParams is generally available).
 * This is a basic implementation.
 *
 * @param queryString The query string (e.g., "foo=bar&baz=qux").
 * @returns An object representing the parsed query string.
 */
export function parseQueryString(queryString: string | undefined | null): Record<string, string> {
    const params: Record<string, string> = {};
    if (!queryString) {
        return params;
    }
    // Remove leading '?' if present
    const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;

   query.split('&').forEach(pair => {
       const parts = pair.split('=');
       // Ensure parts[0] exists before decoding
       if (parts.length > 0 && parts[0] !== undefined) {
           const key = decodeURIComponent(parts[0].replace(/\+/g, ' '));
           // Ensure parts[1] exists for value, otherwise default to empty string
           const value = parts.length > 1 && parts[1] !== undefined
               ? decodeURIComponent(parts[1].replace(/\+/g, ' '))
               : '';
           if (key) { // Avoid empty keys
               params[key] = value;
           }
        }
    });
    return params;
}

// Add other Edge-safe helpers as needed (e.g., simple async delay)

/**
 * Edge-safe async delay function.
 * @param ms Milliseconds to delay.
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}