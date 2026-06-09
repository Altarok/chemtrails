import {App, Modal, Notice, PluginSettingTab, Setting} from 'obsidian'
import SmilesDrawerToObsidianPlugin from './main'
import {AtomVisualizationType, ShowCarbonsType} from "smiles-drawer";

const pluginId = 'chemtrails'
const nonNegativeIntegerPattern = /\d+/
const nonNegativeNumberPattern = /\d+(\.\d+)?/

/* See https://docs.obsidian.md/Plugins/User+interface/Settings  */
export default class SmilesDrawerSettingsTab extends PluginSettingTab {


  constructor(app: App, readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app, plugin)
  }

  display(): void {
    let {containerEl} = this

    let tempCodeBlockIdentifier: string = this.plugin.settings.codeBlockIdentifier

    containerEl.empty()


    new Setting(containerEl).setName('Height').setDesc('Drawing height of rendered code block.')
    .addText((text) => text.setPlaceholder('default: 500')
    .setValue(String(this.plugin.settings.height)).onChange(async (value) => {
      if (nonNegativeIntegerPattern.test(value)) {
        this.plugin.settings.height = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid height: '${value}'`)
    }))

    new Setting(containerEl).setName('Bond thickness').setDesc('Bond thickness.')
    .addText((text) => text.setPlaceholder('default: 1')
    .setValue(String(this.plugin.settings.bondThickness)).onChange(async (value) => {
      if (nonNegativeNumberPattern.test(value)) {
        this.plugin.settings.bondThickness = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid bond thickness: '${value}'`)
    }))

    new Setting(containerEl).setName('Bond length').setDesc('Bond length between atoms.')
    .addText((text) => text.setPlaceholder('default: 30')
    .setValue(String(this.plugin.settings.bondLength)).onChange(async (value) => {
      if (nonNegativeNumberPattern.test(value)) {
        this.plugin.settings.bondLength = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid bond length: '${value}'`)
    }))

    new Setting(containerEl).setName('Short bond length').setDesc('Short bond length (e.g. double bonds) as a fraction of bond length.')
    .addText((text) => text.setPlaceholder('default: 0.8')
    .setValue(String(this.plugin.settings.shortBondLength)).onChange(async (value) => {
      if (nonNegativeNumberPattern.test(value)) {
        this.plugin.settings.shortBondLength = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid short bond length: '${value}'`)
    }))

    new Setting(containerEl).setName('Bond spacing').setDesc('Bond spacing (e.g. space between double bonds).')
    .addText((text) => text.setPlaceholder('default: 5.1 = 0.17 * default bond length')
    .setValue(String(this.plugin.settings.bondSpacing)).onChange(async (value) => {
      if (nonNegativeNumberPattern.test(value)) {
        this.plugin.settings.bondSpacing = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid bond spacing: '${value}'`)
    }))


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

    new Setting(containerEl).setName('Large font size').setDesc('Large font size, in pt for elements. (default: 11)')
    .addText((text) => text.setPlaceholder('default: 11')
    .setValue(String(this.plugin.settings.fontSizeLarge)).onChange(async (value) => {
      if (nonNegativeIntegerPattern.test(value)) {
        this.plugin.settings.fontSizeLarge = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid large font size: '${value}'`)
    }))


    new Setting(containerEl).setName('Small font size').setDesc('Small font size, in pt for numbers. (default: 3)')
    .addText((text) => text.setPlaceholder('default: 3')
    .setValue(String(this.plugin.settings.fontSizeSmall)).onChange(async (value) => {
      if (nonNegativeIntegerPattern.test(value)) {
        this.plugin.settings.fontSizeSmall = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid small font size: '${value}'`)
    }))

    new Setting(containerEl).setName('Padding').setDesc('Padding. (default: 10)')
    .addText((text) => text.setPlaceholder('default: 10')
    .setValue(String(this.plugin.settings.padding)).onChange(async (value) => {
      if (nonNegativeIntegerPattern.test(value)) {
        this.plugin.settings.padding = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid padding: '${value}'`)
    }))

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


    new Setting(containerEl).setName('Overlap sensitivity ').setDesc('Overlap sensitivity (default: 0.42)')
    .addText((text) => text.setPlaceholder('default: 0.42')
    .setValue(String(this.plugin.settings.shortBondLength)).onChange(async (value) => {
      if (nonNegativeNumberPattern.test(value)) {
        this.plugin.settings.shortBondLength = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid value: '${value}'`)
    }))


    new Setting(containerEl).setName('Overlap resolution iterations').setDesc('Amount of overlap resolution iterations (default: 1)')
    .addText((text) => text.setPlaceholder('default: 1')
    .setValue(String(this.plugin.settings.shortBondLength)).onChange(async (value) => {
      if (nonNegativeIntegerPattern.test(value)) {
        this.plugin.settings.shortBondLength = Number(value)
        await this.plugin.saveSettings()
      } else this.showNoticePanel(`Invalid value: '${value}'`)
    }))

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

    new Setting(containerEl).setName('Code block identifier')
    .setDesc('String you mark your code blocks with. This requires a plugin reload!')
    .addText((text) => text
      .setPlaceholder("default: 'smiles'")
      .setValue(String(this.plugin.settings.codeBlockIdentifier))
      .onChange(async (value) => {
        tempCodeBlockIdentifier = value
      })
    ).addExtraButton(button => button.setTooltip('Save').setIcon('save').onClick(async () => {
        let isValid: boolean = tempCodeBlockIdentifier?.length > 0
        if (isValid) {
          this.plugin.settings.codeBlockIdentifier = tempCodeBlockIdentifier
          await this.plugin.saveSettings()
          this.showModalPanel('Please reload the plugin now')
        } else this.showNoticePanel(`Invalid code block identifier: '${tempCodeBlockIdentifier}'`)
      }
    ))

    new Setting(containerEl).setName('Reload plugin').setDesc('Redraws all diagrams. Necessary after fundamental changes.')
    .addButton(button => button.setTooltip('Reload').setIcon('refresh-ccw').onClick(async () => {
        await this.app.plugins.disablePlugin(pluginId)
        await this.app.plugins.enablePlugin(pluginId)
        this.showNoticePanel('Plugin reloaded!')
      }
    ))

  }

  private showNoticePanel(input: string) {
    new Notice(input)
  }

  private showModalPanel(input: string) {
    const modal = new Modal(this.plugin.app)
    modal.setTitle('Hint')
    modal.setContent(input)
    modal.open()
  }

}
