# Plan to Scaffold `@page-ai/scanner` Package

This document outlines the steps to create the initial scaffolding for the new `@page-ai/scanner` package within the `page-ai` monorepo.

## 1. Create Package Directory Structure
The `write_to_file` tool will automatically create `packages/scanner` and `packages/scanner/src` when writing files into them.

## 2. Create `packages/scanner/package.json`
*   Path: `packages/scanner/package.json`
*   Content:
    ```json
    {
      "name": "@page-ai/scanner",
      "version": "0.0.0",
      "description": "Client-side library to scan and identify interactive UI elements in a live DOM.",
      "main": "./dist/index.js",
      "module": "./dist/index.module.js",
      "types": "./dist/index.d.ts",
      "exports": {
        ".": {
          "import": "./dist/index.module.js",
          "require": "./dist/index.js",
          "types": "./dist/index.d.ts"
        }
      },
      "files": [
        "dist"
      ],
      "scripts": {
        "build": "echo \"Error: build script not yet defined for @page-ai/scanner\" && exit 1"
      },
      "dependencies": {
        "@page-ai/core": "0.0.0"
      },
      "license": "MIT",
      "publishConfig": {
        "access": "public"
      }
    }
    ```

## 3. Create `packages/scanner/tsconfig.build.json`
*   Path: `packages/scanner/tsconfig.build.json`
*   Content (copied and adjusted from `packages/dom/tsconfig.build.json`):
    ```json
    {
      "extends": "../../tsconfig.json",
      "compilerOptions": {
        "outDir": "./dist",
        "declarationDir": "./dist",
        "noEmit": false,
        "lib": ["esnext", "dom", "dom.iterable"]
      },
      "include": ["src/**/*"],
      "exclude": [
        "node_modules",
        "dist",
        "src/**/*.test.ts",
        "src/**/*.test.tsx"
      ]
    }
    ```

## 4. Create `packages/scanner/src/index.ts`
*   Path: `packages/scanner/src/index.ts`
*   Content: (empty file)
    ```typescript

    ```

## 5. Create `packages/scanner/README.md`
*   Path: `packages/scanner/README.md`
*   Content:
    ```markdown
    # @page-ai/scanner

    Scans the DOM for interactive elements.
    ```

## 6. Update Root `package.json`
*   Modify the `scripts.build` entry.
*   The current script is: `"build": "cd packages/core && bun run build && cd ../dom && bun run build && cd ../react && bun run build && cd ../.."`
*   The updated script will be: `"build": "cd packages/core && bun run build && cd ../dom && bun run build && cd ../react && bun run build && cd ../scanner && bun run build && cd ../.."`

## 7. Update Root `jest.config.js`
*   Add a new project configuration to the `projects` array.
*   The new entry will be:
    ```javascript
    {
      displayName: 'scanner',
      preset: 'ts-jest',
      rootDir: '<rootDir>/packages/scanner',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@page-ai/core$': '<rootDir>/../core/src/index.ts',
        '^@page-ai/scanner$': '<rootDir>/src/index.ts',
      },
      testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
    }
    ```
*   This will be inserted before the closing `]` of the `projects` array.

## 8. Run `bun install`
*   Execute the command `bun install` in the root directory (`/Users/salvatorenoto/Developer/Packages/pages-ai`).

## Mermaid Diagram of New Package Structure and Changes

```mermaid
graph TD
    subgraph Monorepo Root
        direction LR
        RootPkgJson["package.json (updated build script)"]
        RootJestConfig["jest.config.js (add scanner project)"]
        BunLock["bun.lock (updated by bun install)"]
    end

    subgraph "packages/"
        direction TB
        Core["core (existing)"]
        Dom["dom (existing)"]
        ReactPkg["react (existing)"]
        Scanner["@page-ai/scanner (new)"]
    end

    subgraph "@page-ai/scanner"
        direction TB
        ScannerPkgJson["package.json"]
        ScannerTsconfig["tsconfig.build.json"]
        ScannerReadme["README.md"]
        ScannerSrc["src/"]
        ScannerSrc --> ScannerIndexTs["index.ts (empty)"]
    end

    RootPkgJson -.-> Scanner;
    RootJestConfig -.-> Scanner;
    BunLock -.-> Scanner;


    style Scanner fill:#ccffcc,stroke:#333,stroke-width:2px
    style ScannerPkgJson fill:#ccffcc,stroke:#333,stroke-width:1px
    style ScannerTsconfig fill:#ccffcc,stroke:#333,stroke-width:1px
    style ScannerReadme fill:#ccffcc,stroke:#333,stroke-width:1px
    style ScannerSrc fill:#ccffcc,stroke:#333,stroke-width:1px
    style ScannerIndexTs fill:#ccffcc,stroke:#333,stroke-width:1px

    style RootPkgJson fill:#lightblue,stroke:#333,stroke-width:1px
    style RootJestConfig fill:#lightblue,stroke:#333,stroke-width:1px
    style BunLock fill:#lightgrey,stroke:#333,stroke-width:1px