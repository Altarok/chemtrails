import {MarkdownView, Menu, Plugin} from 'obsidian'
import SmilesDrawer from 'smiles-drawer'
import SmilesDrawerSettingsTab from './settings-view'
import {DEFAULT_SETTINGS, PluginSettings} from './definitions/settings'
import {Popup} from './popup-util'

/* To read: https://hunterheidenreich.com/notes/chemistry/molecular-representations/notations/smiles/ */
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

    /* Create a clean container element for the SVG inside the note DOM */
    const container = el.createDiv({cls: 'obsidian-smiles-container'})
    if (localSettings.backgroundColor) container.style.backgroundColor = localSettings.backgroundColor
    container.style.height = `${(localSettings.height + 2 * localSettings.padding + 2)}px`;
    // container.style.overflow = 'hidden';

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
      container.addClass('smiles-error-msg')
    })

    this.addRightClickMenu(container, smilesString, svgEl, localSettings)
  }

  private addRightClickMenu(container: HTMLDivElement, smilesString: string, svgEl: SVGSVGElement, localSettings: PluginSettings) {
    container.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault() // prevents standard browser context menu TODO extend instead of remove?

      const menu = new Menu()

      /* Context menu option 1: Jump to Code Block & Pre-input parameter */
      menu.addItem((item) => item
        .setTitle('Edit layout height')
        .setIcon('pencil')
        .onClick(async () => {
          const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
          if (!activeView) return

          const editor = activeView.editor
          const totalLines = editor.lineCount()

          for (let i = 0; i < totalLines; i++) {
            const lineText = editor.getLine(i)

            /* Look for matching SMILES notation */
            if (lineText.trim() === smilesString) {
              const targetLine = i + 1

              editor.setCursor({line: targetLine, ch: 0})
              editor.focus()

              /* Insert a new config line directly below */
              editor.replaceRange('height: \n', {line: targetLine, ch: 0})
              editor.setCursor({line: targetLine, ch: 8})
              break
            }
          }
        })
      )

      /* Context menu option 2: Copy SVG as PNG (as of version 0.3.0 ) */
      menu.addItem((item) =>
        item
        .setTitle('Copy as image (png)')
        .setIcon('copy')
        .onClick(async () => {
          try {
            /* Get the raw XML string from your actual generated SVG element */
            const svgData = new XMLSerializer().serializeToString(svgEl)

            /* Create a hidden canvas element wrapper to convert vector to pixel raster data */
            const canvas = window.activeDocument.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            /* Standard boundaries based on your active dimensions */
            canvas.width = localSettings.width
            canvas.height = localSettings.height

            /* Set up a modern blob image conversion pipeline */
            const img = new window.Image()
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'})
            const url = URL.createObjectURL(svgBlob)

            img.onload = () => {
              ctx.drawImage(img, 0, 0)
              URL.revokeObjectURL(url)

              /* Extract standard PNG image blob from canvas cache data without a leaking promise */
              canvas.toBlob((pngBlob) => {
                if (!pngBlob) return
                void this.copyImageToClipboard(pngBlob)
              }, 'image/png')
            }

            img.src = url
          } catch (err) {
            Popup.nok('Copy failed', err)
          }
        })
      )

      menu.showAtPosition({x: event.clientX, y: event.clientY})
    })
  }

  private async copyImageToClipboard(pngBlob: Blob) {
    try {
      await window.navigator.clipboard.write([
        new ClipboardItem({'image/png': pngBlob})
      ])
      Popup.ok('Image copied to clipboard.')
    } catch (err) {
      Popup.nok('Clipboard write failed', err)
    }
  }
}
