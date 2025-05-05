// Declare the module 'domjson' to satisfy TypeScript
// This provides a basic type definition, assuming the module exports a default object.
// We can refine this later if we know more about the module's structure.
declare module 'domjson' {
  const domjson: any; // Assuming a default export of type 'any'
  export default domjson;
}