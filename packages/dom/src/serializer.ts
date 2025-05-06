// Define a more specific type for our custom snapshot
export interface DomSnapshotNode {
  nodeType: number;
  tagName?: string; // For Element nodes
  attributes?: { [key: string]: string }; // For Element nodes
  content?: string; // For Text nodes
  childNodes?: DomSnapshotNode[]; // For Element, Document, DocumentFragment
}

// Use the specific node type or null for the overall snapshot
export type DomSnapshot = DomSnapshotNode | null;

/**
 * Recursively serializes a DOM node into a custom JSON structure,
 * ensuring SSR safety by avoiding browser-specific APIs.
 * @param node The DOM node to serialize.
 * @returns The custom JSON representation of the DOM node, or null if unsupported.
 */
function customSerializeNode(node: Node): DomSnapshotNode | null {
  if (!node) {
    return null;
  }

  const snapshot: Partial<DomSnapshotNode> = {
    nodeType: node.nodeType,
  };

  switch (node.nodeType) {
    case Node.ELEMENT_NODE: {
      const element = node as Element;
      snapshot.tagName = element.tagName.toLowerCase();
      snapshot.attributes = {};
      // Safely iterate attributes
      if (element.attributes) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          // Add check for attr to satisfy TS
          if (attr) {
            snapshot.attributes[attr.name] = attr.value;
          }
        }
      }
      snapshot.childNodes = [];
      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const childNode = node.childNodes[i];
          // Add check for childNode to satisfy TS
          if (childNode) {
            const childSnapshot = customSerializeNode(childNode);
            if (childSnapshot) {
              snapshot.childNodes.push(childSnapshot);
            }
          }
        }
      }
      break; // Added missing break
    }
    case Node.TEXT_NODE: {
      snapshot.content = node.nodeValue ?? '';
      break; // Added missing break
    }
    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE: {
      snapshot.childNodes = [];
      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const childNode = node.childNodes[i];
           // Add check for childNode to satisfy TS
          if (childNode) {
            const childSnapshot = customSerializeNode(childNode);
            if (childSnapshot) {
              snapshot.childNodes.push(childSnapshot);
            }
          }
        }
      }
      break; // Added missing break
    }
    // Ignore other node types like comments, processing instructions, etc.
    default:
      // Return null for unsupported node types to satisfy TS return type
      return null;
  }

  // Ensure all paths return a value or null
  return snapshot as DomSnapshotNode;
}


/**
 * Serializes a DOM node and its descendants into a JSON representation
 * using a custom, SSR-safe serializer.
 * @param node The root DOM node to serialize (Element, Document, or DocumentFragment).
 * @returns The JSON representation of the DOM node.
 */
export function serializeNode(node: Node): DomSnapshot {
  if (!(node instanceof Element || node instanceof Document || node instanceof DocumentFragment)) {
    console.warn('serializeNode expects an Element, Document, or DocumentFragment. Received:', node);
    return null;
  }
  // Use the custom serializer
  return customSerializeNode(node);
}