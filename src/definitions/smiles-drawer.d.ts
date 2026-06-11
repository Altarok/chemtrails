declare module 'smiles-drawer' {

  export type AtomVisualizationType = 'default' | 'balls' | 'none'
  export type ShowCarbonsType = 'none' | 'default' | 'terminal' | 'acyclic' | 'all'
  export type ThemesType = 'dark' | 'light' | 'oldschool' | 'solarized' | 'solarized-dark' | 'matrix' | 'github' | 'carbon' | 'cyberpunk' | 'gruvbox' | 'gruvbox-dark' | 'custom'


  export interface OriginalSmilesDrawerNumericSettings {
    /* Drawing width (default: 500) */
    width: number
    /* Drawing height (default: 500) */
    height: number
    /* Bond thickness (default: 1) */
    bondThickness: number
    /* Bond length (default: 30) */
    bondLength: number
    /* Short bond length (e.g. double bonds) as a fraction of bond length (default: 0.8) */
    shortBondLength: number
    /* Bond spacing (e.g. space between double bonds) (default: 0.17 * 30 (=bondLength)) */
    bondSpacing: number
    /* Large Font Size, in pt for elements (default: 11) */
    fontSizeLarge: number
    /* Small Font Size, in pt for numbers (default: 3) */
    fontSizeSmall: number
    /* Padding (default: 10) */
    padding: number
    /* Overlap sensitivity (default: 0.42) */
    overlapSensitivity: number
    /* Amount of overlap resolution iterations (default: 1) */
    overlapResolutionIterations: number
  }

  /*
   * Settings not copied from OG smiles-drawer:
   *
   * - Show terminal carbons (deprecated, use showCarbons). terminalCarbons: boolean = false
   * - Debug (draw debug information to canvas). debug: boolean = false
   * - Color themes. themes: object = any
   *
   * See https://github.com/reymond-group/smilesDrawer/blob/master/README.md#options
   */
  export interface OriginalSmilesDrawerSettings extends OriginalSmilesDrawerNumericSettings {
    /* Atom Visualization (default: 'default') */
    atomVisualization: AtomVisualizationType
    /* Use experimental SSSR (default: false) */
    experimentalSSSR: boolean
    /* Show explicit carbons (default: 'default') */
    showCarbons: ShowCarbonsType
    /* Show explicit hydrogen atoms (default: true) */
    explicitHydrogens: boolean
    /* Draw concatenated terminals and pseudo elements (default: true) */
    compactDrawing: boolean
    /* Draw isometric SMILES if available (default: true) */
    isometric: boolean
    /* For you to guess */
    theme: ThemesType
  }

  /* The parsed molecular graph structure is handled internally by the library. Using 'unknown' forces safety when passing it between parse() and draw(). */
  type MoleculeTree = unknown

  class SvgDrawer {
    constructor(options: Partial<OriginalSmilesDrawerSettings>)

    draw(
      tree: MoleculeTree,
      target: SVGElement | string,
      theme: string,
      weights?: unknown
    ): void
  }

  /* Not used - YET */
  // class CanvasDrawer {
  //   constructor(options: Partial<OriginalSmilesDrawerSettings>)
  //
  //   draw(
  //     tree: MoleculeTree,
  //     target: HTMLCanvasElement | string,
  //     theme: string,
  //     weights?: unknown
  //   ): void
  // }

  function parse(
    smiles: string,
    successCallback: (tree: MoleculeTree) => void,
    errorCallback?: (error: Error) => void
  ): void

  export {SvgDrawer, /*CanvasDrawer,*/ parse}
}
