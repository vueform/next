/**
 * Dependency-free interactive list pickers (arrow keys + enter) for TTY
 * sessions. `selectFrom` resolves with the chosen item's name,
 * `multiSelectFrom` with an array of names (enter with nothing toggled picks
 * the highlighted item); both resolve with null when cancelled.
 */
export function canSelect() {
  return process.stdin.isTTY === true && process.stdout.isTTY === true
}

const dim = (text: string) => `\x1b[2m${text}\x1b[0m`

export interface SelectItem {
  name: string
  hint?: string
}

function pick(
  title: string,
  items: SelectItem[],
  multi: boolean
): Promise<string | string[] | null> {
  return new Promise<string | string[] | null>((resolve) => {
    const { stdin, stdout } = process
    const height = Math.max(3, Math.min(items.length, (stdout.rows || 24) - 4))
    const checked = new Set<number>()
    let index = 0
    let top = 0
    let rendered = 0

    const keys = multi
      ? '(↑/↓ move, space toggle, a all, enter confirm, esc cancel)'
      : '(↑/↓ move, enter select, esc cancel)'

    const render = () => {
      if (rendered) stdout.write(`\x1b[${rendered}A`)
      if (index < top) top = index
      if (index >= top + height) top = index - height + 1

      const lines = [`${title} ${dim(keys)}`]

      for (let i = top; i < Math.min(top + height, items.length); i++) {
        const item = items[i]
        const cursor = i === index ? '❯ ' : '  '
        const marker = multi ? (checked.has(i) ? '◉ ' : '◯ ') : ''
        const label = `${cursor}${marker}${item.name}`
        const hint = item.hint ? `  ${dim(item.hint)}` : ''
        lines.push(`${i === index ? `\x1b[36m${label}\x1b[0m` : label}${hint}`)
      }

      // The footer must be either always present or always absent — the
      // rerender clears exactly `rendered` lines.
      if (multi || items.length > height) {
        const parts = []
        if (multi) parts.push(`${checked.size} selected`)
        if (items.length > height) parts.push(`${index + 1}/${items.length}`)
        lines.push(dim(`  ${parts.join(' · ')}`))
      }

      stdout.write(lines.map((line) => `\x1b[2K${line}`).join('\n') + '\n')
      rendered = lines.length
    }

    const done = (value: string | string[] | null) => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
      stdout.write('\x1b[?25h')
      resolve(value)
    }

    // Returns true when the picker finished (resolved or cancelled).
    const handleKey = (key: string) => {
      if (key === '\x03' || key === 'q' || key === '\x1b') {
        done(null)
        return true
      }

      if (key === '\r' || key === '\n') {
        done(
          multi
            ? checked.size
              ? items.filter((_, i) => checked.has(i)).map((item) => item.name)
              : [items[index].name]
            : items[index].name
        )
        return true
      }

      if (key === '\x1b[A' || key === 'k') {
        index = (index - 1 + items.length) % items.length
        render()
      } else if (key === '\x1b[B' || key === 'j') {
        index = (index + 1) % items.length
        render()
      } else if (multi && key === ' ') {
        if (checked.has(index)) checked.delete(index)
        else checked.add(index)
        render()
      } else if (multi && key === 'a') {
        if (checked.size === items.length) checked.clear()
        else for (let i = 0; i < items.length; i++) checked.add(i)
        render()
      }

      return false
    }

    const onData = (buf: Buffer) => {
      // Keystrokes can arrive coalesced (fast typing, paste, piped ptys) —
      // split the chunk into arrow sequences / lone escapes / single chars.
      const data = buf.toString()
      const keys = data.match(/\x1b\[[A-Z]|\x1b|[\s\S]/g) ?? []
      let consumed = 0

      for (const key of keys) {
        consumed += key.length

        if (handleKey(key)) {
          // Hand anything typed ahead of the picker's answer back to stdin,
          // so a following prompt (e.g. clone's type question) receives it.
          if (consumed < data.length) stdin.unshift(data.slice(consumed))
          return
        }
      }
    }

    stdout.write('\x1b[?25l')
    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
    render()
  })
}

export function selectFrom(title: string, items: SelectItem[]) {
  return pick(title, items, false) as Promise<string | null>
}

export function multiSelectFrom(title: string, items: SelectItem[]) {
  return pick(title, items, true) as Promise<string[] | null>
}
