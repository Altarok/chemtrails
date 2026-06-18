import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'
import {PluginSettings} from '../definitions/settings'
import {Check} from './preconditions'
import {ATOM_VISUALIZATION, MOLECULE_THEMES} from '../definitions/smiles-drawer-adapter'
import {GenericModal, OutputData} from '@Altarok/obsidian-dev-utils/src'
import SmilesDrawer, {ThemesType} from 'smiles-drawer'

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
      contentEl.setText(`
      Can't open code block creator.
      Please open a markdown file in editing view.
      Then try again.
      `)
      return
    }

    this.setTitle('[Chemtrails] Code block creator')

    /* Read global settings */
    const globalSettings: PluginSettings = Object.assign({}, this.plugin.settings)
    const localSettings: Record<string, OutputData> = {};
    localSettings['smiles'] = ''
    for (const key of Object.keys(globalSettings)) localSettings[key] = undefined

    new GenericModal(contentEl,
      {
        description: 'Select the global settings you want to overwrite for your code block.',
        codeBlockId: 'smiles',
        overwriteSettings: [
          {
            type: 'main',
            name: 'smiles input',
            key: 'smiles',
            explanation: 'This will apply a theme to your code block.',
            mandatory: true
          },
          {
            type: 'dropdown',
            name: 'theme',
            key: 'theme',
            explanation: 'This will apply a theme to your code block.',
            current: globalSettings.theme,
            mandatory: false,
            dropdownOptions: MOLECULE_THEMES as readonly string[]
          },
          {
            type: 'dropdown',
            name: 'atom visualization',
            key: 'atomVisualization',
            explanation: 'Changes representation of single atoms.',
            current: globalSettings.atomVisualization,
            mandatory: false,
            dropdownOptions: ATOM_VISUALIZATION as readonly string[]
          },
          {
            type: 'color',
            name: 'background color',
            key: 'backgroundColor',
            current: globalSettings.backgroundColor,
            mandatory: false,
          },
          {
            type: 'boolean',
            name: 'show hydrogen atoms explicitly',
            key: 'explicitHydrogens',
            current: globalSettings.explicitHydrogens,
            mandatory: false,
          },
          {
            type: 'boolean',
            name: 'compact drawing',
            key: 'compactDrawing',
            current: globalSettings.compactDrawing,
            mandatory: false,
          },
        ],
        output: localSettings,
        onUpdatePreview: (currentCode: string, previewEl: HTMLElement): void => {
          previewEl.empty();

          // Parse out your main SMILES string from the generated block configuration text
          // const lines = currentCode.split('\n');
          // const smilesString = lines[0]?.trim(); // Assuming the 'main' text block field sits on line 1

          const smilesString: string = localSettings.smiles as string

          if (!smilesString) {
            previewEl.setText("Enter a SMILES configuration above to generate preview...");
            return;
          }


          // Create a canvas or SVG element exactly like your post-processor does
          const svgElement = previewEl.createSvg('svg', {
              attr: {
                // 'x': 0 , 'y': 0,
                'width': 300, // globalSettings.width,
                'height': 300 // globalSettings.height
              }
            }
          );

          svgElement.setAttribute('max-width', '300');
          svgElement.setAttribute('max-height', '300');

          // Call your existing package drawer logic directly onto the target element
          // Example placeholder matching common smiles-drawer API mechanics:

          // let theme: ThemesType = globalSettings.theme
          // if (localSettings.theme !== undefined && localSettings.theme !== theme)
          //   theme = localSettings.theme as ThemesType // secure because of dropdown
          const overwriteSettings = this.createOverwriteSettings(globalSettings, localSettings);

          const svgDrawer = new SmilesDrawer.SvgDrawer(overwriteSettings)

          SmilesDrawer.parse(smilesString, (tree): void => {
            svgDrawer.draw(tree, svgElement, overwriteSettings.theme);
          }, (error: Error) => {
            previewEl.setText(`SMILES Error: ${error.message}`);
          });
          // } catch (e) {
          //   previewEl.setText("Error generating chemical visualization asset.");
          // }
        }
      }
    ).display()


    // contentEl.setAttribute('tabindex', '-1')
    contentEl.focus()
  }

  private createOverwriteSettings(globalSettings: PluginSettings, localSettings: Record<string, string | boolean | undefined>) {
    const overwriteSettings: PluginSettings = Object.assign({}, globalSettings);

    for (const [key, value] of Object.entries(localSettings)) {
      if (value !== undefined && value !== overwriteSettings[key as keyof PluginSettings]  ) {
        overwriteSettings[key as keyof PluginSettings] = value as any;
      }
    }
    return overwriteSettings;
  }

  onClose() {
    this.contentEl.empty()
  }

}
