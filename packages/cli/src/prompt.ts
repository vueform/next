import { createInterface, type Interface } from 'node:readline'

interface Waiter {
  resolve: (line: string) => void
  reject: (err: Error) => void
}

// A single shared interface with a line queue instead of rl.question():
// question() drops lines that arrive before it is called, which loses every
// answer after the first one when input is piped.
let rl: Interface | null = null
let closed = false
const lines: string[] = []
const waiters: Waiter[] = []

function open() {
  if (rl) return rl

  rl = createInterface({ input: process.stdin, output: process.stdout })

  rl.on('line', (line: string) => {
    const waiter = waiters.shift()
    if (waiter) waiter.resolve(line)
    else lines.push(line)
  })

  rl.on('close', () => {
    closed = true
    while (waiters.length) {
      waiters
        .shift()!
        .reject(new Error('Input closed before the prompt was answered.'))
    }
  })

  return rl
}

function nextLine(prompt: string): Promise<string> {
  open()

  if (lines.length) return Promise.resolve(lines.shift()!)

  if (closed) {
    return Promise.reject(
      new Error('Input closed before the prompt was answered.')
    )
  }

  rl!.setPrompt(prompt)
  rl!.prompt()

  return new Promise<string>((resolve, reject) => {
    waiters.push({ resolve, reject })
  })
}

export function closePrompts() {
  if (rl) {
    rl.close()
    rl = null
    closed = false
    lines.length = 0
  }
}

export function canPrompt() {
  return process.stdin.isTTY === true || process.env.VUEFORM_CLI_PROMPT === '1'
}

/**
 * Asks a free-text question. An empty answer falls back to `defaultValue`.
 */
export async function ask(question: string, defaultValue = '') {
  const suffix = defaultValue ? ` (${defaultValue})` : ''
  const answer = (await nextLine(`${question}${suffix} `)).trim()
  return answer || defaultValue
}

/**
 * Asks a yes/no question. An empty answer falls back to `defaultValue`.
 */
export async function confirm(question: string, defaultValue = true) {
  const suffix = defaultValue ? '(Y/n)' : '(y/N)'
  const answer = (await nextLine(`${question} ${suffix} `)).trim().toLowerCase()

  if (!answer) return defaultValue

  return answer === 'y' || answer === 'yes'
}
