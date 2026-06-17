import { Platform, Plugin, MarkdownView} from 'obsidian'

function isDesktop (){
  return Platform.isDesktop
}

function isMarkdownFile (plugin:Plugin){
  return plugin.app.workspace.activeEditor?.file?.extension == 'md'
}

function isMarkdownFileInEditingView(plugin:Plugin): boolean {
  const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView)

  if (!activeView) return false

  const state = activeView.getState();

  return state.mode === 'source'


  // if (state.mode === 'source') {
  //   // console.log("The file is in Editing View");
  //
  //   // Optional: Distinguish between Live Preview and Source Mode
  //   if (state.source === true) {
  //     // console.log("Specifically: Source Mode");
  //   } else {
  //     // console.log("Specifically: Live Preview");
  //   }
  // } else if (state.mode === 'preview') {
  //   console.log("The file is in Reading View");
  // }
}

export const Check = {
  isMarkdownFile,
  isDesktop, // as opposed to isOnMobile
  isMarkdownFileInEditingView
}
