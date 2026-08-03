import {App, PluginSettingTab, Setting, SettingDefinitionItem} from 'obsidian'
import SmilesDrawerToObsidianPlugin from './main'
import {AtomVisualizationType, OriginalSmilesDrawerNumericSettings, ShowCarbonsType, ThemesType} from 'smiles-drawer'
import {DEFAULT_SETTINGS} from './definitions/settings'
import {Popup} from './popup-util'

const nonNegativeIntegerPattern = /^\d+$/
const nonNegativeNumberPattern = /^\d+(\.\d+)?$/

/* See https://docs.obsidian.md/Plugins/User+interface/Settings  */
export default class SmilesDrawerSettingsTab extends PluginSettingTab {
  tempCodeBlockIdentifier = 'smiles'

  constructor(app: App, readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app, plugin)
    this.tempCodeBlockIdentifier = this.plugin.settings.codeBlockIdentifier
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    const {settings} = this.plugin

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
              defaultValue: settings.theme,
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
            control: {type: 'toggle', key: 'addRibbonIcon'}
          },
          {
            name: 'Add plugin command',
            desc: 'Command opens code block creator. Restart plugin or app after change.',
            control: {type: 'toggle', key: 'addCommand'}
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
              type: 'dropdown', key: 'atomVisualization',
              defaultValue: DEFAULT_SETTINGS.atomVisualization,
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
        ]
      },


    ]
  }

  display(): void {

    let {containerEl} = this

    containerEl.empty()

    /* Code block identifier and dropdown menus */
    this.addMajorPluginSettings(containerEl)
    this.addHorizontalSeparator(containerEl)
    this.addMajorGraphicSettings(containerEl)
    this.addHorizontalSeparator(containerEl)
    this.addVisualSettings(containerEl)
    this.addHorizontalSeparator(containerEl)
    this.addResetButton(containerEl)
    this.addHorizontalSeparator(containerEl)

    /* Make plugin and command optional ... */

    new Setting(containerEl).setName('Add ribbon icon')
    .setDesc('Button opens code block creator.')
    .addToggle(t => t.setValue(this.plugin.settings.addRibbonIcon).onChange(async (value) => {
      this.plugin.settings.addRibbonIcon = value
      await this.plugin.saveSettings()
    }))

    new Setting(containerEl).setName('Add plugin command')
    .setDesc('Command opens code block creator.')
    .addToggle(t => t.setValue(this.plugin.settings.addCommand).onChange(async (value) => {
      this.plugin.settings.addCommand = value
      await this.plugin.saveSettings()
    }))

  }

  private addMajorGraphicSettings(containerEl: HTMLElement) {
    new Setting(containerEl).setName('Atom Visualization')
    .setDesc('Type of atom visualization. Choose from: characters (default), balls or none')
    .addDropdown((dc) => dc
      .addOption('default', 'characters (default)')
      .addOption('balls', 'balls')
      .addOption('none', 'none')
      .setValue(this.plugin.settings.atomVisualization).onChange(async (value: string) => {
        this.plugin.settings.atomVisualization = value as AtomVisualizationType
        await this.plugin.saveSettings()
      })
    )

    new Setting(containerEl).setName('Show explicit carbons')
    .setDesc('Show explicit carbon atoms. Choose from: none, auto (default), terminal, acyclic, all')
    .addDropdown((dc) => dc
      .addOption('none', 'none')
      .addOption('default', 'auto (default)')
      .addOption('terminal', 'terminal')
      .addOption('acyclic', 'acyclic')
      .addOption('all', 'all')
      .setValue(this.plugin.settings.showCarbons).onChange(async (value: string) => {
        this.plugin.settings.showCarbons = value as ShowCarbonsType
        await this.plugin.saveSettings()
      })
    )

    /* TODO COMMENT OUT FOR PRODUCTION !! */
    // new Setting(containerEl).setName('DEBUG ONLY: Reload plugin').setDesc('Redraws all diagrams. Necessary when code block identifier changes.')
    // .addButton(button => button.setTooltip('Reload').setIcon('refresh-ccw').onClick(async () => {
    //   await this.app.plugins.disablePlugin(this.plugin.manifest.id)
    //   await this.app.plugins.enablePlugin(this.plugin.manifest.id)
    //   Popup.ok('Plugin reloaded!')
    // }))
  }

  private addResetButton(containerEl: HTMLElement) {
    new Setting(containerEl).setName('Reset values').setDesc('Reset everything to default.')
    .addButton((button) => button
    .setButtonText('Reset')
    .setWarning() /* red color TODO #v1.13.0 change to .setDestructive() */
    .onClick(async () => {
      /* JS Hint: be aware that we can't just overwrite one with the other */
      this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS)
      await this.plugin.saveSettings()
      this.display()
    }))
  }

  private addHorizontalSeparator(containerEl: HTMLElement) {
    containerEl.createEl('hr')
  }

  private addVisualSettings(containerEl: HTMLElement) {
    this.addNumericSetting(containerEl, 'Height', 'Height of rendered code block.', 'height', true)
    this.addNumericSetting(containerEl, 'Bond thickness', 'Bond thickness.', 'bondThickness', false)
    this.addNumericSetting(containerEl, 'Bond length', 'Bond length between atoms.', 'bondLength', false)
    this.addNumericSetting(containerEl, 'Short bond length', 'Short bond length (e.g. double bonds) as a fraction of bond length.', 'shortBondLength', false)
    this.addNumericSetting(containerEl, 'Bond spacing', 'Bond spacing (e.g. space between double bonds).', 'bondSpacing', false)
    this.addNumericSetting(containerEl, 'Large font size', 'Large font size, in pt for elements.', 'fontSizeLarge', true)
    this.addNumericSetting(containerEl, 'Small font size', 'Small font size, in pt for numbers.', 'fontSizeSmall', true)
    this.addNumericSetting(containerEl, 'Padding', 'Padding.', 'padding', true)

//    new Setting(containerEl).setName('Experimental SSSR').setDesc('Use experimental SSSR (default: false)')
//    .addToggle((toggle) => toggle.setValue(this.plugin.settings.experimentalSSSR).onChange(async (value) => {
//      this.plugin.settings.experimentalSSSR = value
//      await this.plugin.saveSettings()
//    }))

    new Setting(containerEl).setName('Show hydrogen atoms').setDesc('Show explicit hydrogen atoms (default: true)')
    .addToggle(tc => tc.setValue(this.plugin.settings.explicitHydrogens).onChange(async (value) => {
      this.plugin.settings.explicitHydrogens = value
      await this.plugin.saveSettings()
    }))

    this.addNumericSetting(containerEl, 'Overlap sensitivity', 'Overlap sensitivity.', 'overlapSensitivity', false)

    this.addNumericSetting(containerEl, 'Overlap resolution iterations', 'Amount of overlap resolution iterations.', 'overlapResolutionIterations', true)

    new Setting(containerEl).setName('Compact drawing').setDesc('Draw concatenated terminals and pseudo elements. (default: true)')
    .addToggle(tc => tc.setValue(this.plugin.settings.compactDrawing).onChange(async (value) => {
      this.plugin.settings.compactDrawing = value
      await this.plugin.saveSettings()
    }))

    new Setting(containerEl).setName('Isometric').setDesc('Draw isometric SMILES if available (default: true)')
    .addToggle(tc => tc.setValue(this.plugin.settings.isometric).onChange(async (value) => {
      this.plugin.settings.isometric = value
      await this.plugin.saveSettings()
    }))
  }

  private addNumericSetting(container: HTMLElement, name: string, desc: string, key: keyof OriginalSmilesDrawerNumericSettings, isInteger: boolean) {
    const pattern: RegExp = isInteger ? nonNegativeIntegerPattern : nonNegativeNumberPattern

    const defaultValue: number = DEFAULT_SETTINGS[key]

    new Setting(container)
    .setName(name)
    .setDesc(`${desc} (default: ${defaultValue})`)
    .addText((text) => text
      .setPlaceholder(`default: ${defaultValue}`)
      .setValue(String(this.plugin.settings[key]))
      .onChange(async (value) => {
        if (pattern.test(value)) {
          this.plugin.settings[key] = Number(value)
          await this.plugin.saveSettings()
        } else {
          Popup.warn(`Invalid value for ${name}: '${value}'`)
        }
      })
    )
  }

  private addMajorPluginSettings(containerEl: HTMLElement) {
    new Setting(containerEl).setName('Code block identifier')
    .setDesc('String you mark your code blocks with. HINT: This requires a plugin reload!')
    .addText((text) => text
    .setPlaceholder('default: smiles')
    .setValue(String(this.plugin.settings.codeBlockIdentifier))
    .onChange(value => this.tempCodeBlockIdentifier = value))
    .addExtraButton(button => button.setTooltip('Save').setIcon('save').onClick(async () => {
      let isValid: boolean = this.tempCodeBlockIdentifier?.length > 0
      if (isValid) {
        this.plugin.settings.codeBlockIdentifier = this.tempCodeBlockIdentifier
        await this.plugin.saveSettings()
        Popup.ok('Please reload the plugin now')
      } else Popup.warn(`Invalid code block identifier: '${this.tempCodeBlockIdentifier}'`)
    }))

    new Setting(containerEl).setName('Theme')
    .setDesc('Themes are predefined by the reymond-group. See README. HINT: This requires a plugin reload!')
    .addDropdown((button) => button
      .addOption('dark', 'dark (automatic)')
      .addOption('light', 'light (automatic)')
      .addOption('oldschool', 'oldschool')
      .addOption('solarized', 'solarized')
      .addOption('solarized-dark', 'solarized-dark')
      .addOption('matrix', 'matrix')
      .addOption('github', 'github')
      .addOption('carbon', 'carbon')
      .addOption('cyberpunk', 'cyberpunk')
      .addOption('gruvbox', 'gruvbox')
      .addOption('gruvbox-dark', 'gruvbox-dark')
      .addOption('custom', 'reymond-group')
      .setValue(this.plugin.settings.theme).onChange(async (value: string) => {
        this.plugin.settings.theme = value as ThemesType
        await this.plugin.saveSettings()
      })
    )

    new Setting(containerEl).setName('Background color')
    .setDesc('Default background color for images. (default: none). HINT: This may interfere with your theme!')
    .addText((text) => text.setValue(this.plugin.settings.backgroundColor || 'none').setDisabled(true))
    .addColorPicker(color => color.setValue(this.plugin.settings.backgroundColor).onChange(async (value) => {
      this.plugin.settings.backgroundColor = value
      await this.plugin.saveSettings()
      this.display()
    }))
    .addExtraButton(button => button.setTooltip('Reset').setIcon('reset').onClick(async () => {
      this.plugin.settings.backgroundColor = ''
      await this.plugin.saveSettings()
      this.display()
    }))

    new Setting(containerEl).setName('Maximum display width')
    .setDesc('Draw molecules over entire window width. (default: false)')
    .addToggle((toggle) => toggle.setValue(this.plugin.settings.containerWidthMax).onChange(async (value) => {
      this.plugin.settings.containerWidthMax = value
      await this.plugin.saveSettings()
    }))
  }
}
