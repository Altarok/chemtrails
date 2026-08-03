import {App, PluginSettingTab, SettingDefinitionItem} from 'obsidian'
import SmilesDrawerToObsidianPlugin from './main'
import {DEFAULT_SETTINGS} from './definitions/settings'

/* See https://docs.obsidian.md/Plugins/User+interface/Settings  */
export default class SmilesDrawerSettingsTab extends PluginSettingTab {
  tempCodeBlockIdentifier = 'smiles'

  constructor(app: App, readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app, plugin)
    this.tempCodeBlockIdentifier = this.plugin.settings.codeBlockIdentifier
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: 'group',
        name: 'General',
        items: [
          {
            name: 'Code block identifier',
            desc: 'Themes are predefined by the reymond-group. See README. HINT: This requires a plugin reload!',
            control: {
              type: 'text', key: 'codeBlockIdentifier',
              defaultValue: DEFAULT_SETTINGS.codeBlockIdentifier,
              placeholder: DEFAULT_SETTINGS.codeBlockIdentifier,
              validate: (value: string) => value.trim().length > 0
                ? undefined : `Can't be empty!`
            }
          },
          {
            name: 'Theme',
            desc: 'String you mark your code blocks with. HINT: This requires a plugin reload!',
            control: {
              type: 'dropdown', key: 'theme',
              defaultValue: DEFAULT_SETTINGS.theme,
              options: {
                'dark': 'dark (automatic)',
                'light': 'light (automatic)',
                'oldschool': 'oldschool',
                'solarized': 'solarized',
                'solarized-dark': 'solarized-dark',
                'matrix': 'matrix',
                'github': 'github',
                'carbon': 'carbon',
                'cyberpunk': 'cyberpunk',
                'gruvbox': 'gruvbox',
                'gruvbox-dark': 'gruvbox-dark',
                'custom': 'reymond-group',
              },
            }
          },
          {
            name: 'Add ribbon icon',
            desc: 'Button opens code block creator. Restart plugin or app after change.',
            control: {type: 'toggle', key: 'addRibbonIcon', defaultValue: DEFAULT_SETTINGS.addRibbonIcon}
          },
          {
            name: 'Add plugin command',
            desc: 'Command opens code block creator. Restart plugin or app after change.',
            control: {type: 'toggle', key: 'addCommand', defaultValue: DEFAULT_SETTINGS.addCommand}
          }
        ]
      },
      { /* Molecule visualization group */
        type: 'group',
        heading: 'Molecule visualization',
        items: [
          {
            name: 'Background color',
            desc: 'Default background color for images. (default: none). HINT: This may interfere with your theme!',
            control: {type: 'color', key: 'backgroundColor', defaultValue: DEFAULT_SETTINGS.backgroundColor},
          },
          {
            name: 'Maximum display width',
            desc: 'Draw molecules over entire window width. (default: false)',
            control: {type: 'toggle', key: 'containerWidthMax', defaultValue: DEFAULT_SETTINGS.containerWidthMax},
          },
          {
            name: 'Atom Visualization',
            desc: 'Type of atom visualization. Choose from: characters (default), balls or none',
            control: {
              type: 'dropdown',
              key: 'atomVisualization', defaultValue: DEFAULT_SETTINGS.atomVisualization,
              options: {
                'default': 'characters (default)',
                'balls': 'balls',
                'none': 'none'
              }
            }
          },
          {
            name: 'Show explicit carbons?',
            desc: 'Choose from: none, auto (default), terminal, acyclic, all',
            control: {
              type: 'dropdown', key: 'atomVisualization',
              defaultValue: DEFAULT_SETTINGS.showCarbons,
              options: {
                'default': 'characters (default)',
                'balls': 'balls',
                'none': 'none'
              }
            }
          },
        ]
      },
      {
        type: 'page',
        name: 'Advanced',
        desc: 'Power-user options.',
        items: [
          {
            name: 'HINT - Click here to test values in live preview',
            desc: `Before changing the following values, make sure you know what to do.
             The live preview is also accessible as ribbon icon.
              You can save or copy a code block created in this way to the currently open markdown file.`,
            action: () => this.plugin.showCodeBlockCreator('N#OPSC=C1CCC1')
          },
          /*
           * Numbers
           */
          {
            name: 'Padding', desc: 'Padding.', // int
            control: {
              type: 'slider',
              key: 'padding', defaultValue: DEFAULT_SETTINGS.padding,
              min: 0, max: 50, step: 5
            },
          },
          {
            name: 'Atom font size', desc: 'Large font size, in pt for elements.',
            control: {
              type: 'slider',
              key: 'fontSizeLarge', defaultValue: DEFAULT_SETTINGS.fontSizeLarge,
              min: 5, max: 20, step: 1
            },
          },
          {
            name: 'Counter font size', desc: 'Small font size, in pt for numbers.',
            control: {
              type: 'slider',
              key: 'fontSizeSmall', defaultValue: DEFAULT_SETTINGS.fontSizeSmall,
              min: 2, max: 10, step: 1
            },
          },
          {
            name: 'Bond thickness',
            desc: 'Bond thickness.', // float
            control: {
              type: 'slider',
              key: 'bondThickness', defaultValue: DEFAULT_SETTINGS.bondThickness,
              min: 0.5, max: 3, step: 0.1
            },
          },
          {
            name: 'Bond length',
            desc: 'Bond length between atoms.', // float
            control: {
              type: 'slider',
              key: 'bondLength', defaultValue: DEFAULT_SETTINGS.bondLength,
              min: 5, max: 100, step: 5
            },
          },
          {
            name: 'Length of short bond',
            desc: 'Length of short bond relative to normal bond.',
            control: {
              type: 'slider',
              key: 'shortBondLength', defaultValue: DEFAULT_SETTINGS.shortBondLength,
              min: 0.5, max: 1, step: 0.1
            }
          },
          {
            name: 'Bond spacing',
            control:
              {
                type: 'slider',
                key: 'bondSpacing', defaultValue: DEFAULT_SETTINGS.bondSpacing,
                min: 1, max: 10, step: 0.1
              }
          },
          {
            name: 'Height', desc: 'Height of rendered code block.', // int
            control: {
              type: 'slider',
              key: 'height', defaultValue: DEFAULT_SETTINGS.height,
              min: 50, max: 1000, step: 10
            },
          },
          /*
           * Toggles
           */
          {
            name: 'Show hydrogen atoms?',
            desc: 'Show explicit hydrogen atoms. (default: true)',
            control: {type: 'toggle', key: 'explicitHydrogens', defaultValue: DEFAULT_SETTINGS.explicitHydrogens},
          },
          {
            name: 'Compact drawing?',
            desc: 'Draw concatenated terminals and pseudo elements. (default: true)',
            control: {type: 'toggle', key: 'compactDrawing', defaultValue: DEFAULT_SETTINGS.compactDrawing},
          },
          {
            name: 'Isometric drawing?',
            desc: 'Draw isometric SMILES if available. (default: true)',
            control: {type: 'toggle', key: 'isometric', defaultValue: DEFAULT_SETTINGS.isometric},
          },
          /*
           * Whatever this is
           */
          {
            name: 'Overlap sensitivity',
            control: {
              type: 'slider',
              key: 'overlapSensitivity', defaultValue: DEFAULT_SETTINGS.overlapSensitivity,
              min: 0.1, max: 1, step: 0.01,
            }
          },
          {
            name: 'Overlap resolution iterations',
            control: {
              type: 'slider',
              key: 'overlapResolutionIterations', defaultValue: DEFAULT_SETTINGS.overlapResolutionIterations,
              min: 1, max: 10, step: 1,
            }
          },
          {
            name: 'Reset values?',
            desc: `There's no fail-safe. This is 1 click only.`,
            render: (setting) => {
              setting.addButton((bb) =>
                bb.setButtonText("Reset")
                .setDestructive()
                .onClick(async () => {
                    /* JS Hint: be aware that we can't just overwrite one with the other */
                    this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS)
                    await this.plugin.saveSettings()
                    this.update()
                  }
                )
              )
            }
          }
        ]
      }
    ]
  }

}
