import {App, Modal} from 'obsidian'
import SmilesDrawerToObsidianPlugin from '../main'
import {PluginSettings} from '../definitions/settings'
import {ATOM_VISUALIZATION, MOLECULE_THEMES, SHOW_CARBONS} from '../definitions/smiles-drawer-adapter'
import SmilesDrawer from 'smiles-drawer'
import {GenericModal, GenericModalInput, OutputData, UserInput} from '@Altarok/obsidian-dev-utils'

export class CodeBlockCreatorModal extends Modal {
  constructor(public readonly app: App, public readonly plugin: SmilesDrawerToObsidianPlugin) {
    super(app)
  }

  onOpen() {
    const {contentEl} = this
    contentEl.empty()

    /* Copy global settings */
    const globalSettings: Readonly<PluginSettings> = Object.assign({}, this.plugin.settings)
    const output: Record<string, OutputData> = {}
    output.smiles = ''
    for (const key of Object.keys(globalSettings)) output[key] = undefined

    const mandatoryInput: Readonly<UserInput>[] = createMandatoryInput()
    const optionalInput: Readonly<UserInput>[] = createOptionalInput(globalSettings)

    // const allFlatInputs: Readonly<NonExpandableInput>[] = [
    // ...mandatoryInput.flatMap(i => i.type === 'expandable' ? i.nestedInput : [i]),
    // ...optionalInput.flatMap(i => i.type === 'expandable' ? i.nestedInput : [i])
    // ]

    const onUpdatePreview = (previewEl: HTMLElement): void => {
      previewEl.empty()

      const smilesString: string = output.smiles as string

      if (!smilesString) return

      const svgElement = previewEl.createSvg('svg', {attr: {'width': 300, 'height': globalSettings.height}})

      svgElement.setAttribute('max-width', '300')
      svgElement.setAttribute('max-height', '200')

      const overwriteSettings = mergeSettings(globalSettings, output)

      const svgDrawer = new SmilesDrawer.SvgDrawer(overwriteSettings)

      SmilesDrawer.parse(smilesString,
        (tree): void => svgDrawer.draw(tree, svgElement, overwriteSettings.theme),
        (error: Error) => previewEl.setText(`SMILES Error: ${error.message}`)
      )

      if (overwriteSettings.backgroundColor !== undefined && overwriteSettings.backgroundColor !== 'none')
        svgElement.style.backgroundColor = overwriteSettings.backgroundColor

    }

    const allInputs: Readonly<UserInput>[] = [...mandatoryInput, ...optionalInput]

    const modalInput: GenericModalInput = {
      pluginName: 'Chemtrails',
      codeBlockId: globalSettings.codeBlockIdentifier,
      input: allInputs,
      onUpdatePreview,
      output
    }

    new GenericModal(contentEl, modalInput).display()

    contentEl.focus()
  }


  onClose() {
    this.contentEl.empty()
  }

}

/**
 * @param globalSettings - global plugin settings
 * @param localSettings - subset of plugin settings user chose to overwrite with code block creator
 */
function mergeSettings(globalSettings: Readonly<PluginSettings>, localSettings: Record<string, string | boolean | number | undefined>) {
  const mergedSettings: PluginSettings = Object.assign({}, globalSettings)

  const setSettingProperty = <K extends keyof PluginSettings>(key: K, val: PluginSettings[K]) => {
    /* AI written helper method for type compliance */
    mergedSettings[key] = val
  }

  for (const key of Object.keys(globalSettings) as (keyof PluginSettings)[]) {
    const localValue = localSettings[key]
    if (localValue === undefined) continue

    const globalValue = globalSettings[key]

    if (globalValue !== localValue && typeof globalValue === typeof localValue) {
      setSettingProperty(key, localValue)
    }
  }

  return mergedSettings
}

function createMandatoryInput(): Readonly<UserInput>[] {
  return [{
    type: 'string',
    prompt: 'Please input SMILES notation.',
    key: 'smiles',
    ignoreKeyInCodeBlock: true,
    mandatory: true,
    current: '',
  }]
}

