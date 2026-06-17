import {Setting} from "obsidian";

interface BaseInput {
  pattern?: string; // optional validation pattern
  mandatory?: boolean; // set by dev
  skipped?: boolean; // set by user if mandatory is false; to instead use global setting
}

interface StandardInput extends BaseInput {
  type: 'color' | 'string';
}

interface DropdownInput extends BaseInput {
  type: 'dropdown';
  dropdownOptions: readonly string[];
}

interface OptionalOverwriteSettings {
  readonly name: string
  readonly description: string
  readonly explanation?: string // optional long description for first time users
  readonly current: string // current value
  readonly input: Readonly<StandardInput | DropdownInput>
}

function displayInitialDescription(contentEl: HTMLElement, desc: string) {
  contentEl.setText(desc)
}

/*
ReadonlyArray<Readonly<OptionalOverwriteSettings>>
 */

function displayOptionalOverwriteSettings(contentEl: HTMLElement, data: Readonly<OptionalOverwriteSettings>) {

  new Setting(contentEl)
  .addToggle(tc => tc.setValue(false))
  .addText(txt => txt.setValue(`Overwrite ${data.name}? Global setting is: '${data.current}'.`))

}

export const GenericModal = {
  displayInitialDescription,
  displayOptionalOverwriteSettings
}
