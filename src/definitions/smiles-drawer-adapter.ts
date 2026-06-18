import {AtomVisualizationType, ShowCarbonsType, ThemesType} from 'smiles-drawer'

export const ATOM_VISUALIZATION: readonly AtomVisualizationType[] = [
  'default', 'balls', 'none'
] as const

export const MOLECULE_THEMES: readonly ThemesType[] = [
  'dark', 'light', 'oldschool', 'solarized', 'solarized-dark',
  'matrix', 'github', 'carbon', 'cyberpunk', 'gruvbox',
  'gruvbox-dark', 'custom'
] as const

export const SHOW_CARBONS: readonly ShowCarbonsType[] = [
  'none', 'default', 'terminal', 'acyclic', 'all'
] as const

