import {Plugin} from 'obsidian';
import SmilesDrawer from 'smiles-drawer';

export default class FantasyGanttPlugin extends Plugin {

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
    svgEl.setAttribute('height', '400');
    container.appendChild(svgEl);

    // 4. Initialize the SvgDrawer with styling options
    const virtualSize = 500;
    const svgDrawer = new SmilesDrawer.SvgDrawer({
      width: virtualSize,
      height: virtualSize,
      bondThickness: 1.5,
      fontSizeLarge: 12,
      overlapMax: 1,
      compactDrawing: false,
      isometric: true
    });

    // 5. Detect the current Obsidian theme to choose a color palette
    const isDarkMode = document.body.classList.contains('theme-dark');
    const themeMode = isDarkMode ? 'dark' : 'light';

    // 6. Parse and render
    SmilesDrawer.parse(smilesString, (tree) => {
      svgDrawer.draw(tree, svgEl, themeMode);

      // // 3. THE TRICK: Ask the browser to calculate the exact bounding box
      // // of all the paths inside the SVG that were just drawn.
      // const bbox = svgEl.getBBox();
      //
      // // Add a small pixel padding buffer so atom labels don't clip at the edges
      // const padding = 20;
      //
      // const x = bbox.x - padding;
      // const y = bbox.y - padding;
      // const width = bbox.width + (padding * 2);
      // const height = bbox.height + (padding * 2);
      //
      // // 4. Update the viewBox to frame ONLY the area where the molecule exists
      // svgEl.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
      //
      // // 5. Remove hardcoded width/height attributes so CSS can take over scaling smoothly
      // svgEl.removeAttribute('width');
      // svgEl.removeAttribute('height');
      //
      // // Optional: Clamp the maximum display size using inline styles
      // // so simple molecules stay small, but large ones scale down naturally.
      // svgEl.style.maxWidth = `${Math.min(width, 400)}px`;
      // svgEl.style.height = 'auto';
    }, (error) => {
      // If parsing fails, display the error directly where the code block was
      container.setText(`SMILES Error: ${error.message}`);
      container.addClass("smiles-error-msg");
    });
  }

}
