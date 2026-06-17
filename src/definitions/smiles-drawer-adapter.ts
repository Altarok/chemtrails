import {AtomVisualizationType, ThemesType} from 'smiles-drawer'

// This makes the array safely accessible to esbuild while preserving strict typing mapping
export const MOLECULE_THEMES: readonly ThemesType[] = [
  'dark', 'light', 'oldschool', 'solarized', 'solarized-dark',
  'matrix', 'github', 'carbon', 'cyberpunk', 'gruvbox',
  'gruvbox-dark', 'custom'
] as const

export const ATOM_VISUALIZATION: readonly AtomVisualizationType[] = [
  'default', 'balls', 'none'
] as const
