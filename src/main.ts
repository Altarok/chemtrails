import {MarkdownView, Menu, Plugin} from 'obsidian'
import SmilesDrawer from 'smiles-drawer'
import SmilesDrawerSettingsTab from './settings-view'
import {DEFAULT_SETTINGS, PluginSettings} from './settings'
import {Popup} from './popup-util'

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
    let source = (await this.loadData()) as Partial<PluginSettings> | null
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
    /* #cast-through-unknown */
    const settingsRef = localSettings as unknown as Record<string, unknown>

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // 1. Split by the first colon only, in case a value contains a colon
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue

      const rawKey = line.slice(0, colonIndex).trim()
      const rawValue = line.slice(colonIndex + 1).trim()

      if (!rawKey) continue
      if (!rawValue) continue

      // 2. Verify the key actually exists on your settings object
      if (rawKey in localSettings) {
        const key = rawKey as keyof PluginSettings
        const currentTargetType = typeof localSettings[key]

        // 3. Parse and cast the string into the correct runtime data type dynamically
        if (currentTargetType === 'number') {
          const num = Number(rawValue)
          if (!isNaN(num)) {
            settingsRef[key] = num
          }
        } else if (currentTargetType === 'boolean') {
          settingsRef[key] = rawValue === 'true'
        } else if (currentTargetType === 'string') {
          settingsRef[key] = rawValue
        }
      }
    }

    // Create a clean container element for the SVG inside the note DOM
    const container = el.createDiv({cls: 'obsidian-smiles-container'})

    // Set up the target SVG element with responsive attributes
    const svgEl = window.activeDocument.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEl.setAttrs({'width': localSettings.width, 'height': localSettings.height})

    container.appendChild(svgEl)

    // Initialize the SvgDrawer with styling options
    const svgDrawer = new SmilesDrawer.SvgDrawer(localSettings)

    // Detect the current Obsidian theme to choose a color palette
    const isDarkMode: boolean = window.activeDocument.body.classList.contains('theme-dark')
    const themeMode = isDarkMode ? 'dark' : 'light'

    // Parse and render
    SmilesDrawer.parse(smilesString, (tree): void => {
      svgDrawer.draw(tree, svgEl, themeMode)
    }, (error) => {
      container.setText(`SMILES Error: ${error.message}`)
      container.addClass('smiles-error-msg')
    })

    this.addRightClickMenu(container, smilesString, svgEl, localSettings)
  }

  private addRightClickMenu(container: HTMLDivElement, smilesString: string, svgEl: SVGSVGElement, localSettings: PluginSettings) {
    // Inside your registerSmiles method:
    container.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault() // TODO prevent standard browser right-click menu ?

      const menu = new Menu()

      // OPTION 1: Jump to Code Block & Pre-input parameter
      menu.addItem((item) => item
        .setTitle('Edit layout height')
        .setIcon('lucide-pencil')
        .onClick(async () => {
          // Fetch the current active Markdown editor instance workspace view
          const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
          if (!activeView) return

          const editor = activeView.editor

          // Find where the code block lives relative to the cursor or viewport
          // A common pattern is matching the exact source payload line footprint:
          const totalLines = editor.lineCount()
          for (let i = 0; i < totalLines; i++) {
            const lineText = editor.getLine(i)

            // Check if this line matches the target SMILES text
            if (lineText.trim() === smilesString) {
              // Place cursor directly on the line below the SMILES code string
              const targetLine = i + 1

              editor.setCursor({line: targetLine, ch: 0})
              editor.focus()

              // Insert a new line with "height:" pre-filled
              editor.replaceRange('height: \n', {line: targetLine, ch: 0})
              editor.setCursor({line: targetLine, ch: 8}) // Put cursor right after "height: "
              break
            }
          }
        })
      )

      // OPTION 2: Copy SVG as Image
      menu.addItem((item) =>
        item
        .setTitle('Copy as image (png)')
        .setIcon('lucide-copy')
        .onClick(async () => {
          try {
            // 1. Get the raw XML string from your actual generated SVG element
            const svgData = new XMLSerializer().serializeToString(svgEl)

            // 2. Create a hidden canvas element wrapper to convert vector to pixel raster data
            const canvas = window.activeDocument.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Standard boundaries based on your active dimensions
            canvas.width = localSettings.width
            canvas.height = localSettings.height

            // 3. Set up a modern blob image conversion pipeline
            const img = new window.Image()
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'})
            const url = URL.createObjectURL(svgBlob)

            img.onload = () => {
              ctx.drawImage(img, 0, 0)
              URL.revokeObjectURL(url)

              // 4. Extract standard PNG image blob from canvas cache data without a leaking promise
              canvas.toBlob((pngBlob) => {
                if (!pngBlob) return

                // Isolate the async operation to keep the toBlob callback synchronous
                (async () => {
                  try {
                    // 5. Write binary object array data payload into system clipboard space
                    await window.navigator.clipboard.write([
                      new ClipboardItem({'image/png': pngBlob})
                    ])
                    Popup.ok('Image copied to clipboard.')
                  } catch (err) {
                    if (err instanceof Error) {
                      Popup.nok('Clipboard write failed', err)
                    }
                  }
                })()
              }, 'image/png')
            }

            img.src = url
          } catch (err) {
            Popup.nok('Copy failed', err)
          }
        })
      )

      // Display the menu panel exactly where the user clicked their mouse
      menu.showAtPosition({x: event.clientX, y: event.clientY})
    })
  }
}
