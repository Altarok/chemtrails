import {OriginalSmilesDrawerSettings, ThemesType} from 'smiles-drawer'

export interface PluginSettings extends OriginalSmilesDrawerSettings {
  codeBlockIdentifier: string
  backgroundColor: string
  /* False means small containers, true means full window width */
  containerWidthMax: boolean
}

function getDefaultTheme(): ThemesType {
  const isDarkMode: boolean = window.activeDocument.body.classList.contains('theme-dark')
  return isDarkMode ? 'dark' : 'light'
}


export const DEFAULT_SETTINGS: PluginSettings = {
  /* My settings */
  codeBlockIdentifier: 'smiles',
  backgroundColor: '',
  containerWidthMax: false,
  /* Original smiles-drawer settings:  */
  width: 250,
  height: 150, /* OG was 500 */
  bondThickness: 1,
  bondLength: 30,
  shortBondLength: 0.8,
  bondSpacing: 5.1, /* OG was 0.17 * 30 ( 30 = bondLength) */
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
  isometric: true,
  theme: getDefaultTheme()
}