function createOptionalInput(globalSettings: Readonly<PluginSettings>): Readonly<UserInput>[] {
  return [
    {
      type: 'expandable', prompt: 'Colors and Themes',
      mandatory: false,
      nestedInput: [
        {
          type: 'dropdown', prompt: 'Theme', key: 'theme',
          tooltip: 'Apply theme to your code block.',
          current: globalSettings.theme,
          dropdownOptions: MOLECULE_THEMES
        },
        {
          type: 'color', prompt: 'Background color', key: 'backgroundColor',
          current: globalSettings.backgroundColor,
        },
      ]
    },
    {
      type: 'expandable', prompt: 'Visuals',
      mandatory: false,
      nestedInput: [
        {
          type: 'dropdown', prompt: 'How to visualize atoms', key: 'atomVisualization',
          tooltip: 'Changes of single atoms from letters to circles or hies them entirely.',
          current: globalSettings.atomVisualization,
          dropdownOptions: ATOM_VISUALIZATION
        },
        {
          type: 'dropdown', prompt: 'Select which carbons to show.', key: 'showCarbons',
          tooltip: 'Select which carbon atoms to show.',
          current: globalSettings.showCarbons,
          dropdownOptions: SHOW_CARBONS
        },
        {
          type: 'boolean', prompt: 'Show explicit hydrogen atoms.', key: 'explicitHydrogens',
          current: globalSettings.explicitHydrogens,
        },
        {
          type: 'boolean', prompt: 'Compact drawing?', key: 'compactDrawing',
          tooltip: 'Shortens some molecules',
          current: globalSettings.compactDrawing,
        },
        {
          type: 'boolean', prompt: 'Isometric drawing?', key: 'isometric',
          current: globalSettings.isometric,
        },
        {
          type: 'boolean', prompt: 'Max container width?', key: 'containerWidthMax',
          current: globalSettings.containerWidthMax,
        }
      ]
    },
    {
      type: 'expandable', prompt: 'Advanced',
      mandatory: false,
      nestedInput: [
        {
          type: 'slider', prompt: 'Padding', key: 'padding',
          from: 0, to: 50, step: 5, current: globalSettings.padding,
        },
        {
          type: 'slider', prompt: 'Atom font size', key: 'fontSizeLarge',
          from: 5, to: 20, step: 1, current: globalSettings.fontSizeLarge,
        },
        {
          type: 'slider', prompt: 'Counter font size', key: 'fontSizeSmall',
          from: 2, to: 10, step: 1, current: globalSettings.fontSizeSmall,
        },
        {
          type: 'slider', prompt: 'Bond thickness', key: 'bondThickness',
          from: 0.5, to: 3, step: 0.1, current: globalSettings.bondThickness,
        },
        {
          type: 'slider', prompt: 'Bond length', key: 'bondLength',
          tooltip: 'Distance between atoms.',
          from: 5, to: 100, step: 5, current: globalSettings.bondLength,
        },
        {
          type: 'slider', prompt: 'Relative length of short bond', key: 'shortBondLength',
          tooltip: 'Length of short bond relative to normal bond.',
          from: 0.5, to: 1, step: 0.1, current: globalSettings.shortBondLength,
        },
        {
          type: 'slider', prompt: 'Bond spacing', key: 'bondSpacing',
          from: 1, to: 10, step: 0.1, current: globalSettings.bondSpacing,
        },
        // {
        //   type: 'slider', prompt: 'Width. Will only apply in note.', key: 'width',
        //   from: 50, to: 1000, step: 10, current: globalSettings.width,
        // },
        {
          type: 'slider', prompt: 'Height. Will only apply in note.', key: 'height',
          from: 50, to: 1000, step: 10, current: globalSettings.height,
        },
        {
          type: 'slider', prompt: 'Overlap sensitivity', key: 'overlapSensitivity',
          from: 0.1, to: 1, step: 0.01, current: globalSettings.overlapSensitivity,
        },
        {
          type: 'slider', prompt: 'Overlap resolution iterations', key: 'overlapResolutionIterations',
          from: 1, to: 10, step: 1, current: globalSettings.overlapResolutionIterations,
        },
      ]
    }
  ]
}

