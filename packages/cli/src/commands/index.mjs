import { clone } from './clone.mjs'
import { copy } from './copy.mjs'
import { info } from './info.mjs'
import { list } from './list.mjs'
import { register } from './register.mjs'
import { remove } from './remove.mjs'
import { view } from './view.mjs'

/**
 * Command registry. Add a new command by creating a module in this directory
 * that exports `{ name, usage, description, valueFlags?, flags?, examples?,
 * run({ positionals, flags, out }) }` and listing it here.
 */
export const commands = {
  [copy.name]: copy,
  [clone.name]: clone,
  [remove.name]: remove,
  [view.name]: view,
  [register.name]: register,
  [list.name]: list,
  [info.name]: info,
}
