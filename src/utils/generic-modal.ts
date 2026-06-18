// import {Notice, Setting} from 'obsidian'
//
// export type OutputData = string | boolean | undefined
//
// function toRecord(strings: readonly string[]): Record<string, string> {
//   let record: Record<string, string> = {}
//   for (const str of strings) record[str] = str
//   return record
// }
//
// interface BaseInput {
//   readonly type: string
//   readonly name: string
//   readonly key: string
//   readonly explanation?: string // optional long description for first time users
//   readonly current?: string | boolean // current value
//   readonly mandatory?: boolean // if true, user has to input these
//   readonly validationPattern?: RegExp
// }
//
// interface BooleanInput extends BaseInput {
//   type: 'boolean'
//   current: boolean
//   validationPattern?: never
// }
//
// interface ColorInput extends BaseInput {
//   type: 'color'
//   current: string
//   validationPattern?: never
// }
//
// interface DropdownInput extends BaseInput {
//   type: 'dropdown'
//   current: string
//   validationPattern?: never
//   readonly dropdownOptions: readonly string[]
// }
//
// interface StringInput extends BaseInput {
//   type: 'string'
//   current: string
//   validationPattern?: RegExp // optional validation pattern
// }
//
// interface MainInput extends BaseInput {
//   type: 'main'
//   mandatory: true
//   current?: never
//   validationPattern?: RegExp // optional validation pattern
// }
//
// export type AnyInput = BooleanInput | ColorInput | DropdownInput | StringInput | MainInput;
//
// interface GenericModalInput {
//   readonly description: string
//   readonly codeBlockId: string
//   readonly overwriteSettings: Readonly<AnyInput>[]
//   output: Record<string, OutputData>
// }
//
// abstract class Selector {
//   toggleActive: boolean = false
//
//   protected constructor(readonly setting: Setting, private readonly anyData: AnyInput, public output: Record<string, OutputData>, public readonly callback: GenericModal) {
//   }
//
//   private validate(value: string): boolean {
//     if (!this.anyData.validationPattern) return true
//     return this.anyData.validationPattern.test(value)
//   }
//
//   write(value: OutputData) {
//     if (typeof value === 'string' && !this.validate(value)) return
//     // if (this.output?.[this.anyData.key])
//     this.output[this.anyData.key] = value
//     this.callback.updateTextArea()
//   }
//
//   revert() {
//     // if (this.output?.[this.anyData.key])
//     this.output[this.anyData.key] = undefined
//     this.callback.updateTextArea()
//   }
//
//   addDefaultName() {
//     this.setting.setName(`Overwrite ${this.anyData.name}? Preset value is: ${this.anyData.current === '' ? 'none' : this.anyData.current}`)
//   }
//
//   addToggle() {
//     this.setting.addToggle(tc => tc
//       .setValue(this.toggleActive)
//       .onChange(async (active: boolean) => {
//         if (!active) this.revert()
//         this.toggleActive = active
//         this.draw()
//       }))
//   }
//
//   abstract draw(): void
//
//   addExplanationAsTooltip() {
//     const tooltip = this.anyData.explanation ?? 'No explanation'
//     this.setting.addExtraButton(eb => eb.setIcon('lucide-circle-question-mark').setTooltip(tooltip, {delay: -1}))
//   }
// }
//
// class BooleanSelector extends Selector {
//   private readonly initialValue: boolean
//
//   constructor(setting: Setting, readonly data: BooleanInput, output: Record<string, OutputData>, callback: GenericModal) {
//     super(setting, data, output, callback)
//     this.initialValue = data.current
//   }
//
//   draw() {
//     const {setting, initialValue} = this
//     setting.clear()
//     super.addDefaultName()
//
//     setting.addToggle(tc => tc.setValue(initialValue)
//       .onChange(async (active: boolean) => {
//         if (active === initialValue) this.revert()
//         else this.write(active)
//       }))
//
//     this.addExplanationAsTooltip()
//   }
// }
//
// class ColorSelector extends Selector {
//   constructor(setting: Setting, readonly data: ColorInput, output: Record<string, OutputData>, callback: GenericModal) {
//     super(setting, data, output, callback)
//   }
//
//   draw() {
//     const {setting, data} = this
//     setting.clear()
//     super.addDefaultName()
//     setting.addColorPicker(color => color.setValue(data.current)
//       .onChange(async (value: string) => this.write(value)))
//     this.addToggle()
//     this.addExplanationAsTooltip()
//   }
// }
//
// class DropdownSelector extends Selector {
//
//   constructor(setting: Setting, public data: DropdownInput, output: Record<string, OutputData>, callback: GenericModal) {
//     super(setting, data, output, callback)
//   }
//
//   draw() {
//     const {setting, data} = this
//     setting.clear()
//     super.addDefaultName()
//     setting.addDropdown((button) => button
//       .addOptions(toRecord(data.dropdownOptions)).setValue(data.current)
//       .onChange(async (value: string) => this.write(value))
//       .setDisabled(!this.toggleActive))
//
//     this.addToggle()
//     this.addExplanationAsTooltip()
//   }
// }
//
// class StringSelector extends Selector {
//   constructor(setting: Setting, readonly data: StringInput, output: Record<string, OutputData>, callback: GenericModal) {
//     super(setting, data, output, callback)
//   }
//
//   draw() {
//     const {setting, data} = this
//     setting.clear()
//     super.addDefaultName()
//
//     setting.addText(tc => tc
//       .setValue(data.current)
//       .onChange(async (value: string) => this.write(value))
//       .setDisabled(!this.toggleActive))
//
//     super.addToggle()
//     super.addExplanationAsTooltip()
//   }
// }
//
// class MainInputSelector extends Selector {
//   constructor(setting: Setting, readonly data: MainInput, output: Record<string, OutputData>, callback: GenericModal) {
//     super(setting, data, output, callback)
//   }
//
//   draw() {
//     const {setting, data} = this
//     setting.clear()
//     setting.setName(`Please input ${data.name}.`)
//       .addText(tc => tc.setValue('').onChange(async (value: string) => this.write(value)))
//
//     this.addExplanationAsTooltip()
//   }
// }
//
// export class GenericModal {
//   private textElement!: HTMLTextAreaElement
//
//   constructor(public contentEl: HTMLElement, public data: GenericModalInput) {
//   }
//
//   display() {
//     const {contentEl, data} = this
//     const output = data.output;
//
//     for (const overwriteSetting of data.overwriteSettings) if (overwriteSetting.type === 'main') {
//       new MainInputSelector(new Setting(contentEl), overwriteSetting as MainInput, output, this).draw()
//     }
//
//     new Setting(contentEl).setName(data.description)
//
//     for (const overwriteSetting of data.overwriteSettings) switch (overwriteSetting.type) {
//       case 'boolean':
//         new BooleanSelector(new Setting(contentEl), overwriteSetting as BooleanInput, output, this).draw()
//         break;
//       case 'color':
//         new ColorSelector(new Setting(contentEl), overwriteSetting as ColorInput, output, this).draw()
//         break;
//       case 'dropdown':
//         new DropdownSelector(new Setting(contentEl), overwriteSetting as DropdownInput, output, this).draw()
//         break;
//       case 'string':
//         new StringSelector(new Setting(contentEl), overwriteSetting as StringInput, output, this).draw()
//         break;
//       /* no 'main' here */
//     }
//
//     this.createTextArea(`\`\`\`${data.codeBlockId}\n\`\`\``)
//   }
//
//   private createTextArea(value: string) {
//     const setting = new Setting(this.contentEl)
//       .setName('Output')
//       .addTextArea(cb => {
//
//         cb.setValue(value).setDisabled(true)
//
//         this.textElement = cb.inputEl
//
//         cb.inputEl.style.width = '100%'
//         cb.inputEl.style.height = '150px' // Set a generous default height for the code block block
//         cb.inputEl.style.resize = 'vertical' // Allow the user to manually scale it vertically if they want
//       })
//
//     // 2. Clear Obsidian's default flex alignment limits on the setting container control block
//     setting.controlEl.style.width = '100%'
//     setting.controlEl.style.flexGrow = '1'
//
//     // 3. Force the setting row to stack vertically if it gets too crowded
//     setting.settingEl.style.flexDirection = 'column'
//     setting.settingEl.style.alignItems = 'stretch'
//
//     return setting
//   }
//
//   updateTextArea() {
//     new Notice('update')
//     let code = ''
//     const owSettings: Readonly<AnyInput>[] = this.data.overwriteSettings
//
//     /* add main options */
//     for (const setting of owSettings) {
//       if (!setting) continue
//       if (setting.type !== 'main') continue
//
//       const value = this.data.output[setting.key]
//       if (value) code += `${value}\n`
//     }
//
//     /* add other options */
//     for (const setting of owSettings) {
//       if (!setting) continue
//       if (setting.type === 'main') continue
//       const localValue = this.data.output[setting.key]
//       if (localValue === undefined || localValue === '') continue
//
//       const key: string = setting.key
//       const globalValue = setting.current
//
//       if (globalValue === localValue) continue
//
//       code += `${key}: ${localValue}\n`
//     }
//
//     if (this.textElement) {
//       this.textElement.value = `\`\`\`${this.data.codeBlockId}\n${code}\`\`\``
//     }
//   }
// }
