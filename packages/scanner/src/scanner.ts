import { InteractiveElement } from './types';
import {
  generateCssSelector,
  findLabelText,
  computeAccessibleName,
  getCurrentValue,
  // resolveIdRefsToText, // Not directly used here, but by computeAccessibleName
} from './helpers';

const INTERACTIVE_TAGS = new Set([
  'input',
  'button',
  'select',
  'textarea',
  'a',
]);

const INTERACTIVE_ARIA_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'menuitem',
  'slider',
  'spinbutton',
  'combobox',
  'listbox',
  'tab',
  'treeitem',
  // Add more roles as needed based on ARIA specs
]);

// Placeholder for event handler attributes
const EVENT_HANDLER_ATTRIBUTES = new Set([
  'onclick',
  'onmousedown',
  'onmouseup',
  'onkeydown',
  'onkeyup',
  'onkeypress',
  'onsubmit',
  'onfocus',
  'onblur',
  'onchange',
  'ondblclick',
  // Add more common event handlers
]);

let elementCounter = 0;

/**
 * Generates a unique ID for an element during a scan session.
 */
function generateElementId(): string {
  elementCounter += 1;
  return `el-${elementCounter}`;
}

/**
 * Checks if an element is focusable.
 * This is a simplified check. A more robust check would involve
 * checking tabindex, visibility, and disabled state.
 */
function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) {
    return false;
  }
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex && parseInt(tabIndex, 10) < 0) {
    return false;
  }
  // Basic check for visibility (not comprehensive)
  return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
}


/**
 * Scans the DOM from a root element to find interactive elements.
 * @param rootElement The HTMLElement or Document to start scanning from.
 * @returns An array of InteractiveElement objects.
 */
export function scanInteractiveElements(
  rootElement: HTMLElement | Document,
): InteractiveElement[] {
  const results: InteractiveElement[] = [];
  elementCounter = 0; // Reset counter for each scan

  function traverse(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      // 4. Opt-Out Mechanism
      if (element.hasAttribute('data-ai-hide') && element.getAttribute('data-ai-hide') !== 'false') {
        return; // Skip this element and its descendants
      }

      const isInteractiveBy: string[] = [];
      const elementType = element.tagName.toLowerCase();

      // 2. Element Identification
      // Tag name check
      if (INTERACTIVE_TAGS.has(elementType)) {
        if (elementType === 'a' && element.hasAttribute('href')) {
          isInteractiveBy.push(`tag:a[href]`);
        } else if (elementType !== 'a') {
          isInteractiveBy.push(`tag:${elementType}`);
        }
      }

      // ARIA role check
      const role = element.getAttribute('role');
      if (role && INTERACTIVE_ARIA_ROLES.has(role.toLowerCase())) {
        isInteractiveBy.push(`aria-role:${role.toLowerCase()}`);
      }

      // Event handler check
      EVENT_HANDLER_ATTRIBUTES.forEach(attr => {
        if (element.hasAttribute(attr)) {
          isInteractiveBy.push(`event:${attr}`);
        }
      });
      
      // Check for contenteditable attribute
      if (element.isContentEditable) {
        isInteractiveBy.push('attr:contenteditable');
      }

      // Focusable check (add as a reason if not already covered by specific tags/roles)
      // This is a general catch-all. Specific interactive elements are usually focusable by default.
      // We add this reason if other more specific reasons aren't present but it IS focusable.
      if (isInteractiveBy.length === 0 && isFocusable(element)) {
         // Only add 'focusable' if no other reasons found yet, to avoid redundancy
         // and to highlight elements that are interactive *primarily* because they are focusable
         // (e.g. a div with tabindex="0" and a click listener added via JS not as an attribute)
        if (element.tabIndex >= 0) { // Ensure it's explicitly focusable or naturally focusable
            isInteractiveBy.push('focusable');
        }
      }


      if (isInteractiveBy.length > 0) {
        const selector = generateCssSelector(element);
        const labelText = findLabelText(element);
        const accessibleName = computeAccessibleName(element, labelText);
        const currentValue = getCurrentValue(element);
        const href = elementType === 'a' ? (element as HTMLAnchorElement).href : null; // Absolute URL

        const interactiveElement: InteractiveElement = {
          id: generateElementId(),
          selector,
          elementType,
          elementId: element.id || null,
          elementName: element.getAttribute('name'), // More general way to get 'name'
          currentValue,
          href,
          placeholder: element.getAttribute('placeholder'), // More general
          labelText,
          ariaLabel: element.getAttribute('aria-label'),
          ariaLabelledBy: element.getAttribute('aria-labelledby'), // Store the raw ID string
          ariaDescribedBy: element.getAttribute('aria-describedby'), // Store the raw ID string
          accessibleName,
          textContent: element.textContent?.trim() || null,
          role: role || null,
          isInteractiveBy,
        };
        results.push(interactiveElement);
      }
    }

    // Ensure rootElement itself is processed if it's an Element
    if (rootElement.nodeType === Node.ELEMENT_NODE && rootElement === node) {
        // Already processed by the initial call to traverse(rootElement)
        // So, just iterate over children if it's the root and an element
         rootElement.childNodes.forEach(traverse);
    } else if (rootElement.nodeType === Node.DOCUMENT_NODE && rootElement === node) {
        // If root is Document, start traversal from documentElement
        if ((rootElement as Document).documentElement) {
            traverse((rootElement as Document).documentElement);
        }
    } else {
        // For other child nodes
        node.childNodes.forEach(traverse);
    }
  }

  if (rootElement.nodeType === Node.DOCUMENT_NODE) {
    // Start traversal from document.body or document.documentElement if body is not available
    const doc = rootElement as Document;
    const body = doc.body || doc.documentElement;
    if (body) {
        traverse(body);
    }
  } else {
      traverse(rootElement); // If rootElement is an HTMLElement
  }
  return results;
}