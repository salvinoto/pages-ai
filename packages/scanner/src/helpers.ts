/**
 * Checks if a selector is unique enough in the document.
 * A more robust check might involve querying the document, but this is a basic heuristic.
 */
function isSelectorUnique(element: HTMLElement, selector: string): boolean {
  if (!element.ownerDocument) return true; // Cannot check without a document
  try {
    const elements = element.ownerDocument.querySelectorAll(selector);
    return elements.length === 1 && elements[0] === element;
  } catch (e) {
    // Invalid selector, so not unique in a usable way
    return false;
  }
}

/**
 * Generates a CSS selector for a given HTML element.
 * Prioritizes ID, then stable attributes, then class names, then path.
 */
export function generateCssSelector(element: HTMLElement): string {
  if (!element || !(element instanceof Element)) {
    return '';
  }

  // 1. Use ID if available and reasonably unique
  if (element.id) {
    const idSelector = `#${CSS.escape(element.id)}`;
    // A simple check: if the ID selector returns the element itself, assume it's good enough.
    // A more robust check would ensure it's truly unique in the whole document.
    if (element.ownerDocument && element.ownerDocument.querySelector(idSelector) === element) {
      return idSelector;
    }
  }

  const tagName = element.tagName.toLowerCase();
  let selector = tagName;

  // 2. Use `name` attribute if present (common for form elements)
  const nameAttr = element.getAttribute('name');
  if (nameAttr) {
    const nameSelector = `${tagName}[name="${CSS.escape(nameAttr)}"]`;
    if (isSelectorUnique(element, nameSelector)) {
      return nameSelector;
    }
  }
  
  // 3. Use `type` attribute for inputs if present
  if (tagName === 'input') {
    const typeAttr = element.getAttribute('type');
    if (typeAttr) {
      const typeSelector = `${tagName}[type="${CSS.escape(typeAttr)}"]`;
      if (nameAttr) {
        const nameAndTypeSelector = `${tagName}[name="${CSS.escape(nameAttr)}"][type="${CSS.escape(typeAttr)}"]`;
        if (isSelectorUnique(element, nameAndTypeSelector)) {
          return nameAndTypeSelector;
        }
      }
      if (isSelectorUnique(element, typeSelector)) {
        // Fallback to just type if name+type wasn't unique or name didn't exist
      }
    }
  }


  // 4. Path-based selector (simplified)
  // This is a very basic path builder. More robust solutions exist.
  let path = '';
  let currentElement: Element | null = element;
  const MAX_PATH_DEPTH = 5; // Limit depth to avoid overly long selectors
  let depth = 0;

  while (currentElement && currentElement.parentElement && currentElement !== element.ownerDocument?.body && depth < MAX_PATH_DEPTH) {
    const parent: HTMLElement = currentElement.parentElement;
    const siblings: Element[] = Array.from(parent.children);
    const ownTag = currentElement.tagName.toLowerCase();
    const siblingsOfSameTag = siblings.filter(
      (sibling: Element) => sibling.tagName.toLowerCase() === ownTag
    );

    let segment = ownTag;
    if (siblingsOfSameTag.length > 1) {
      const index = siblingsOfSameTag.indexOf(currentElement as HTMLElement) + 1;
      segment += `:nth-of-type(${index})`;
    }
    
    path = path ? `${segment} > ${path}` : segment;

    // If parent has an ID, we can stop and use that as an anchor
    if (parent.id) {
      const parentIdSelector = `#${CSS.escape(parent.id)} > ${path}`;
      if (isSelectorUnique(element, parentIdSelector)) {
        return parentIdSelector;
      }
    }
    
    currentElement = parent;
    depth++;
  }

  if (path && isSelectorUnique(element, path)) {
    return path;
  }
  
  // Fallback to simple tag name if nothing else worked, or if path is too generic
  // This is likely not unique but better than nothing.
  // A more robust solution would use a combination of classes, attributes, etc.
  // For now, if the path-based selector isn't unique, we return the most specific part of it
  // or just the tag name.
  
  // If the path starts with body and is still not unique, it's probably not great.
  // Let's try a more direct approach with classes if available.
  const classes = Array.from(element.classList)
    .filter(cls => !/^[0-9]/.test(cls)) // Avoid classes starting with numbers if they cause issues
    .map(cls => `.${CSS.escape(cls)}`)
    .join('');
  
  if (classes) {
    const classSelector = tagName + classes;
    if (isSelectorUnique(element, classSelector)) {
      return classSelector;
    }
  }

  // Final fallback: tag name with nth-of-type relative to body if it's a direct child
  if (element.parentElement === element.ownerDocument.body) {
    const siblings = Array.from(element.ownerDocument.body.children);
    const ownTag = element.tagName.toLowerCase();
    const siblingsOfSameTag = siblings.filter(
      (sibling) => sibling.tagName.toLowerCase() === ownTag
    );
    if (siblingsOfSameTag.length > 1) {
      const index = siblingsOfSameTag.indexOf(element as HTMLElement) + 1;
      return `body > ${ownTag}:nth-of-type(${index})`;
    }
    return `body > ${ownTag}`;
  }
  
  // If all else fails, return the tag name. This is unlikely to be unique.
  return tagName;
}

