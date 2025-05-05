import { z } from 'zod';

// Base schema for all AI commands
export const BaseAICommandSchema = z.object({
  id: z.string().uuid().optional().describe('Unique identifier for the command instance'),
  type: z.string().describe('The type of the command'),
  selector: z.string().optional().describe('CSS-like selector targeting the element'),
  // Add other common fields if needed, e.g., metadata, targetFrameId
});

export type BaseAICommand = z.infer<typeof BaseAICommandSchema>;

// --- Specific Command Schemas (Non-Recursive First) ---

// Click Command
export const ClickCommandSchema = BaseAICommandSchema.extend({
  type: z.literal('click'),
  selector: z.string().describe('Selector for the element to click'),
  // Add click-specific options if needed (e.g., button, modifiers)
});
export type ClickCommand = z.infer<typeof ClickCommandSchema>;

// Fill Command
export const FillCommandSchema = BaseAICommandSchema.extend({
  type: z.literal('fill'),
  selector: z.string().describe('Selector for the input element to fill'),
  value: z.string().describe('The value to fill into the input'),
  // Add fill-specific options if needed (e.g., delay, force)
});
export type FillCommand = z.infer<typeof FillCommandSchema>;

// Set Attribute Command
export const SetAttrCommandSchema = BaseAICommandSchema.extend({
  type: z.literal('setAttr'),
  selector: z.string().describe('Selector for the element'),
  attribute: z.string().describe('The name of the attribute to set'),
  value: z.string().describe('The value to set for the attribute'),
});
export type SetAttrCommand = z.infer<typeof SetAttrCommandSchema>;

// Undo Command (Placeholder - actual logic in engine)
export const UndoCommandSchema = BaseAICommandSchema.extend({
  type: z.literal('undo'),
  // Undo might target a specific command ID or just the last action
  targetCommandId: z.string().uuid().optional().describe('Optional ID of the command to undo'),
   // Undo commands typically don't need a selector directly
   selector: z.undefined().optional(),
});
export type UndoCommand = z.infer<typeof UndoCommandSchema>;


// --- Recursive Union Schema Definition ---
// Define the lazy schema first to handle the recursion needed by BatchCommand.
// We need to forward-declare BatchCommandSchema conceptually for the union.
const AICommandSchemaRecursive: z.ZodLazy<z.ZodDiscriminatedUnion<'type', any>> = z.lazy(() =>
  z.discriminatedUnion('type', [
    ClickCommandSchema,
    FillCommandSchema,
    SetAttrCommandSchema,
    BatchCommandSchema, // Reference the BatchCommandSchema defined below
    UndoCommandSchema,
    // Add other command schemas here if needed
  ])
);


// --- Batch Command Schema (Uses the Recursive Definition) ---
export const BatchCommandSchema = BaseAICommandSchema.extend({
    type: z.literal('batch'),
    // Use the lazy recursive schema definition here
    commands: z.array(AICommandSchemaRecursive).describe('An array of commands to execute atomically'),
    // Batch commands typically don't need a selector directly
    selector: z.undefined().optional(),
});


// --- Export Final Schemas and Types ---
export const AICommandSchema = AICommandSchemaRecursive; // Export the lazy schema as the main one

// Infer types after all schemas are defined
export type BatchCommand = z.infer<typeof BatchCommandSchema>;
export type AICommand = z.infer<typeof AICommandSchema>;


// --- Placeholder for Command Execution Logic (if needed here) ---
// This might live entirely within the engine or have specific handlers here.
// For now, we focus on definitions.

// Example Usage (for validation demonstration)
// const exampleCommand: AICommand = { type: 'click', selector: '#myButton' };
// const validationResult = AICommandSchema.safeParse(exampleCommand);
// if (validationResult.success) {
//   console.log('Valid command:', validationResult.data);
// } else {
//   console.error('Invalid command:', validationResult.error);
// }