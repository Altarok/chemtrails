import {Notice} from 'obsidian'

/* Milliseconds to show popups */
const short: number = 1000
const long: number = 2000

export const Popup = {
  ok,
  warn,
  nok
}

function ok(input: string) {
  new Notice(input, short)
}

function warn(input: string) {
  new Notice(input, long)
}

/** Trigger standardized error Notice
 * @param input should not end on a dot
 * @param err should be a caught Error */
function nok(input: string, err: Error | unknown) {
  if (err instanceof Error) {
    new Notice(`${input}: ${err.message}`, long)
  } else {
    new Notice(`${input} due to an unknown error.`, long)
  }
}

