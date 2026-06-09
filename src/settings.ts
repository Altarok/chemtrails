import {OriginalSmilesDrawerSettings} from 'smiles-drawer'

export interface PluginSettings extends OriginalSmilesDrawerSettings {
  codeBlockIdentifier: string
}

const defaultBondLength = 30;

export const DEFAULT_SETTINGS: PluginSettings = {
  /* My settings */
  codeBlockIdentifier: 'smiles',
  /* Original smiles-drawer settings:  */
  width: 500,
  height: 500,
  bondThickness: 1,
  bondLength: defaultBondLength,
  shortBondLength: 0.8,
  bondSpacing: 0.17 * defaultBondLength,
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
