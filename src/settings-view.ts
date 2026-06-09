import {App, Notice, PluginSettingTab, Setting} from 'obsidian'
import SmilesDrawerToObsidianPlugin from './main'
import {AtomVisualizationType, ShowCarbonsType} from 'smiles-drawer'
import {DEFAULT_SETTINGS, PluginSettings} from './settings'

const nonNegativeIntegerPattern = /^\d+$/
const nonNegativeNumberPattern = /^\d+(\.\d+)?$/

/* See https://docs.obsidian.md/Plugins/User+interface/Settings  */
export default class SmilesDrawerSettingsTab extends PluginSettingTab {
  constructor(app: App, readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app, plugin)
  }

  display(): void {
    let {containerEl} = this

    let tempCodeBlockIdentifier: string = this.plugin.settings.codeBlockIdentifier

    containerEl.empty()

    this.addNumericSetting(containerEl, 'Height', 'Height of rendered code block.', 'height', true)

    this.addNumericSetting(containerEl, 'Bond thickness', 'Bond thickness.', 'bondThickness', false)

    this.addNumericSetting(containerEl, 'Bond length', 'Bond length between atoms.', 'bondLength', false)

    this.addNumericSetting(containerEl, 'Short bond length', 'Short bond length (e.g. double bonds) as a fraction of bond length.', 'shortBondLength', false)

    this.addNumericSetting(containerEl, 'Bond spacing', 'Bond spacing (e.g. space between double bonds).', 'bondSpacing', false)

    new Setting(containerEl).setName('Atom Visualization').setDesc('Type of atom visualization. Choose from: characters (default), balls or none')
    .addDropdown((dc) => dc
      .addOption('default', 'characters (default)')
      .addOption('balls', 'balls')
      .addOption('none', 'none')
      .setValue(this.plugin.settings.atomVisualization).onChange(async (value: string) => {
        this.plugin.settings.atomVisualization = value as AtomVisualizationType
        await this.plugin.saveSettings()
      })
    )

    this.addNumericSetting(containerEl, 'Large font size', 'Large font size, in pt for elements.', 'fontSizeLarge', true)

    this.addNumericSetting(containerEl, 'Small font size', 'Small font size, in pt for numbers.', 'fontSizeSmall', true)

    this.addNumericSetting(containerEl, 'Padding', 'Padding.', 'padding', true)

    new Setting(containerEl).setName('Experimental SSSR').setDesc('Use experimental SSSR (default: false)')
    .addToggle((toggle) => toggle.setValue(this.plugin.settings.experimentalSSSR).onChange(async (value) => {
      this.plugin.settings.experimentalSSSR = value
      await this.plugin.saveSettings()
    }))

    new Setting(containerEl).setName('Show explicit carbons').setDesc('Show explicit carbon atoms. Choose from: none, auto (default), terminal, acyclic, all')
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

    new Setting(containerEl).setName('Show hydrogen atoms').setDesc('Show explicit hydrogen atoms (default: true)')
    .addToggle((toggle) => toggle.setValue(this.plugin.settings.explicitHydrogens).onChange(async (value) => {
      this.plugin.settings.explicitHydrogens = value
      await this.plugin.saveSettings()
    }))

    this.addNumericSetting(containerEl, 'Overlap sensitivity', 'Overlap sensitivity.', 'overlapSensitivity', false)

    this.addNumericSetting(containerEl, 'Overlap resolution iterations', 'Amount of overlap resolution iterations.', 'overlapResolutionIterations', true)

    new Setting(containerEl).setName('Compact drawing').setDesc('Draw concatenated terminals and pseudo elements. (default: true)')
    .addToggle((toggle) => toggle.setValue(this.plugin.settings.compactDrawing).onChange(async (value) => {
      this.plugin.settings.compactDrawing = value
      await this.plugin.saveSettings()
    }))

    new Setting(containerEl).setName('Isometric').setDesc('Draw isometric SMILES if available (default: true)')
    .addToggle((toggle) => toggle.setValue(this.plugin.settings.isometric).onChange(async (value) => {
      this.plugin.settings.isometric = value
      await this.plugin.saveSettings()
    }))


    containerEl.createEl('hr') ///////////////////////////////////////////

    new Setting(containerEl).setName('Code block identifier').setDesc('String you mark your code blocks with. HINT: This requires a plugin reload!')
    .addText((text) => text
    .setPlaceholder("default: 'smiles'")
    .setValue(String(this.plugin.settings.codeBlockIdentifier))
    .onChange(async (value) => {
      tempCodeBlockIdentifier = value
    }))
    .addExtraButton(button => button.setTooltip('Save').setIcon('save').onClick(async () => {
      let isValid: boolean = tempCodeBlockIdentifier?.length > 0
      if (isValid) {
        this.plugin.settings.codeBlockIdentifier = tempCodeBlockIdentifier
        await this.plugin.saveSettings()
        this.showNoticePanel('Please reload the plugin now')
      } else this.showNoticePanel(`Invalid code block identifier: '${tempCodeBlockIdentifier}'`)
    }))

    new Setting(containerEl).setName('Reload plugin').setDesc('Redraws all diagrams. Necessary when code block identifier changes.')
    .addButton(button => button.setTooltip('Reload').setIcon('refresh-ccw').onClick(async () => {
      await this.app.plugins.disablePlugin(this.plugin.manifest.id)
      await this.app.plugins.enablePlugin(this.plugin.manifest.id)
      this.showNoticePanel('Plugin reloaded!')
    }))

    new Setting(containerEl).setName('Reset values').setDesc('Reset everything to default.')
    .addButton((button) => button
    .setButtonText('Reset')
    .setWarning() /* red color TODO #v1.13.0 change to .setDestructive() */
    .onClick(async () => {
      /* JS Hint: be aware that we can't just overwrite one with the other */
      this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
      await this.plugin.saveSettings()
      this.display()
    }))

  }

  private addNumericSetting(container: HTMLElement, name: string, desc: string, key: keyof PluginSettings, isInteger: boolean) {
    const pattern: RegExp = isInteger ? nonNegativeIntegerPattern : nonNegativeNumberPattern;

    const defaultValue: number = DEFAULT_SETTINGS[key] as number

    new Setting(container)
    .setName(name)
    .setDesc(`${desc} (default: ${defaultValue})`)
    .addText((text) => text
      .setPlaceholder(`default: ${defaultValue}`)
      .setValue(String(this.plugin.settings[key]))
      .onChange(async (value) => {
        if (pattern.test(value)) {
          const numValue = Number(value);
          if (typeof this.plugin.settings[key] === 'number') {
            // Line done with AI to remove 'any' for Obsidian
            this.plugin.settings[key as keyof typeof this.plugin.settings & string] = numValue as never;
          }
          await this.plugin.saveSettings();
        } else {
          this.showNoticePanel(`Invalid value for ${name}: '${value}'`);
        }
      })
    );
  }

  private showNoticePanel(input: string) {
    new Notice(input)
  }

}
