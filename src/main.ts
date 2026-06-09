import {Notice, Plugin} from 'obsidian'
import SmilesDrawer, {OriginalSmilesDrawerSettings} from 'smiles-drawer'
import SmilesDrawerSettingsTab from './settings-view'
import {DEFAULT_SETTINGS, PluginSettings} from './settings'

export default class SmilesDrawerToObsidianPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS

  async onload() {

    await this.loadSettings()

    this.registerMarkdownCodeBlockProcessor(this.settings.codeBlockIdentifier, (source, el) => {
      this.registerSmiles(source, el)
    })

    this.addSettingTab(new SmilesDrawerSettingsTab(this.app, this))
  }

  async loadSettings() {
    let source = await this.loadData()
    const isSourceExists: boolean = !!source
    this.settings = Object.assign({}, DEFAULT_SETTINGS, source)
    if (!isSourceExists) {
      new Notice('Chemtrails: Created new data.json')
      await this.saveSettings()
    }
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  private registerSmiles(source: string, el: HTMLElement) {
    // 1. Clean the incoming SMILES string from the Markdown file
    const smilesString = source.trim()

    if (!smilesString) return

    // 2. Create a clean container element for the SVG inside the note DOM
    const container = el.createDiv({cls: 'obsidian-smiles-container'})

    // 3. Set up the target SVG element with responsive attributes
    const svgEl = window.activeDocument.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEl.setAttrs({'width': this.settings.width, 'height': this.settings.height})

    container.appendChild(svgEl);

    // 4. Initialize the SvgDrawer with styling options
    const svgDrawer = new SmilesDrawer.SvgDrawer(this.settings as Partial<OriginalSmilesDrawerSettings>)

    // 5. Detect the current Obsidian theme to choose a color palette
    const isDarkMode: boolean = window.activeDocument.body.classList.contains('theme-dark')
    const themeMode = isDarkMode ? 'dark' : 'light'

    // 6. Parse and render
    SmilesDrawer.parse(smilesString, (tree): void => {
      svgDrawer.draw(tree, svgEl, themeMode)
    }, (error) => {
      container.setText(`SMILES Error: ${error.message}`)
      container.addClass('smiles-error-msg')
    })
  }

}
