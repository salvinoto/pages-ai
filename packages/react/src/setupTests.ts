console.log('--- REACT setupTests.ts EXECUTING ---');
console.log('typeof document in react/setupTests.ts:', typeof document);
if (typeof document !== 'undefined') {
  console.log('document.body (react/setupTests.ts):', document.body ? 'exists' : 'null');
} else {
  console.log('document is undefined in react/setupTests.ts');
}
console.log('--- END REACT setupTests.ts LOG ---');
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';