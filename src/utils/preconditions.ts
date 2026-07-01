import { Platform, Plugin, MarkdownView} from 'obsidian'

function isDesktop (){
  return Platform.isDesktop
}

function isMarkdownFile (plugin:Plugin){
  return plugin.app.workspace.activeEditor?.file?.extension == 'md'
}

function isMarkdownFileInEditingView(plugin:Plugin): boolean {
  /*
   * state.mode === 'source' -> editing view
   *
   * state.source === true -> source mode
   * state.source === false -> live preview
   */
  return plugin.app.workspace.getActiveViewOfType(MarkdownView)?.getState().mode === 'source'
}

export const Check = {
  isMarkdownFile,
  isDesktop, // as opposed to isOnMobile
  isMarkdownFileInEditingView
}
