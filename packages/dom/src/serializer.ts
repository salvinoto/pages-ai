import domjson from 'domjson';

// Define a type for the snapshot. Using 'any' for now as domJSON's specific type isn't readily available.
// We can refine this later if needed.
export type DomSnapshot = any; 

/**
 * Serializes a DOM node and its descendants into a JSON representation.
 * @param node The root DOM node to serialize.
 * @returns The JSON representation of the DOM node.
 */
export function serializeNode(node: Node): DomSnapshot {
  if (!(node instanceof Element || node instanceof Document || node instanceof DocumentFragment)) {
    console.warn('serializeNode expects an Element, Document, or DocumentFragment. Received:', node);
    // Handle non-element nodes appropriately, maybe return null or a specific structure
    return null; 
  }
  // domJSON might require specific options, using defaults for now.
  return domjson.toJSON(node);
}