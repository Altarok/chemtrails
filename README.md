# Chemtrails
Chemtrails is a lightweight, zero-overhead Obsidian plugin that renders SMILES (Simplified Molecular Input Line Entry System) chemical notations into crisp, responsive vector SVG diagrams natively within your notes.
## Features
- **Native SVG Rendering**: Renders vector paths directly inside your notes using `smiles`—no external image generation servers or APIs required.
- **Dynamic ViewBox Framework**: Automatically crops empty whitespace around molecules. Small molecules (like Methane) remain naturally small, while large structures (like Caffeine) scale down smoothly to fit your active pane width.
- **Obsidian Theme Integration**: Integrates cleanly with default light and dark themes using secondary background color matching.
## Usage
Simply wrap any standard SMILES string inside a `smiles` Markdown code block:

````
```smiles
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
```
````

# Installation
## Community Marketplace
Once approved, search for Chemtrails in the Obsidian Community Plugins directory and click Install and Enable.
## Manual Installation
Download main.js, manifest.json, and styles.css from the latest release.
- Move the files into your vault's plugin directory: <vault>/.obsidian/plugins/chemtrails/

Reload Obsidian plugins and toggle Chemtrails on.

# Changelog
0.1.0: Make it work

# Roadmap
- Add an optional configuration parameter height:[pos integer (>=100)] directly inside the code block to manually override vertical canvas scale constraints for dense polycyclic structures.
- Let you decide how to name your code blocks.
