import SmilesDrawerToObsidianPlugin from '../main'
import {App, Modal} from 'obsidian'
import {PluginSettings} from '../definitions/settings'
import {ATOM_VISUALIZATION, MOLECULE_THEMES, SHOW_CARBONS} from '../definitions/smiles-drawer-adapter'
import {AnyInput, GenericModal, MandatoryInput, OptionalInput, OutputData} from '@Altarok/obsidian-dev-utils/src'
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
      const settings: AnyInput[] = []

      const addToSettings = (o: OptionalInput): void => {

        if (o.type === 'expandable') {
          o.nestedInput.forEach( (o2: OptionalInput)=>
            addToSettings(o2)
          )
          return
        }

        if (!!o && 'key' in o) {
          settings.push(o)
        }
      }

      optionalInput.forEach( (o: OptionalInput)=>
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
      name: 'smiles input',
      key: 'smiles',
      current: '',
      tooltip: 'This will apply a theme to your code block.'
    }
  ]
}

function createOptionalInput(globalSettings: Readonly<PluginSettings>): Readonly<OptionalInput>[] {
  return [
    {
      type: 'dropdown',
      name: 'theme',
      key: 'theme',
      tooltip: 'This will apply a theme to your code block.',
      current: globalSettings.theme,
      dropdownOptions: MOLECULE_THEMES as readonly string[]
    },
    // {
    //   type: 'dropdown',
    //   name: 'show carbons',
    //   key: 'showCarbons',
    //   tooltip: 'Show or hide carbon atoms.',
    //   current: globalSettings.showCarbons,
    //   dropdownOptions: SHOW_CARBONS as readonly string[]
    // },
    // {
    //   type: 'dropdown',
    //   name: 'atom visualization',
    //   key: 'atomVisualization',
    //   tooltip: 'Changes representation of single atoms.',
    //   current: globalSettings.atomVisualization,
    //   dropdownOptions: ATOM_VISUALIZATION as readonly string[]
    // },
    // {
    //   type: 'color',
    //   name: 'background color',
    //   key: 'backgroundColor',
    //   current: globalSettings.backgroundColor,
    // },
    // {
    //   type: 'boolean',
    //   name: 'show hydrogen atoms explicitly',
    //   key: 'explicitHydrogens',
    //   current: globalSettings.explicitHydrogens,
    // },
    {
      type: 'boolean',
      name: 'compact drawing',
      key: 'compactDrawing',
      current: globalSettings.compactDrawing,
    },
    {
      type: 'expandable',
      name: 'numeric values',
      key: 'none',
      prompt: 'Modify numeric values?',
      nestedInput: [
        {
          type: 'slider',
          name: 'padding',
          key: 'padding',
          from: 0, to: 50, step: 5,
          current: globalSettings.padding,
        },
        {
          type: 'slider',
          name: 'font size small',
          key: 'fontSizeSmall',
          from: 2, to: 10, step: 1,
          current: globalSettings.fontSizeSmall,
        },
        {
          type: 'boolean',
          name: 'show hydrogen atoms explicitly',
          key: 'explicitHydrogens',
          current: globalSettings.explicitHydrogens,
        },
      ]
    },
  ]
}
