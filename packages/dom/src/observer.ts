// Define the structure for DOM patches
// This is a basic structure; we can refine it based on specific needs.
export type DomPatch =
  | { type: 'attributes'; target: string; attributeName: string | null; attributeNamespace: string | null; newValue: string | null; oldValue: string | null }
  | { type: 'childList'; target: string; addedNodes: Node[]; removedNodes: Node[] }
  | { type: 'characterData'; target: string; newValue: string | null; oldValue: string | null };

// Define the callback function type for subscribers
export type PatchCallback = (patches: DomPatch[]) => void;

/**
 * Observes a DOM node for mutations and generates patches.
 */
export class DomObserver {
  private observer: MutationObserver | null = null;
  private callback: PatchCallback;
  private targetNode: Node | null = null;

  constructor(callback: PatchCallback) {
    if (typeof MutationObserver === 'undefined') {
      // Handle environments where MutationObserver is not available (e.g., older browsers, non-browser envs)
      console.error('MutationObserver is not available in this environment.');
      // Potentially throw an error or provide a no-op implementation
      this.callback = () => {}; // No-op callback
      return;
    }
    this.callback = callback;
  }

  /**
   * Starts observing the specified node for mutations.
   * @param target The DOM node to observe.
   * @param options Optional MutationObserver options. Defaults to observing attributes, child list, and subtree character data.
   */
  observe(target: Node, options?: MutationObserverInit): void {
    if (!this.callback || this.observer) {
      // Already observing or no callback set
      this.disconnect(); // Stop previous observer if any
    }

    if (typeof MutationObserver === 'undefined') {
        console.warn('Cannot observe: MutationObserver is not available.');
        return;
    }


    this.targetNode = target;
    const observerOptions: MutationObserverInit = options || {
      attributes: true,
      attributeOldValue: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true, // Observe descendants as well
    };

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(this.targetNode, observerOptions);
  }

  /**
   * Stops observing mutations.
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.targetNode = null;
    }
  }

  /**
   * Handles mutation records from the MutationObserver and converts them to patches.
   * @param mutations List of mutation records.
   */
  private handleMutations(mutations: MutationRecord[]): void {
    const patches: DomPatch[] = [];

    // Simple unique identifier generation for nodes (replace with a robust method if needed)
    // This is crucial for identifying the target element in patches.
    // A more robust approach might involve adding unique IDs or using CSS selectors.
    const getNodeIdentifier = (node: Node): string => {
        // Basic example: use tagName and index, or a data attribute if available
        if (node instanceof Element) {
            return node.tagName + (node.id ? `#${node.id}` : ''); // Very basic
        }
        // Handle text nodes, etc. - needs a proper strategy
        return 'node-' + Math.random().toString(36).substring(2, 9); 
    };


    mutations.forEach((mutation) => {
      const targetId = getNodeIdentifier(mutation.target);

      switch (mutation.type) {
        case 'attributes':
          patches.push({
            type: 'attributes',
            target: targetId,
            attributeName: mutation.attributeName,
            attributeNamespace: mutation.attributeNamespace,
            newValue: (mutation.target as Element).getAttribute(mutation.attributeName!),
            oldValue: mutation.oldValue,
          });
          break;
        case 'childList':
          // Note: Converting NodeList to Array for easier handling
          patches.push({
            type: 'childList',
            target: targetId,
            addedNodes: Array.from(mutation.addedNodes),
            removedNodes: Array.from(mutation.removedNodes),
          });
          break;
        case 'characterData':
          patches.push({
            type: 'characterData',
            target: targetId, // Target for characterData is the Text node itself
            newValue: mutation.target.nodeValue,
            oldValue: mutation.oldValue,
          });
          break;
      }
    });

    if (patches.length > 0) {
      this.callback(patches);
    }
  }
}