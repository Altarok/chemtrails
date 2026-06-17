import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'
import {PluginSettings} from "../definitions/settings";
import {Check} from "./preconditions";
import {GenericModal} from "./generic-modal";
import {MOLECULE_THEMES} from "../definitions/smiles-drawer-adapter";

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
    // let localSettings: Partial<PluginSettings> = {}

    GenericModal.displayInitialDescription(contentEl,
      'Use the global settings you want to overwrite specifically for this code block.'
    )

    GenericModal.displayOptionalOverwriteSettings(contentEl, {
        name: 'theme',
        description: "A molecule's display theme.",
        current: globalSettings.theme,
        input:
          {
            type: 'dropdown',
            dropdownOptions: MOLECULE_THEMES
          }
      }
    )


    // debugger

    // contentEl.setAttribute('tabindex', '-1')
    contentEl.focus()
  }

  onClose() {
    this.contentEl.empty()
  }

}
