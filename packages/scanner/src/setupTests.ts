console.log('--- SCANNER setupTests.ts EXECUTING ---');
console.log('typeof document in scanner/setupTests.ts:', typeof document);
if (typeof document !== 'undefined') {
  console.log('document.body (scanner/setupTests.ts):', document.body ? 'exists' : 'null');
} else {
  console.log('document is undefined in scanner/setupTests.ts');
}
console.log('--- END SCANNER setupTests.ts LOG ---');
// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Polyfill for CSS.escape for JSDOM environment
if (typeof CSS === 'undefined' || typeof CSS.escape !== 'function') {
  // @ts-ignore
  global.CSS = {
    escape: function(value: string): string { // Changed to a traditional function
      if (value === undefined) { // Check if value is undefined instead of arguments.length
        throw new TypeError('`CSS.escape` requires an argument.');
      }
      const string = String(value);
      const length = string.length;
      let index = -1;
      let codeUnit;
      let result = '';
      const firstCodeUnit = string.charCodeAt(0);
      // eslint-disable-next-line no-control-regex
      const isHexDigit = (char: string) => /[0-9a-fA-F]/.test(char);

      while (++index < length) {
        codeUnit = string.charCodeAt(index);
        // HTML PCDATA character
        if (codeUnit === 0x0000) {
          result += '\uFFFD';
        } else if (
          (codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit === 0x007F ||
          (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
          (index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002D)
        ) {
          result += '\\' + codeUnit.toString(16) + ' ';
        } else if (
          index === 0 && length === 1 && codeUnit === 0x002D
        ) {
          result += '\\' + string.charAt(index);
        } else if (
          codeUnit >= 0x0080 ||
          codeUnit === 0x002D ||
          codeUnit === 0x005F ||
          (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
          (codeUnit >= 0x0041 && codeUnit <= 0x005A) ||
          (codeUnit >= 0x0061 && codeUnit <= 0x007A)
        ) {
          result += string.charAt(index);
        } else {
          result += '\\' + string.charAt(index);
        }
      }
      return result;
    },
  };
}