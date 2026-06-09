declare module 'smiles-drawer' {
  export interface DrawerOptions {
    width?: number;
    height?: number;
    bondThickness?: number;
    fontSizeLarge?: number;
    overlapMax?: number;
    compactDrawing: boolean;
    [key: string]: unknown; // Allows other library-specific configuration keys safely
  }

  // The parsed molecular graph structure is handled internally by the library.
  // Using 'unknown' forces safety when passing it between parse() and draw().
  export type MoleculeTree = unknown;

  export class SvgDrawer {
    constructor(options: DrawerOptions);
    draw(
      tree: MoleculeTree,
      target: SVGElement | string,
      theme: string,
      weights?: unknown
    ): void;
  }

  export class CanvasDrawer {
    constructor(options: DrawerOptions);
    draw(
      tree: MoleculeTree,
      target: HTMLCanvasElement | string,
      theme: string,
      weights?: unknown
    ): void;
  }

  export function parse(
    smiles: string,
    successCallback: (tree: MoleculeTree) => void,
    errorCallback?: (error: Error) => void
  ): void;

  const SmilesDrawer: {
    SvgDrawer: typeof SvgDrawer;
    CanvasDrawer: typeof CanvasDrawer;
    parse: typeof parse;
  };

  export default SmilesDrawer;
}
