/**
 * @module selector
 * Defines a restricted Domain Specific Language (DSL) for CSS-like selectors
 * and provides validation functions to ensure safety against injection attacks.
 *
 * Allowed Grammar:
 * - ID: `#elementId` (alphanumeric, hyphen, underscore)
 * - Class: `.className` (alphanumeric, hyphen, underscore)
 * - Attribute: `[attributeName]` or `[attributeName="value"]` or `[attributeName='value']`
 *   - Attribute names: alphanumeric, hyphen, underscore
 *   - Attribute values: Can be quoted (single or double) or unquoted (if simple).
 *     Quoted values can contain most characters except the quote type used.
 *     Unquoted values are restricted (e.g., alphanumeric, hyphen, underscore).
 * - Combinations: Simple combinations like `#id.class[attr]` are allowed, but complex
 *   combinators (>, +, ~), pseudo-classes (:hover), or pseudo-elements (::before) are NOT allowed.
 * - Whitespace: Leading/trailing whitespace is ignored. Whitespace between simple selectors is NOT allowed.
 */

// Regular expression to validate the restricted selector format.
// Breakdown:
// ^\s*                     - Start, optional leading whitespace
// (                         - Start group for valid selector part
//   #[a-zA-Z0-9_-]+         - ID selector (# followed by allowed chars)
//   |                       - OR
//   \.[a-zA-Z0-9_-]+        - Class selector (. followed by allowed chars)
//   |                       - OR
//   \[                      - Attribute selector start ([)
//     [a-zA-Z0-9_-]+        - Attribute name
//     (?:                   - Optional non-capturing group for value part
//       =                   - Equals sign
//       (?:                 - Non-capturing group for value options
//         "[^"]*"           - Double-quoted value
//         |                 - OR
//         '[^']*'           - Single-quoted value
//         |                 - OR
//         [a-zA-Z0-9_-]+    - Unquoted simple value
//       )
//     )?                    - End optional value part
//   \]                      - Attribute selector end (])
// )+                        - End group for valid selector part, must occur one or more times
// \s*$                      - Optional trailing whitespace, End
export const ALLOWED_SELECTOR_REGEX = /^\s*((#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|\[[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[a-zA-Z0-9_-]+))?\])+)\s*$/;

/**
 * Validates if a given selector string conforms to the restricted DSL grammar.
 *
 * This function checks if the selector consists only of simple ID, class,
 * or attribute selectors, potentially chained together without complex combinators
 * or pseudo-classes/elements.
 *
 * @param selector - The selector string to validate.
 * @returns `true` if the selector is valid according to the restricted grammar, `false` otherwise.
 * @example
 * isValidSelector("#submit-button"); // true
 * isValidSelector(".user-profile"); // true
 * isValidSelector('[data-testid="login"]'); // true
 * isValidSelector('#main.content[role="article"]'); // true
 * isValidSelector("div > p"); // false (combinator not allowed)
 * isValidSelector("a:hover"); // false (pseudo-class not allowed)
 * isValidSelector("*"); // false (universal selector not allowed)
 * isValidSelector("input[type='text'], button"); // false (comma separation not allowed)
 */
export function isValidSelector(selector: string | undefined | null): boolean {
  if (!selector) {
    // Allow empty/null selectors as they might be optional in commands
    return true;
  }
  if (typeof selector !== 'string') {
    return false;
  }
  // Basic checks for potentially harmful characters or patterns not caught by regex
  if (selector.includes('>') || selector.includes('+') || selector.includes('~') || selector.includes(':') || selector.includes(',')) {
      return false;
  }
  // Check against the restrictive regex
  return ALLOWED_SELECTOR_REGEX.test(selector);
}

/**
 * Parses and validates a selector, throwing an error if invalid.
 *
 * @param selector - The selector string to parse and validate.
 * @returns The validated selector string.
 * @throws {Error} If the selector does not conform to the restricted grammar.
 */
export function parseAndValidateSelector(selector: string): string {
    if (!isValidSelector(selector)) {
        throw new Error(`Invalid selector provided: "${selector}". Only simple ID, class, and attribute selectors are allowed.`);
    }
    // Return the trimmed selector for consistency
    return selector.trim();
}

// Potential future enhancements:
// - A function to break down a valid selector into its components (e.g., { id: '...', classes: [...], attributes: [...] })