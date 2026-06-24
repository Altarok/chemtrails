import {Plugin} from 'obsidian'
import SmilesDrawer from 'smiles-drawer'
import SmilesDrawerSettingsTab from './settings-view'
import {DEFAULT_SETTINGS, PluginSettings} from './definitions/settings'
import {Popup} from './popup-util'
import {ContextMenuBuilder} from './context-menu'
import {CodeBlockCreatorModal} from './utils/code-block-creator-modal'
// import {Check} from './utils/preconditions'

/* To read: https://hunterheidenreich.com/notes/chemistry/molecular-representations/notations/smiles/ */
export default class SmilesDrawerToObsidianPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS

  async onload() {
    await this.loadSettings()

    this.registerMarkdownCodeBlockProcessor(this.settings.codeBlockIdentifier, (source, el) => {
      this.registerSmiles(source, el)
    })

    this.addSettingTab(new SmilesDrawerSettingsTab(this.app, this))


    // if (Check.isDesktop()) {

    if (this.settings.addRibbonIcon) this.addRibbonIcon('lucide-atom',
      'Chemtrails: Open code block creator', () => this.showCodeBlockCreator()
    )

    if (this.settings.addCommand) this.addCommand({
      id: 'open-code-block-creator', name: 'Open code block creator',
      callback: () => this.showCodeBlockCreator()
    })

    // }

  }

  async loadSettings() {
    const source = (await this.loadData()) as Partial<PluginSettings> | null
    const isSourceExists: boolean = !!source
    this.settings = Object.assign({}, DEFAULT_SETTINGS, source)
    if (!isSourceExists) {
      await this.saveSettings()
      Popup.ok('Chemtrails: Created new data.json')
    }
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  private registerSmiles(source: string, el: HTMLElement) {
    const lines = source.split('\n')
    const smilesString = lines[0].trim()

    if (!smilesString) return

    /* Overwrite global settings */
    const localSettings: PluginSettings = Object.assign({}, this.settings)
    /* #cast-through-unknown to bypass strict type overlapping constraints */
    const settingsRef = localSettings as unknown as Record<string, unknown>

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      /* Split by the first colon only, in case a value contains a colon */
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue

      const rawKey = line.slice(0, colonIndex).trim()
      const rawValue = line.slice(colonIndex + 1).trim()

      if (!rawKey || !rawValue) continue

      /* Verify the key actually exists on your settings object */
      if (rawKey in localSettings) {
        const currentTargetType = typeof settingsRef[rawKey]

        /* Parse and cast the string into the correct runtime data type dynamically */
        if (currentTargetType === 'number') {
          const num = Number(rawValue)
          if (!isNaN(num)) {
            settingsRef[rawKey] = num
          }
        } else if (currentTargetType === 'boolean') {
          settingsRef[rawKey] = rawValue === 'true'
        } else if (currentTargetType === 'string') {
          settingsRef[rawKey] = rawValue
        }
      }
    }

    const cssStyleDisplay = localSettings.containerWidthMax ? 'flex' : 'inline-flex'

    /* Create a clean container element for the SVG inside the note DOM */
    const container = el.createDiv({cls: 'chemtrails-smiles-container'})
    if (localSettings.backgroundColor) container.style.backgroundColor = localSettings.backgroundColor
    container.style.height = `${(localSettings.height + 2)}px` /* add 2 for border */
    container.style.display = cssStyleDisplay

    /* Set up the target SVG element with responsive attributes */
    const svgEl = window.activeDocument.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEl.setAttrs({'width': 'auto', 'height': localSettings.height})

    container.appendChild(svgEl)

    /* Initialize the SvgDrawer with styling options */
    const svgDrawer = new SmilesDrawer.SvgDrawer(localSettings)

    /* External magic */
    SmilesDrawer.parse(smilesString, (tree): void => {
      svgDrawer.draw(tree, svgEl, localSettings.theme)
    }, (error) => {
      container.setText(`SMILES Error: ${error.message}`)
      container.addClass('chemtrails-smiles-error-msg')
    })

    new ContextMenuBuilder(this, source, container, smilesString, svgEl, localSettings).build()
  }

  private showCodeBlockCreator() {
    new CodeBlockCreatorModal(this.app, this).open()
  }
}
