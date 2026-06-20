import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'
import {PluginSettings} from '../definitions/settings'
import {MOLECULE_THEMES, SHOW_CARBONS} from '../definitions/smiles-drawer-adapter'
import {GenericModal, MandatoryInput, OptionalInput, OutputData} from '@Altarok/obsidian-dev-utils/src'
import SmilesDrawer from 'smiles-drawer'

// npm update @Altarok/obsidian-dev-utils
export class CodeBlockCreatorModal extends Modal {
  constructor(public readonly app: App, public readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app)
  }

  onOpen() {
    const {contentEl} = this
    contentEl.empty()

    /* Copy global settings */
    const globalSettings: Readonly<PluginSettings> = Object.assign({}, this.plugin.settings)
    const localSettings: Record<string, OutputData> = {};
    localSettings['smiles'] = ''
    for (const key of Object.keys(globalSettings)) localSettings[key] = undefined

    const mandatoryInput: Readonly<MandatoryInput>[] = createMandatoryInput()
    const optionalInput: Readonly<OptionalInput>[] = createOptionalInput(globalSettings)

    const createCodeBlock = (): string => {

      let code = ''
      /* add main smiles notation */
      if (localSettings.smiles) code += `${localSettings.smiles}\n`

      /* add other options */
      const settings: MandatoryInput[] = []

      const addToSettings = (o: OptionalInput): void => {

        if (o.type === 'expandable') {
          o.nestedInput.forEach((o2: OptionalInput) =>
            addToSettings(o2)
          )
          return
        }

        if (!!o && 'key' in o) {
          settings.push(o)
        }
      }

      optionalInput.forEach((o: OptionalInput) =>
        addToSettings(o)
      )
      // optionalInput.forEach((o: OptionalInput)=>{
      //   if (setting is AnyInput => !!setting && 'key' in setting) {
      //
      //   }
      // })
      //   optionalInput.filter(
      //   (setting): setting is AnyInput => !!setting && 'key' in setting)
      // .map(setting => setting)

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
    }
    const onUpdatePreview = (previewEl: HTMLElement): void => {
      previewEl.empty()

      const smilesString: string = localSettings.smiles as string

      if (!smilesString) {
        previewEl.setText("Enter a SMILES configuration above to generate preview...")
        return;
      }

      const svgElement = previewEl.createSvg('svg', {attr: {'width': 300, 'height': globalSettings.height}})

      svgElement.setAttribute('max-width', '300')
      svgElement.setAttribute('max-height', '200')

      const overwriteSettings = this.createOverwriteSettings(globalSettings, localSettings)

      const svgDrawer = new SmilesDrawer.SvgDrawer(overwriteSettings)

      SmilesDrawer.parse(smilesString, (tree): void => {
        svgDrawer.draw(tree, svgElement, overwriteSettings.theme)
      }, (error: Error) => {
        previewEl.setText(`SMILES Error: ${error.message}`)
      })

      if (
        overwriteSettings.backgroundColor !== undefined && overwriteSettings.backgroundColor !== 'none' ) svgElement.style.backgroundColor = overwriteSettings.backgroundColor

    }

    new GenericModal(contentEl,
      {
        pluginName: 'Chemtrails',
        mandatory: mandatoryInput,
        optional: optionalInput,
        output: localSettings,
        createCodeBlock,
        onUpdatePreview
      }
    ).display()

    contentEl.focus()
  }

  private createOverwriteSettings(globalSettings: PluginSettings, localSettings: Record<string, string | boolean | number | undefined>) {
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


function createMandatoryInput(): Readonly<MandatoryInput>[] {
  return [
    {
      type: 'string',
      prompt: 'Please input SMILES notation.',
      key: 'smiles',
      current: '',
      tooltip: 'This will apply a theme to your code block.'
    }
  ]
}

function createOptionalInput(globalSettings: Readonly<PluginSettings>): Readonly<OptionalInput>[] {
  return [
    {
      type: 'expandable', prompt: 'Show design options',
      nestedInput: [
        {
          type: 'dropdown',
          prompt: 'Select theme.',
          key: 'theme',
          tooltip: 'This will apply a theme to your code block.',
          current: globalSettings.theme,
          dropdownOptions: MOLECULE_THEMES as readonly string[]
        },
        {
          type: 'color', prompt: 'Change background color.', key: 'backgroundColor',
          current: globalSettings.backgroundColor,
        },
      ]
    },
    {
      type: 'expandable', prompt: 'Show atom options',
      nestedInput: [
        {
          type: 'dropdown', prompt: 'Select which carbons to show.', key: 'showCarbons',
          tooltip: 'Select which carbon atoms to show',
          current: globalSettings.showCarbons,
          dropdownOptions: SHOW_CARBONS as readonly string[]
        },
        {
          type: 'boolean', prompt: 'Show hydrogen atoms explicitly.',
          tooltip: 'Show hydrogen atoms explicitly',
          key: 'explicitHydrogens', current: globalSettings.explicitHydrogens,
        },
      ]
    },


    // {
    //   type: 'dropdown',
    //   name: 'atom visualization',
    //   key: 'atomVisualization',
    //   tooltip: 'Changes representation of single atoms.',
    //   current: globalSettings.atomVisualization,
    //   dropdownOptions: ATOM_VISUALIZATION as readonly string[]
    // },

    {
      type: 'expandable', prompt: 'Show boolean flags',
      nestedInput: [
        {
          type: 'boolean', prompt: 'compact drawing', key: 'compactDrawing',
          tooltip: 'Shortens some molecules',
          current: globalSettings.compactDrawing,
        },
      ]
    },

    {
      type: 'expandable', prompt: 'Show numeric values',
      nestedInput: [
        {
          type: 'slider', prompt: 'Change padding.', key: 'padding',
          from: 0, to: 50, step: 5, current: globalSettings.padding,
        },
        {
          type: 'slider', prompt: 'Change atom font size.', key: 'fontSizeLarge',
          from: 5, to: 20, step: 1, current: globalSettings.fontSizeLarge,
        },
        {
          type: 'slider', prompt: 'Change counter font size .', key: 'fontSizeSmall',
          from: 2, to: 10, step: 1, current: globalSettings.fontSizeSmall,
        },
      ]
    },
  ]
}
