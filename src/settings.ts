import {OriginalSmilesDrawerSettings} from 'smiles-drawer'

export interface PluginSettings extends OriginalSmilesDrawerSettings {
  codeBlockIdentifier: string
}

export const DEFAULT_SETTINGS: PluginSettings = {
  /* My settings */
  codeBlockIdentifier: 'smiles',
  /* Original smiles-drawer settings:  */
  width: 500,
  height: 500,
  bondThickness: 1,
  bondLength: 30,
  shortBondLength: 0.8,
  bondSpacing: 5.1, // OG was 0.17 * 30 (bondLength),
  atomVisualization: 'default',
  fontSizeLarge: 11,
  fontSizeSmall: 3,
  padding: 10,
  experimentalSSSR: false,
  showCarbons: 'default',
  explicitHydrogens: true,
  overlapSensitivity: 0.42,
  overlapResolutionIterations: 1,
  compactDrawing: true,
  isometric: true
}
