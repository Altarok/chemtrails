# Chemtrails
Chemtrails is a lightweight, zero-overhead Obsidian plugin that renders SMILES (Simplified Molecular Input Line Entry System) chemical notations into crisp, responsive vector SVG diagrams natively within your notes.

The plugin acts as a bridge from ['smilesDrawer' of the reymond-group](https://github.com/reymond-group/smilesDrawer) to Obsidian.

Please read their original paper published by the Journal of Chemical Information and Modeling:
[10.1021/acs.jcim.7b00425](https://pubs.acs.org/doi/10.1021/acs.jcim.7b00425)

For a full documentation on how your molecules get drawn, read [their README.md](https://github.com/reymond-group/smilesDrawer/blob/master/README.md). 

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
- Chemtrails in the Obsidian Community Plugins directory.
- Install and Enable.
## Manual Installation
- Download main.js, manifest.json, and styles.css from the latest release.
- Move the files into your vault's plugin directory: <vault>/.obsidian/plugins/chemtrails/
- Reload Obsidian plugins and toggle Chemtrails on.

# Changelog
0.1.0: Make it work

# Roadmap
- Let you decide how to name your code blocks to prevent multiple plugins searching for `smiles`.
- Add optional parameters in your code blocks to match [the original 'smilesDrawer' options](https://github.com/reymond-group/smilesDrawer/blob/master/README.md#options) parameters.
- Add settings for all of those parameters.
