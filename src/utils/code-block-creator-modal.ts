import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'

export class CodeBlockCreatorModal extends Modal {

  constructor(public readonly app: App, public readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app)
  }

  onOpen() {
    const {contentEl} = this
    contentEl.empty()

    console.log('open modal')


    // debugger

    this.setTitle('a title')
    //
    // contentEl.createEl('h1', {text: 'a text'})
    //
    //
    // contentEl.setAttribute('tabindex', '-1')
    contentEl.focus()
  }

  onClose() {
    // console.log('close modal')
    // debugger
    this.contentEl.empty()
  }

}
