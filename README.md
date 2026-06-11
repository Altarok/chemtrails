# Chemtrails
Chemtrails is a lightweight, zero-overhead Obsidian plugin that renders SMILES (Simplified Molecular Input Line Entry System) chemical notations into crisp, responsive vector SVG diagrams natively within your notes.

Huge credit goes to [smilesDrawer of the reymond-group](https://github.com/reymond-group/smilesDrawer). My contribution simply serves to bridge the gap to Obsidian.

For a full documentation on how your molecules get drawn, read [their README.md](https://github.com/reymond-group/smilesDrawer/blob/master/README.md).
Feel free to read their original paper published by the Journal of Chemical Information and Modeling:
[10.1021/acs.jcim.7b00425](https://pubs.acs.org/doi/10.1021/acs.jcim.7b00425)

## Features
- **Native SVG Rendering**: Renders molecules directly inside your notes using `smiles` — no external image generation servers or APIs required. 
- **Dynamic ViewBox Framework**: Small molecules (like Methane) remain naturally small, while large structures (like Caffeine) scale down smoothly to fit your active pane width.
- **Themes**: Integrates cleanly with light and dark themes using secondary background color matching. Offers additional integrated themes.
- **Settings**: Lots of global and optional local settings let you design each molecule in a different way.
- **Clipboard**: A right-click context menu allows you to copy the smiles notation (as text) or the image (as PNG). *The plugin will not read from your clipboard!*

## Usage
Simply wrap any standard SMILES string inside a `smiles` Markdown code block:

````
```smiles
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
```
````

# Installation
## Community Marketplace
- Chemtrails in the Obsidian Community Plugins directory, install and Enable.
## Manual Installation
- Download main.js, manifest.json, and styles.css from the latest release.
- Move the files into your vault's plugin directory: <vault>/.obsidian/plugins/chemtrails/
- Reload Obsidian plugins and enable Chemtrails.

# Changelog / Roadmap
- 0.1.0: Make it work.
- 0.2.0: Add settings, including renaming of Markdown code block identifier and most of [the original smilesDrawer options](https://github.com/reymond-group/smilesDrawer/blob/master/README.md#options) parameters.
- 0.3.0: Add option to copy SVG as PNG.
- 0.4.0: Add integrated themes.
- 0.5.0: Add optional local settings to each image, overwriting global settings.
