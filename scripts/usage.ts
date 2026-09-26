/**
 * Monorepo CLI help (`pnpm usage`): commands with their flags, and the selector
 * vocabulary discovered live from the workspace.
 */
import { FILES } from './api-extractor/lib/output'
import { dim, discoverPackages, green, printBanner } from './runner'

const pkgs = discoverPackages()
const groups = [...new Set(pkgs.map((p) => p.group).filter(Boolean))]
const flags = (names: string[]) => names.map((name) => `--${name}`).join(', ')
const packageList = flags(pkgs.flatMap((p) => [p.id, ...p.aliases]))
const adapterList = flags(
  pkgs
    .filter((p) => p.group === 'adapters')
    .flatMap((p) => [p.id, ...p.aliases])
)

type Flag = [name: string, description: string]

// One shared name column so command and flag descriptions align.
const NAME_WIDTH = 22

const row = (
  cmd: string,
  arg: string | null,
  description: string,
  indent = 0
) => {
  const signature = arg ? `${cmd} ${arg}` : cmd
  const pad = ' '.repeat(Math.max(NAME_WIDTH - indent - signature.length, 2))
  return `${' '.repeat(2 + indent)}${green(cmd)}${arg ? ` ${dim(arg)}` : ''}${pad}${description}`
}

const flagRows = (flags: Flag[]) =>
  flags
    .map(
      ([name, flagDescription]) =>
        `    ${name.padEnd(NAME_WIDTH - 2)}${dim(flagDescription)}`
    )
    .join('\n')

const line = (
  cmd: string,
  arg: string | null,
  description: string,
  flags: Flag[] = []
) => {
  const head = row(cmd, arg, description)
  return flags.length ? `${head}\n${flagRows(flags)}\n` : `${head}\n`
}

const resume: Flag = [
  '--resume',
  'continue a previously failed run from its failed task',
]

printBanner()
console.log(
  [
    'Vueform monorepo CLI',
    '',
    `${dim('Usage:')} pnpm <command> [selectors] [flags]`,
    '',
    dim('Commands:'),
    line(
      'build',
      '[packages]',
      'build packages (utils → core → adapters → plugins → …)',
      [resume]
    ),
    line(
      'check',
      '[packages]',
      'typecheck every package program plus the root and node programs',
      [
        ['--root', 'the root tsconfig program'],
        ['--node', 'the node tsconfig program'],
        resume,
      ]
    ),
    line(
      'test',
      '[packages]',
      'run package test suites; warns land in .output/test-issues.md',
      [resume]
    ),
    line(
      'lint',
      '[packages]',
      'eslint + stylelint per target, gathering all issues',
      [
        ['--root', 'everything outside packages'],
        ['--fix', 'apply autofixes'],
      ]
    ),
    line('format', '[packages]', 'prettier per target', [
      ['--root', 'everything outside packages'],
      ['--check', 'check instead of write'],
    ]),
    line(
      'fix',
      '[packages]',
      'eslint --fix + stylelint --fix + prettier --write',
      [['--root', 'everything outside packages']]
    ),
    line(
      'verify',
      '[packages]',
      'lint → format check → typecheck → build → test, abort on dirty gates',
      [['--fix', 'apply lint autofixes and write formatting'], resume]
    ),
    line(
      'registry',
      '[adapter]',
      'regenerate the adapter(s) committed .registry folder'
    ),
    [
      row(
        'extract',
        '[targets]',
        'extract api jsons of core + the adapters into .api/'
      ),
      flagRows([
        ['--core, --ui, --pv', 'narrow the extracted sources'],
      ] as Flag[]),
      row('extract:validate', null, 'validate .api/ against the schemas'),
      row('extract:issues', null, 'print the undocumented items collected'),
    ].join('\n') + '\n',
    [
      row(
        'pg',
        '[adapter]',
        'playground dev server (created + installed when missing)'
      ),
      flagRows([
        ['--nuxt', 'nuxt mode'],
        ['--vapor', 'vapor mode'],
        ['--force', 'force the action'],
      ]),
      row('pg:up', '[adapter]', 'assemble + install a playground'),
      row(
        'pg:down',
        '[adapter]',
        'tear down playgrounds (all when nothing is selected)'
      ),
      row('pg:re', '[adapter]', 'recreate playgrounds'),
      row('pg:build', '[adapter]', 'build playgrounds'),
      row('pg:pre', '[adapter]', 'build + preview server'),
    ].join('\n') + '\n',
    `[packages]${dim(': package names or groups (runs all when omitted)')}`,
    `  ${packageList}`,
    `  ${flags(groups as string[])}`,
    '',
    `[adapter]${dim(': vueform adapters')}`,
    `  ${adapterList}`,
    '',
    `[targets]${dim(': extract output files (runs all when omitted)')}`,
    `  ${flags([...FILES])}`,
  ].join('\n')
)
