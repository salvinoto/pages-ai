// packages/dom/src/handlers.ts
import type {
  ClickCommand,
  FillCommand,
  SetAttrCommand,
} from '@page-ai/core';

/**
 * Finds an element based on a selector, throwing an error if not found.
 * @param selector - The CSS selector for the element.
 * @returns The found HTMLElement.
 * @throws Error if the element is not found.
 */
function findElementOrThrow(selector: string): HTMLElement {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  // Basic check, might need refinement for different element types
  if (!(element instanceof HTMLElement)) {
     throw new Error(`Selected element is not an HTMLElement: ${selector}`);
  }
  return element;
}

/**
 * Handles the execution of a 'click' command.
 * @param command - The click command details.
 */
export async function handleClick(command: ClickCommand): Promise<void> {
  try {
    const element = findElementOrThrow(command.selector);
    element.click();
    console.log(`Clicked element: ${command.selector}`);
  } catch (error) {
    console.error(`Error executing click command for selector "${command.selector}":`, error);
    // Re-throw or handle as appropriate for the application context
    throw error;
  }
}

/**
 * Handles the execution of a 'fill' command.
 * @param command - The fill command details.
 */
export async function handleFill(command: FillCommand): Promise<void> {
   try {
    const element = findElementOrThrow(command.selector);

    // Check if the element is an input or textarea
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = command.value;
      // Dispatch events to simulate user input
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      console.log(`Filled element ${command.selector} with value: ${command.value}`);
    } else {
      throw new Error(`Element is not an input or textarea: ${command.selector}`);
    }
  } catch (error) {
    console.error(`Error executing fill command for selector "${command.selector}":`, error);
    throw error;
  }
}

/**
 * Handles the execution of a 'setAttr' command.
 * @param command - The set attribute command details.
 */
export async function handleSetAttr(command: SetAttrCommand): Promise<void> {
   try {
    const element = findElementOrThrow(command.selector);
    element.setAttribute(command.attribute, command.value);
    console.log(`Set attribute '${command.attribute}' to '${command.value}' for element: ${command.selector}`);
  } catch (error) {
    console.error(`Error executing setAttr command for selector "${command.selector}":`, error);
    throw error;
  }
}