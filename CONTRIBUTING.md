# Contributing to Chemtrails
Thank you for your interest in improving Chemtrails! Because this plugin is designed to be a lean, high-performance bridge (under 100 lines of source code), we optimize for code readability, tight dependencies, and minimal project configuration clutter.
## Project Architecture Overview
The plugin structure relies on a minimalist development stack:
- **`src/main.ts`**: Contains the complete lifecycle code and code-block registration logic.
- **`src/declarations.d.ts`**: Safely abstracts third-party external signatures without `any` overrides.
- **`esbuild.config.mjs`**: The compilation engine. Handles development bundling and production tree-shaking.
## Local Development Workflow
### 1. Environment Setup
Clone the repository directly into a test vault's plugin path and install the baseline developer utilities:

```bash
cd your-test-vault/.obsidian/plugins/
git clone https://github.com/Altarok/chemtrails.git
cd chemtrails
npm install
```

### 2. Development Scripts
Watch/Dev Mode: Recompiles your changes instantly as you edit the source files:
```bash
npm run dev
```

Code Quality Check: Runs the modern ESLint type validation suite:
```bash
npm run lint
````

Production Build: Generates optimized distribution bundles:
```bash
npm run build
```

# Submission Guidelines
- Keep it Lean: Avoid adding new third-party npm runtime dependencies unless strictly necessary for core parsing operations.
- Strict Typing: Ensure all internal code updates comply with the @typescript-eslint rules. Do not re-introduce explicit any tokens into the source code or declaration bindings.
- Format Consistency: Match your CSS enhancements directly to standard Obsidian CSS custom properties (var(--background-secondary), etc.) to protect cross-theme compatibility.