/**
 * Finds the text content of associated <label> elements.
 */
export function findLabelText(element: HTMLElement): string | null {
  const doc = element.ownerDocument;
  let labelText: string | null = null;

  // 1. Check for label with `for` attribute matching element's ID
  if (element.id) {
    const labels = doc.querySelectorAll<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`);
    if (labels.length > 0) {
      labelText = Array.from(labels).map(l => l.textContent?.trim()).filter(Boolean).join(' ');
      if (labelText) return labelText;
    }
  }

  // 2. Check if the element is a descendant of a label
  const parentLabel = element.closest('label');
  if (parentLabel) {
    // Ensure the label isn't for a different control if it has a 'for' attribute
    const htmlFor = parentLabel.getAttribute('for');
    if (!htmlFor || (element.id && htmlFor === element.id) || (!element.id && !htmlFor) ) {
       labelText = parentLabel.textContent?.trim() || null;
       // Avoid using text from child labels of this parentLabel if element is also a label
       if (labelText && element.tagName.toLowerCase() === 'label') {
           const childLabelText = Array.from(element.querySelectorAll('label')).map(cl => cl.textContent?.trim()).filter(Boolean).join(' ');
           if (childLabelText && labelText.includes(childLabelText)) {
               // This is tricky, trying to get the most relevant part
           }
       }
       if (labelText) return labelText;
    }
  }
  
  // 3. Check if a label is a descendant of the element (less common)
  // This is usually for elements that wrap their own label text, like some custom components.
  // We should be careful not to just grab all text content if the element itself is the label.
  if (element.tagName.toLowerCase() !== 'label') {
    const childLabels = element.querySelectorAll<HTMLLabelElement>('label');
    if (childLabels.length > 0) {
        // Only consider child labels that don't have a 'for' attribute or whose 'for' matches a child of the current element, not the element itself.
        // This is to avoid double-counting if a label inside is for an input also inside.
        const relevantChildLabelTexts = Array.from(childLabels)
            .filter(cl => {
                const htmlFor = cl.getAttribute('for');
                if (!htmlFor) return true; // No 'for', could be implicitly associated
                // If 'for' exists, it should not point to the current element itself,
                // unless the current element is a container for that labeled element.
                // This logic is complex; for now, we'll be conservative.
                return !element.id || htmlFor !== element.id;
            })
            .map(l => l.textContent?.trim())
            .filter(Boolean);

        if (relevantChildLabelTexts.length > 0) {
            labelText = relevantChildLabelTexts.join(' ');
            if (labelText) return labelText;
        }
    }
  }


  return labelText || null;
}

/**
 * Resolves a list of ID references to their concatenated text content.
 */
export function resolveIdRefsToText(idRefs: string | null, doc: Document): string | null {
  if (!idRefs) return null;
  const ids = idRefs.split(/\s+/).filter(Boolean);
  if (ids.length === 0) return null;

  const texts = ids.map(id => {
    const refElement = doc.getElementById(id);
    return refElement?.textContent?.trim() || '';
  }).filter(Boolean);

  return texts.length > 0 ? texts.join(' ') : null;
}


/**
 * Computes the accessible name for an element based on ARIA and HTML specifications.
 * Order:
 * 1. aria-labelledby
 * 2. aria-label
 * 3. Associated <label> text
 * 4. Element's own textContent (if appropriate for the role)
 * 5. title attribute
 */
export function computeAccessibleName(element: HTMLElement, labelText: string | null): string | null {
  const doc = element.ownerDocument;

  // 1. aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const resolvedLabelledBy = resolveIdRefsToText(ariaLabelledBy, doc);
    if (resolvedLabelledBy) return resolvedLabelledBy;
  }

  // 2. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim();
  }

  // 3. Associated <label> text (already found and passed in)
  if (labelText && labelText.trim()) {
    return labelText.trim();
  }

  // 4. Element's own textContent (if appropriate for the role/tag)
  // Heuristic: buttons, links, menuitems, etc., often use their text content.
  // Inputs, textareas, selects usually don't.
  const role = element.getAttribute('role')?.toLowerCase();
  const tagName = element.tagName.toLowerCase();
  const appropriateTagsForTextContent = ['button', 'a', 'summary', 'legend', 'caption']; // Add more as needed
  const appropriateRolesForTextContent = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio', 'option', 'treeitem']; // Add more as needed

  if (
    appropriateTagsForTextContent.includes(tagName) ||
    (role && appropriateRolesForTextContent.includes(role))
  ) {
    // Get text content, excluding content of children that might have their own labels (e.g. nested interactive elements)
    // This is a simplified approach. True accessible name computation is more complex.
    let ownText = "";
    const childNodes = Array.from(element.childNodes);
    for (const child of childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            ownText += child.textContent?.trim() || "";
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            // For elements, only include if they are not interactive themselves or are simple formatting tags
            const childElement = child as HTMLElement;
            if (!childElement.hasAttribute('aria-label') && !childElement.hasAttribute('aria-labelledby') && !childElement.closest('button,a,input,select,textarea,[role="button"],[role="link"]')) {
                 // Heuristic: try to get text from non-interactive children
                 // This is still very basic.
                 // ownText += childElement.textContent?.trim() || "";
            }
        }
    }
    ownText = ownText.trim() || element.textContent?.trim() || ""; // Fallback to full textContent if specific node traversal yields nothing

    if (ownText) {
      return ownText;
    }
  }

  // 5. title attribute
  const title = element.getAttribute('title');
  if (title && title.trim()) {
    return title.trim();
  }

  return null;
}

/**
 * Gets the current value of an interactive element.
 */
export function getCurrentValue(element: HTMLElement): string | null {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'input') {
    const inputElement = element as HTMLInputElement;
    const type = inputElement.type.toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      return inputElement.checked ? inputElement.value || 'on' : null; // Return value if checked, else null
    }
    return inputElement.value;
  }

  if (tagName === 'textarea') {
    return (element as HTMLTextAreaElement).value;
  }

  if (tagName === 'select') {
    const selectElement = element as HTMLSelectElement;
    if (selectElement.multiple) {
      return Array.from(selectElement.selectedOptions).map(opt => opt.value).join(', ');
    }
    return selectElement.value;
  }
  
  // For contenteditable elements, their "value" is their text content or innerHTML
  if (element.isContentEditable) {
    return element.textContent; // or element.innerHTML depending on desired format
  }

  return null;
}