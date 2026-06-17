import {Setting} from "obsidian";

function toRecord(strings: readonly string[]): Record<string, string> {
  let record: Record<string, string> = {}
  for (const str of strings) record[str] = str
  return record
}

interface BaseInput {
  readonly name: string
  // readonly description: string
  readonly explanation?: string // optional long description for first time users
  readonly current: string // current value
  readonly mandatory?: boolean; // if true, user has to input these
  readonly validationPattern?: RegExp
}

interface ColorInput extends BaseInput {
  type: 'color';
  validationPattern?: never
}

interface DropdownInput extends BaseInput {
  type: 'dropdown';
  validationPattern?: never
  readonly dropdownOptions: readonly string[];
}

interface StringInput extends BaseInput {
  type: 'string';
  validationPattern?: RegExp; // optional validation pattern
}

interface MainInput extends BaseInput {
  type: 'main'
  mandatory: true
  current: ''
  validationPattern?: RegExp; // optional validation pattern
}

export type AnyInput = ColorInput | DropdownInput | StringInput | MainInput;

interface GenericModalInput {
  readonly description: string
  readonly overwriteSettings: Readonly<AnyInput>[]
  output: Record<string, string>
}


abstract class Selector {
  toggleActive: boolean = false

  protected constructor(readonly setting: Setting, private readonly anyData: AnyInput, public output: Record<string, string | undefined>) {
  }

  private validate(value: string): boolean {
    if (!this.anyData.validationPattern) return true
    return this.anyData.validationPattern.test(value)
  }

  write(value: string) {
    const {output, anyData} = this
    if (!this.validate(value)) return
    if (output?.[anyData.name]) output[anyData.name] = value
  }

  revert() {
    const {output, anyData} = this
    if (output?.[anyData.name]) output[anyData.name] = ''
  }

  addToggle() {
    this.setting.addToggle(tc =>
      tc
      .setValue(this.toggleActive)
      .onChange(async (active: boolean) => {
        if (!active) this.revert()
        this.toggleActive = active
        this.draw()
      }))
  }

  abstract draw(): void

  addExplanationAsTooltip() {
    const tooltip = this.anyData.explanation ?? 'No explanation'
    this.setting.addExtraButton(eb => eb.setIcon('lucide-circle-question-mark').setTooltip(tooltip, {delay: -1}))
  }

}

class ColorSelection extends Selector {

  constructor(setting: Setting, readonly data: ColorInput, output: Record<string, string>) {
    super(setting, data, output)
  }

  draw() {
    const {setting, data} = this
    setting.clear()
    setting
    .setName(`Overwrite ${data.name}? Global setting is: ${data.current === '' ? 'none' : data.current}.`)
    .addColorPicker(color =>
      color
      .setValue(data.current)
      .onChange(async (value: string) => {
        this.write(value)
      })
    )

    this.addToggle()
    this.addExplanationAsTooltip()
  }
}

class DropdownSelection extends Selector {

  constructor(setting: Setting, public data: DropdownInput, output: Record<string, string>) {
    super(setting, data, output)
  }

  draw() {
    const {setting, data} = this
    setting.clear()
    setting
    .setName(`Overwrite ${data.name}? Global setting is: ${data.current === '' ? 'none' : data.current}.`)
    .addDropdown((button) =>
      button
      .addOptions(toRecord(data.dropdownOptions)).setValue(data.current)
      .onChange(async (value: string) =>
        this.write(value)
      )
      .setDisabled(!this.toggleActive))

    this.addToggle()
    this.addExplanationAsTooltip()
  }
}


class StringSelection extends Selector {

  constructor(setting: Setting, readonly data: StringInput, output: Record<string, string | undefined>) {
    super(setting, data, output)
  }

  draw() {
    const {setting, data} = this
    setting.clear()
    setting
    .setName(`Overwrite ${data.name}? Global setting is: ${data.current === '' ? 'none' : data.current}.`)
    .addText(tc =>
      tc
      .setValue(data.current)
      .onChange(async (value: string) => {
        this.write(value)
      })
      .setDisabled(!this.toggleActive)
    )

    this.addToggle()
    this.addExplanationAsTooltip()
  }
}

class MainInputSelector extends Selector {

  constructor(setting: Setting, readonly data: MainInput, output: Record<string, string | undefined>) {
    super(setting, data, output)
  }

  draw() {
    const {setting, data} = this
    setting.clear()
    setting
    .setName(`Please input ${data.name}. This is mandatory`)
    .addText(tc =>
      tc
      .setValue('')
      .onChange(async (value: string) => {
        this.write(value)
      })
    )

    // this.addToggle() // no toggle in this case!
    this.addExplanationAsTooltip()
  }
}


function display(contentEl: HTMLElement, data: GenericModalInput) {

  contentEl.setText(data.description)

  let output = data.output;

  for (const overwriteSetting of data.overwriteSettings) {

    switch (overwriteSetting.type) {
      case "color":
        new ColorSelection(new Setting(contentEl), overwriteSetting as ColorInput, output).draw()
        break;
      case "dropdown":
        new DropdownSelection(new Setting(contentEl), overwriteSetting as DropdownInput, output).draw()
        break;
      case "string":
        new StringSelection(new Setting(contentEl), overwriteSetting as StringInput, output).draw()
        break;
      case "main":
        new MainInputSelector(new Setting(contentEl), overwriteSetting as MainInput, output).draw()
        break;
      default:
        throw new Error('Unexpected input type')
    }
  }

}

export const GenericModal = {
  display
}
