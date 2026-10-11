import type { Command } from '../types.js'
import { clone } from './clone.js'
import { copy } from './copy.js'
import { info } from './info.js'
import { list } from './list.js'
import { register } from './register.js'
import { remove } from './remove.js'
import { view } from './view.js'

/**
 * Command registry. Add a new command by creating a module in this directory
 * that exports `{ name, usage, description, valueFlags?, flags?, examples?,
 * run({ positionals, flags, out }) }` and listing it here.
 */
export const commands: Record<string, Command> = {
  [copy.name]: copy,
  [clone.name]: clone,
  [remove.name]: remove,
  [view.name]: view,
  [register.name]: register,
  [list.name]: list,
  [info.name]: info,
}
