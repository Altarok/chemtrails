import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'
import {PluginSettings} from "../definitions/settings";
import {Check} from "./preconditions";
import {GenericModal} from "./generic-modal";
import {ATOM_VISUALIZATION, MOLECULE_THEMES} from "../definitions/smiles-drawer-adapter";

export class CodeBlockCreatorModal extends Modal {

  constructor(public readonly app: App, public readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app)
  }

  onOpen() {
    const {contentEl} = this
    contentEl.empty()

    /*
     * Abort if open file is not a .md not in reading view
     */
    if (!Check.isMarkdownFileInEditingView(this.plugin)) {
      this.setTitle('[Chemtrails] Warning')
      contentEl.setText("Can't open code block creator.")
      contentEl.setText('Please open a markdown file in editing view.')
      contentEl.setText('Then try again.')
      return
    }

    this.setTitle('[Chemtrails] Code block creator')

    /* Read global settings */
    const globalSettings: PluginSettings = Object.assign({}, this.plugin.settings)
    const localSettings: Record<string, string> = {};
    for (const key of Object.keys(globalSettings)) {
      localSettings[key] = ''
    }


    GenericModal.display(contentEl,
      {
        description: 'Use the global settings you want to overwrite specifically for this code block.',
        overwriteSettings: [
          {
            type: 'main',
            name: 'smiles input',
            explanation: 'This will apply a theme to your code block.',
            mandatory: true,
            current: ''
          },
          {
            type: 'dropdown',
            name: 'theme',
            explanation: 'This will apply a theme to your code block.',
            current: globalSettings.theme,
            mandatory: false,
            dropdownOptions: MOLECULE_THEMES as readonly string[]
          },
          {
            name: 'atom visualization',
            explanation: 'Changes representation of single atoms.',
            current: globalSettings.atomVisualization,
            mandatory: false,
            type: 'dropdown',
            dropdownOptions: ATOM_VISUALIZATION as readonly string[]
          },
          {
            type: 'color',
            name: 'background color',
            current: globalSettings.backgroundColor,
            mandatory: false,
          },
        ],
        output: localSettings
      }
    )




    // contentEl.setAttribute('tabindex', '-1')
    contentEl.focus()
  }

  onClose() {
    this.contentEl.empty()
  }

}
