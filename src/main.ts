import {Plugin} from 'obsidian';
import SmilesDrawer from 'smiles-drawer';

export default class SmilesDrawerToObsidian extends Plugin {

  async onload() {

    this.registerMarkdownCodeBlockProcessor("smiles", (source, el) => {
      this.registerSmiles(source, el);
    });
  }

  private registerSmiles(source: string, el: HTMLElement) {
    // 1. Clean the incoming SMILES string from the Markdown file
    const smilesString = source.trim();

    if (!smilesString) return;

    // 2. Create a clean container element for the SVG inside the note DOM
    const container = el.createDiv({cls: "obsidian-smiles-container"});

    // 3. Set up the target SVG element with responsive attributes
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('width', '600');
    svgEl.setAttribute('height', '300');
    container.appendChild(svgEl);

    // 4. Initialize the SvgDrawer with styling options
    const virtualSize = 500;
    const svgDrawer = new SmilesDrawer.SvgDrawer({
      width: virtualSize,
      height: virtualSize,
      bondThickness: 1,
      fontSizeLarge: 11,
      overlapMax: 1,
      showCarbons: 'all',
      compactDrawing: false
    });

    // 5. Detect the current Obsidian theme to choose a color palette
    const isDarkMode = document.body.classList.contains('theme-dark');
    const themeMode = isDarkMode ? 'dark' : 'light';

    // 6. Parse and render
    SmilesDrawer.parse(smilesString, (tree) => {
      svgDrawer.draw(tree, svgEl, themeMode);
    }, (error) => {
      container.setText(`SMILES Error: ${error.message}`);
      container.addClass("smiles-error-msg");
    });
  }

}
