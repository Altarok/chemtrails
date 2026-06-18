import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'
import {PluginSettings} from '../definitions/settings'
import {ATOM_VISUALIZATION, MOLECULE_THEMES, SHOW_CARBONS} from '../definitions/smiles-drawer-adapter'
import {AnyInput, GenericModal, GenericModalInput, OutputData} from '@Altarok/obsidian-dev-utils/src'
import SmilesDrawer from 'smiles-drawer'

export class CodeBlockCreatorModal extends Modal {
  constructor(public readonly app: App, public readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app)
  }

  onOpen() {
    const {contentEl} = this
    contentEl.empty()

    /* Copy global settings */
    const globalSettings: PluginSettings = Object.assign({}, this.plugin.settings)
    const localSettings: Record<string, OutputData> = {};
    localSettings['smiles'] = ''
    for (const key of Object.keys(globalSettings)) localSettings[key] = undefined

    const mandatoryInput:Readonly<AnyInput>[] = createMandatoryInput();
    const optionalInput:Readonly<AnyInput>[] = createOptionalInput(globalSettings);


    // const combinedInput:GenericModalInput =


    new GenericModal(contentEl,
      {
        pluginName: 'Chemtrails',
        mandatory: mandatoryInput,
        optional: optionalInput,
        output: localSettings,
        createCodeBlock: () => {
          let code = ''
          /* add main options */
          if (localSettings.smiles) code += `${localSettings.smiles}\n`

          /* add other options */
          const settings: AnyInput[] = optionalInput.filter(
            (setting): setting is AnyInput => !!setting && 'key' in setting)
          .map(setting => setting)

          for (const setting of settings) {
            if (!setting) continue

            const localValue = localSettings[setting.key]
            if (localValue === undefined || localValue === '') continue

            const key: string = setting.key
            const globalValue = setting.current
            if (globalValue === localValue) continue

            code += `${key}: ${localValue}\n`
          }

          return `\`\`\`smiles\n${code}\`\`\``
        },
        onUpdatePreview: (previewEl: HTMLElement): void => {
          previewEl.empty();
          const smilesString: string = localSettings.smiles as string

          if (!smilesString) {
            previewEl.setText("Enter a SMILES configuration above to generate preview...");
            return;
          }

          const svgElement = previewEl.createSvg('svg', {
            attr: {
              // 'x': 0 , 'y': 0,
              'width': 300, // globalSettings.width,
              'height': globalSettings.height
            }
          })

          svgElement.setAttribute('max-width', '300');
          svgElement.setAttribute('max-height', '300');

          const overwriteSettings = this.createOverwriteSettings(globalSettings, localSettings);

          const svgDrawer = new SmilesDrawer.SvgDrawer(overwriteSettings)

          SmilesDrawer.parse(smilesString, (tree): void => {
            svgDrawer.draw(tree, svgElement, overwriteSettings.theme);
          }, (error: Error) => {
            previewEl.setText(`SMILES Error: ${error.message}`);
          });

        }
      } as GenericModalInput
    ).display()

    contentEl.focus()
  }

  private createOverwriteSettings(globalSettings: PluginSettings, localSettings: Record<string, string | boolean | undefined>) {
    const overwriteSettings: PluginSettings = Object.assign({}, globalSettings);

    for (const [key, value] of Object.entries(localSettings)) {
      if (key in overwriteSettings) {
        const typedKey = key as keyof PluginSettings;
        if (value !== undefined && value !== overwriteSettings[typedKey] && typeof value === typeof overwriteSettings[typedKey]) {
          (overwriteSettings as Record<string, any>)[typedKey] = value;
        }
      }
    }

    return overwriteSettings;
  }

  onClose() {
    this.contentEl.empty()
  }

}


function createMandatoryInput(): Readonly<AnyInput>[] {
  return [
    {
      type: 'string',
      name: 'smiles input',
      key: 'smiles',
      current: '',
      explanation: 'This will apply a theme to your code block.'
    }
  ]
}

function createOptionalInput(globalSettings: PluginSettings): Readonly<AnyInput>[] {
  return [
    {
      type: 'dropdown',
      name: 'theme',
      key: 'theme',
      explanation: 'This will apply a theme to your code block.',
      current: globalSettings.theme,
      dropdownOptions: MOLECULE_THEMES as readonly string[]
    },
    {
      type: 'dropdown',
      name: 'show carbons',
      key: 'showCarbons',
      explanation: 'Show or hide carbon atoms.',
      current: globalSettings.showCarbons,
      dropdownOptions: SHOW_CARBONS as readonly string[]
    },
    {
      type: 'dropdown',
      name: 'atom visualization',
      key: 'atomVisualization',
      explanation: 'Changes representation of single atoms.',
      current: globalSettings.atomVisualization,
      dropdownOptions: ATOM_VISUALIZATION as readonly string[]
    },
    {
      type: 'color',
      name: 'background color',
      key: 'backgroundColor',
      current: globalSettings.backgroundColor,
    },
    {
      type: 'boolean',
      name: 'show hydrogen atoms explicitly',
      key: 'explicitHydrogens',
      current: globalSettings.explicitHydrogens,
    },
    {
      type: 'boolean',
      name: 'compact drawing',
      key: 'compactDrawing',
      current: globalSettings.compactDrawing,
    },
  ]
}
