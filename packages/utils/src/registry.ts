/**
 * Generates a package's component registry (<package>/.registry, committed —
 * referenceable on GitHub) — the manifests and copy-ready source files consumed
 * by the Vueform CLI's `copy` command.
 *
 * Copy-ready means the emitted SFCs are written verbatim by the CLI: internal
 * `~/` imports are rewritten here to the adapter's public subpaths, and a
 * breadcrumb comment points users at the type-augmentation docs. The CLI never
 * transforms code. Template components like `<VfLayout>` stay unimported on
 * purpose — they resolve through global registration like the packaged
 * originals, so locally copied collaborators override everywhere.
 *
 * Exposed as `generateRegistry` (and the `vf-registry` bin) — run from an
 * adapter package's own directory, typically via its `registry` script.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'
import prettier from 'prettier'
import ts from 'typescript'
import { parse as parseSfc } from 'vue/compiler-sfc'

const SCHEMA_VERSION = 1

interface Target {
  flag: string
  package: string
  packageDir: string
  /**
   * Directory holding the package's own component sources.
   */
  componentsDir: string
  /**
   * Fallback for components the adapter re-exports from core.
   */
  coreComponentsDir: string
  /**
   * Customization guide for copies made from this package.
   */
  docsUrl: string
  /**
   * Guide for elements cloned from this package's blueprints.
   */
  cloneDocsUrl: string
  /**
   * Root of the adapter's docs site (for @see links in clone templates).
   */
  docsBase: string
}

interface ImportGroup {
  specifier: string
  defaultName: string | null
  named: Map<string, { rendered: string; typeOnly: boolean }>
}

let repoRoot = ''

/**
 * Per-adapter component descriptions, keyed by the target flag (ui, primevue,
 * ...).
 */
function loadDescriptions(flag: string): Record<string, string> | null {
  const dataPath = path.join(repoRoot, 'scripts/data/components.json')
  if (!fs.existsSync(dataPath)) {
    console.warn(
      `[registry] no ${path.relative(repoRoot, dataPath)} — descriptions fall back to defaults`
    )
    return null
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  return data[flag] ?? {}
}

// Components excluded per target because their emitted copies don't
// typecheck in user projects yet (none currently).
const EXCLUDED_COMPONENTS: Record<string, Set<string>> = {}

function targetFromPackageDir(packageDir: string): Target {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  )
  if (manifest.vueform?.group !== 'adapters') {
    throw new Error(
      `${manifest.name}: the registry generator runs for adapter packages only`
    )
  }
  const dir = path.basename(packageDir)
  const flag = dir

  return {
    flag,
    package: `@vueform/${dir}`,
    packageDir,
    componentsDir: path.join(packageDir, 'src/components'),
    coreComponentsDir: path.join(repoRoot, 'packages/core/src/components'),
    docsUrl: `https://${dir}.vueform.com/guide/components#building-on-blueprints`,
    cloneDocsUrl: `https://${dir}.vueform.com/guide/components#building-on-blueprints`,
    docsBase: `https://${dir}.vueform.com`,
  }
}

/**
 * All copyable components of a target: every Vf* directory the PACKAGE exposes
 * (its own src/components — the adapter's component set, not core's;
 * re-exported components resolve their SFC source to core via resolveSfcPath).
 */
function discoverComponents(target: Target): string[] {
  const names = new Set<string>()
  const excluded = EXCLUDED_COMPONENTS[target.flag] ?? new Set()

  for (const entry of fs.readdirSync(target.componentsDir)) {
    if (
      entry.startsWith('Vf') &&
      fs.statSync(path.join(target.componentsDir, entry)).isDirectory()
    ) {
      if (excluded.has(entry)) {
        console.warn(
          `[registry] ${target.package}: skipping ${entry} (excluded — see EXCLUDED_COMPONENTS)`
        )
        continue
      }
      names.add(entry)
    }
  }

  return [...names].sort().filter((name) => {
    try {
      resolveSfcPath(target, name)
      return true
    } catch {
      return false
    }
  })
}

/**
 * Resolves the component's true SFC source, following adapter re-exports to
 * core.
 */
function resolveSfcPath(target: Target, name: string): string {
  const own = path.join(target.componentsDir, name, `${name}.vue`)
  if (fs.existsSync(own)) return own

  const core = path.join(target.coreComponentsDir, name, `${name}.vue`)
  if (fs.existsSync(core)) return core

  throw new Error(
    `${name}: no ${name}.vue found in ${target.package} or @vueform/core`
  )
}

/**
 * Maps an internal import specifier to the adapter's public one.
 */
function rewriteSpecifier(
  spec: string,
  target: Target,
  component: string
): string {
  if (spec === './types') return `${target.package}/components/${component}`
  // Sibling SFC (e.g. VfForm's FormNav.vue) — copied next to the component,
  // so the relative import survives as-is.
  if (/^\.\/[\w-]+\.vue$/.test(spec)) return spec
  // Internal alias prefixes: the legacy `~/` / `@/` forms plus the current
  // `#<package>/` scheme (`#primevue/...`, and `#core/...` inside components
  // an adapter re-exports from core).
  const internal = /^(?:~|@|#[\w-]+)\/(.+)$/.exec(spec)
  if (internal) {
    const sub = internal[1]
    const blueprint = /^blueprints\/(.+)$/.exec(sub)
    if (blueprint) return `${target.package}/blueprints/${blueprint[1]}`
    // A sibling component's types (e.g. VfCheckboxes building on VfCheckbox's).
    const componentTypes = /^components\/(Vf\w+)(?:\/types)?$/.exec(sub)
    if (componentTypes) {
      return `${target.package}/components/${componentTypes[1]}`
    }
    if (
      /^(composables|helpers|types|features|utils|contexts|directives)(\/.+)?$/.test(
        sub
      )
    ) {
      return target.package
    }
  }
  // Adapters re-export core's root API; user projects only depend on the
  // adapter, so bare core imports rewrite to it.
  if (spec === '@vueform/core' && target.package !== '@vueform/core') {
    return target.package
  }
  if (/^(~\/|@\/|#|\.)/.test(spec)) {
    throw new Error(`${component}: no public rewrite rule for import '${spec}'`)
  }
  return spec
}

function renderImport(group: ImportGroup): string {
  const named = [...group.named.values()]
  const parts: string[] = []

  if (group.defaultName) parts.push(group.defaultName)

  if (named.length) {
    const allTypes = !group.defaultName && named.every((n) => n.typeOnly)
    const body = named
      .map((n) => (n.typeOnly && !allTypes ? `type ${n.rendered}` : n.rendered))
      .join(', ')
    const head = allTypes ? 'import type' : 'import'
    return `${head} ${parts.length ? `${parts[0]}, ` : ''}{ ${body} } from '${group.specifier}'`
  }

  if (group.defaultName)
    return `import ${group.defaultName} from '${group.specifier}'`

  return `import '${group.specifier}'`
}

/**
 * Rewrites and merges the script-setup imports, returning the new script
 * content and the list of final import specifiers.
 */
/**
 * The adapter's per-component theme chunk imports (components/<name>/styles.ts)
 * — copies must carry them explicitly so they stay styled when the packaged
 * entry (which imports the same chunks) is no longer in the app's graph.
 * Bundlers dedupe them against packaged components' imports.
 */
function styleImports(target: Target, component: string): string[] {
  const stylesPath = path.join(target.componentsDir, component, 'styles.ts')
  if (!fs.existsSync(stylesPath)) return []
  const source = fs.readFileSync(stylesPath, 'utf8')
  // Relative scss chunk imports map to the published subpaths, exactly like
  // vfbuild rewrites them in dist.
  return [...source.matchAll(/import\s+['"]([^'"]+\.s?css)['"]/g)].map((m) => {
    const chunk = /\/scss\/([\w-]+)\.scss$/.exec(m[1])
    return chunk ? `${target.package}/${chunk[1]}.css` : m[1]
  })
}

// The blueprint exports every component re-exports from its public subpath —
// blueprint-only exports (helpers, extra types) keep the blueprints specifier.
const BLUEPRINT_REEXPORTS = new Set(['defaults', 'blueprint'])

/**
 * The component a blueprint specifier belongs to (`…/blueprints/date-picker` →
 * `VfDatePicker`), or null for non-blueprint specifiers.
 */
function blueprintComponent(spec: string): string | null {
  const match = /\/blueprints\/([\w-]+)$/.exec(spec)
  if (!match) return null
  return `Vf${match[1]
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('')}`
}

/**
 * Collects the script's imports into per-(rewritten-)specifier groups and
 * returns the import-free body — the shared front half of copy and clone
 * emission.
 *
 * With `mergeOwnBlueprint` (copies only), `defaults` / `blueprint` imported
 * from the component's OWN blueprint move to the component's public subpath,
 * which re-exports them — clones must not set it: importing the component
 * module would also register the base component's global types.
 */
function collectImports(
  content: string,
  target: Target,
  component: string,
  extraSideEffects: string[] = [],
  mergeOwnBlueprint = false
): { groups: Map<string, ImportGroup>; body: string } {
  const source = ts.createSourceFile(
    'x.ts',
    content,
    ts.ScriptTarget.Latest,
    true
  )
  const groups = new Map<string, ImportGroup>()
  const ranges: Array<[number, number]> = []
  // Specifiers imported purely for side effects — an import group emptied by
  // the own-blueprint merge must not survive as one of these.
  const sideEffectSpecs = new Set<string>()

  const groupFor = (specifier: string) => {
    let group = groups.get(specifier)
    if (!group) {
      group = { specifier, defaultName: null, named: new Map() }
      groups.set(specifier, group)
    }
    return group
  }

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue

    const spec = (statement.moduleSpecifier as ts.StringLiteral).text
    const rewritten = rewriteSpecifier(spec, target, component)
    ranges.push([statement.getStart(source), statement.end])

    const group = groupFor(rewritten)
    const ownBlueprint =
      mergeOwnBlueprint && blueprintComponent(rewritten) === component

    const clause = statement.importClause
    if (!clause) {
      sideEffectSpecs.add(rewritten)
      continue // side-effect import
    }

    if (clause.name) {
      if (group.defaultName && group.defaultName !== clause.name.text) {
        throw new Error(
          `${component}: conflicting default imports for '${rewritten}'`
        )
      }
      group.defaultName = clause.name.text
    }

    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) {
        throw new Error(
          `${component}: namespace imports are not supported ('${spec}')`
        )
      }
      for (const el of clause.namedBindings.elements) {
        const rendered = el.propertyName
          ? `${el.propertyName.text} as ${el.name.text}`
          : el.name.text
        const typeOnly = clause.isTypeOnly || el.isTypeOnly
        const exported = el.propertyName?.text ?? el.name.text
        const bucket =
          ownBlueprint && !typeOnly && BLUEPRINT_REEXPORTS.has(exported)
            ? groupFor(`${target.package}/components/${component}`)
            : group
        const existing = bucket.named.get(rendered)
        bucket.named.set(rendered, {
          rendered,
          typeOnly: existing ? existing.typeOnly && typeOnly : typeOnly,
        })
      }
    }
  }

  // Drop groups the merge emptied — rendering them would fabricate
  // side-effect imports.
  for (const [spec, group] of groups) {
    if (!group.defaultName && !group.named.size && !sideEffectSpecs.has(spec)) {
      groups.delete(spec)
    }
  }

  // Body = original content minus the import statements.
  let body = ''
  let cursor = 0
  for (const [start, end] of ranges) {
    body += content.slice(cursor, start)
    cursor = end
  }
  body += content.slice(cursor)
  body = body.replace(/\n{3,}/g, '\n\n').replace(/^\s+/, '')

  for (const spec of extraSideEffects) {
    if (!groups.has(spec)) {
      groups.set(spec, { specifier: spec, defaultName: null, named: new Map() })
    }
  }

  return { groups, body }
}

function rewriteScript(
  content: string,
  target: Target,
  component: string,
  withBreadcrumb: boolean,
  extraSideEffects: string[] = []
): { content: string; imports: string[] } {
  const { groups, body } = collectImports(
    content,
    target,
    component,
    extraSideEffects,
    true
  )

  const importBlock = [...groups.values()].map(renderImport).join('\n')
  const breadcrumb = withBreadcrumb
    ? `/**\n * Local copy of ${component} of Vueform. How to customize it:\n * ${target.docsUrl}\n */\n\n`
    : ''

  return {
    content: `\n${breadcrumb}${importBlock}\n\n${body}`,
    imports: [...groups.keys()],
  }
}

/**
 * Emits one SFC file (a component's main SFC or a sibling like FormNav.vue).
 */
function emitSfc(
  target: Target,
  component: string,
  sfcPath: string,
  withBreadcrumb: boolean,
  extraSideEffects: string[] = []
) {
  const fileName = path.basename(sfcPath)
  const sfcSource = fs.readFileSync(sfcPath, 'utf8')
  const { descriptor, errors } = parseSfc(sfcSource, { filename: fileName })

  if (errors.length)
    throw new Error(`${fileName}: SFC parse errors: ${errors.join(', ')}`)
  if (descriptor.script)
    throw new Error(`${fileName}: plain <script> blocks are not supported yet`)
  if (!descriptor.scriptSetup)
    throw new Error(`${fileName}: no <script setup> block`)

  const block = descriptor.scriptSetup
  // Note: `<VfLayout>` (and any other Vf* used in templates) is deliberately
  // NOT imported explicitly — copies resolve it through global registration,
  // exactly like the packaged originals, so a locally copied VfLayout
  // registered via the barrel overrides it everywhere at once.
  const rewritten = rewriteScript(
    block.content,
    target,
    component,
    withBreadcrumb,
    extraSideEffects
  )

  const emitted =
    sfcSource.slice(0, block.loc.start.offset) +
    rewritten.content +
    sfcSource.slice(block.loc.end.offset)

  return { fileName, emitted, imports: rewritten.imports }
}

/**
 * Emits a component's main SFC plus any sibling SFCs it imports relatively
 * (e.g. VfForm's FormNav.vue / FormStep.vue), which are copied next to it.
 */
function emitComponent(target: Target, name: string) {
  const sfcPath = resolveSfcPath(target, name)
  const main = emitSfc(target, name, sfcPath, true, styleImports(target, name))
  const files = [main]

  const siblings = main.imports.filter((spec) => /^\.\/[\w-]+\.vue$/.test(spec))

  for (const sibling of siblings) {
    files.push(
      emitSfc(target, name, path.join(path.dirname(sfcPath), sibling), false)
    )
  }

  const imports = [
    ...new Set(
      files
        .flatMap((file) => file.imports)
        .filter((spec) => !spec.startsWith('.'))
    ),
  ]

  return { files, imports }
}

// ============ CLONE TEMPLATES ============
//
// A clone template is a ready-to-instantiate NEW element built on an existing
// element's blueprint (`vueform clone`): the component's public interfaces are
// inlined into <script setup> under the clone's own name (extending the
// blueprint types and the original's Parts/Classes/Expose), and a plain
// <script> block registers the clone in the ControlRegistry + GlobalComponents.
// `VfCloneName` / `__TYPE__` are the CLI's substitution placeholders (the
// name placeholder is identifier-shaped on purpose: a bare `__NAME__` in doc
// prose would be normalized to `**NAME**` markdown bold by the formatter).

const CLONE_SUFFIXES = [
  'Props',
  'Emits',
  'Slots',
  'Parts',
  'Classes',
  'Expose',
  'Context',
]

/**
 * Options for `generateRegistry`.
 */
export interface RegistryOptions {
  /**
   * The adapter package's directory (usually `process.cwd()`).
   */
  packageDir: string
  /**
   * Component names to (re)generate; every discovered component when empty.
   */
  components?: string[]
  /**
   * Typecheck the emitted files against the adapter's playground afterwards.
   */
  check?: boolean
}

function collectIdentifiers(node: ts.Node, into: Set<string>) {
  if (ts.isIdentifier(node)) into.add(node.text)
  node.forEachChild((child) => collectIdentifiers(child, into))
}

/**
 * Renames the component's own type family (and its bare name, e.g. in docs) to
 * the **NAME** placeholder. Word boundaries keep VfText from eating VfTextarea:
 * the optional suffix must match completely or not at all.
 */
function renameFamily(text: string, name: string): string {
  return text.replace(
    new RegExp(
      `\\b${name}(Props|Emits|Slots|Parts|Classes|Expose|Context|Entry)?\\b`,
      'g'
    ),
    (_m, suffix) => `VfCloneName${suffix ?? ''}`
  )
}

/**
 * Builds the clone template for one element, or null (with a warning) when the
 * component isn't an element or doesn't follow the standard type-family shape.
 */
function emitCloneTemplate(
  target: Target,
  name: string
): { content: string; blueprint: string } | null {
  const sfcPath = resolveSfcPath(target, name)
  const sfcSource = fs.readFileSync(sfcPath, 'utf8')
  const { descriptor, errors } = parseSfc(sfcSource, {
    filename: `${name}.vue`,
  })

  if (errors.length || !descriptor.scriptSetup) return null

  const setup = descriptor.scriptSetup
  const setupAst = ts.createSourceFile(
    'setup.ts',
    setup.content,
    ts.ScriptTarget.Latest,
    true
  )

  // Elements only — detected from defineOptions({ element: true }).
  let isElement = false
  let withDefaultsArg: ts.Expression | null = null
  let useBlueprintCall: ts.CallExpression | null = null
  let useClassesCall: ts.CallExpression | null = null

  const walk = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (
        node.expression.text === 'defineOptions' &&
        node.arguments[0] &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        for (const prop of node.arguments[0].properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === 'element' &&
            prop.initializer.kind === ts.SyntaxKind.TrueKeyword
          ) {
            isElement = true
          }
        }
      }
      if (node.expression.text === 'withDefaults' && node.arguments[1]) {
        withDefaultsArg = node.arguments[1]
      }
      if (node.expression.text === 'useBlueprint') {
        useBlueprintCall = node
      }
      if (node.expression.text === 'useClasses') {
        useClassesCall = node
      }
    }
    node.forEachChild(walk)
  }
  walk(setupAst)

  if (!isElement) return null

  const skip = (reason: string) => {
    console.warn(`[registry] ${name}: no clone template (${reason})`)
    return null
  }

  let blueprint: string | null = null
  for (const statement of setupAst.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const match = /\/blueprints\/([\w-]+)$/.exec(
      (statement.moduleSpecifier as ts.StringLiteral).text
    )
    if (match) blueprint = match[1]
  }

  if (!blueprint) return skip('no blueprint import')
  if (!withDefaultsArg) return skip('no withDefaults call')

  // The type family lives in the sibling types.ts of the resolved source.
  const typesPath = path.join(path.dirname(sfcPath), 'types.ts')
  if (!fs.existsSync(typesPath)) return skip('no types.ts')

  const typesText = fs.readFileSync(typesPath, 'utf8')
  const typesAst = ts.createSourceFile(
    'types.ts',
    typesText,
    ts.ScriptTarget.Latest,
    true
  )
  const interfaces = new Map<string, ts.InterfaceDeclaration>()
  const aliases: ts.TypeAliasDeclaration[] = []
  // Local identifier -> where it comes from and how to import it (alias kept).
  const importOf = new Map<string, { spec: string; rendered: string }>()

  for (const statement of typesAst.statements) {
    if (ts.isInterfaceDeclaration(statement)) {
      interfaces.set(statement.name.text, statement)
    } else if (ts.isTypeAliasDeclaration(statement)) {
      aliases.push(statement)
    } else if (ts.isImportDeclaration(statement)) {
      const spec = rewriteSpecifier(
        (statement.moduleSpecifier as ts.StringLiteral).text,
        target,
        name
      )
      const clause = statement.importClause
      if (clause?.name)
        importOf.set(clause.name.text, { spec, rendered: clause.name.text })
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          importOf.set(el.name.text, {
            spec,
            rendered: el.propertyName
              ? `${el.propertyName.text} as ${el.name.text}`
              : el.name.text,
          })
        }
      }
    }
  }

  for (const suffix of [...CLONE_SUFFIXES, 'Entry']) {
    if (!interfaces.has(`${name}${suffix}`))
      return skip(`types.ts has no ${name}${suffix}`)
  }

  const familyNames = new Set(
    [...CLONE_SUFFIXES, 'Entry', ''].map((suffix) => `${name}${suffix}`)
  )
  const aliasNames = new Set(aliases.map((alias) => alias.name.text))

  // The element's own `type` literal — the first string-literal type argument
  // of the Props extends clause (e.g. TextProps<'text', ...>).
  const props = interfaces.get(`${name}Props`)!
  const propsHeritage = props.heritageClauses?.[0]?.types?.[0]
  let baseType: string | null = null
  let literalRange: [number, number] | null = null

  if (propsHeritage?.typeArguments) {
    for (const arg of propsHeritage.typeArguments) {
      if (ts.isLiteralTypeNode(arg) && ts.isStringLiteral(arg.literal)) {
        baseType = arg.literal.text
        literalRange = [arg.getStart(typesAst), arg.end]
        break
      }
    }
  }

  // The clone's type literal differs from the base's, so `WidenProps<X,
  // BaseProps>` must widen against BaseProps<string> — a bare reference would
  // keep the base's defaulted literal and reject the clone's own type.
  const widenInserts: number[] = []

  if (baseType) {
    const findWiden = (node: ts.Node) => {
      if (
        ts.isTypeReferenceNode(node) &&
        ts.isIdentifier(node.typeName) &&
        node.typeName.text === 'WidenProps' &&
        node.typeArguments &&
        node.typeArguments[1] &&
        ts.isTypeReferenceNode(node.typeArguments[1]) &&
        !node.typeArguments[1].typeArguments
      ) {
        widenInserts.push(node.typeArguments[1].end)
      }
      node.forEachChild(findWiden)
    }
    for (const suffix of CLONE_SUFFIXES) {
      const declared = interfaces.get(`${name}${suffix}`)
      if (declared) findWiden(declared)
    }
  }

  // Every interface gets a synthesized, task-oriented doc (the originals'
  // docs are maintainer prose): what to add here + a paste-able @example.
  const jsdoc = (lines: string[], seePath?: string) =>
    [
      '/**',
      ...lines.map((line) => (line ? ` * ${line}` : ' *')),
      ...(seePath ? [' *', ` * @see ${target.docsBase}/guide/${seePath}`] : []),
      ' */',
    ].join('\n')

  const pkg = target.package
  const interfaceDocs: Record<string, string> = {
    Props: jsdoc(['Prop definitions.', '', '@example', '  custom?: any']),
    Emits: jsdoc(
      [
        'Emit / event definitions.',
        '',
        '@example',
        '  custom: [arg1: any, arg2: any, context$: VfCloneNameContext]',
      ],
      'event-handlers'
    ),
    Slots: jsdoc(
      [
        'Slot definitions.',
        '',
        '@example',
        "  custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]",
      ],
      'slots'
    ),
    Parts: jsdoc(
      [
        'Part definitions.',
        '',
        '@example',
        `  tag: import('${pkg}').DomAttrsOf<'div'>`,
        `  component: import('${pkg}').PartOf<'VfButton'>`,
      ],
      'parts'
    ),
    Classes: jsdoc(
      [
        'Class definitions.',
        '',
        '@example',
        `  plain: import('${pkg}').ClassValue`,
        `  dynamic: (arg1: any, arg2: any) => import('${pkg}').ClassValue`,
      ],
      'classes'
    ),
    Expose: jsdoc(
      [
        "Custom exposed API members. Add props you return from useBlueprint's",
        "5th 'extend' callback.",
        '',
        '@example',
        '  plain: string',
        "  vueRef: import('vue').Ref<string>",
        '  method: (arg1: any, arg2: any) => string',
      ],
      'components#expose-interface'
    ),
    Context: jsdoc([
      "The element's context — the object slots, outlets, and event handlers",
      'receive (`context$`). Its shape is derived from the blueprint and the',
      "interfaces above — customize those; don't extend or edit this one.",
    ]),
  }

  const interfaceText = (suffix: string) => {
    const node = interfaces.get(`${name}${suffix}`)!
    const from = node.getStart(typesAst)
    let text = typesText.slice(from, node.end)
    const edits: Array<[number, number, string]> = widenInserts
      .filter((pos) => pos > from && pos <= node.end)
      .map((pos) => [pos, pos, '<string>'] as [number, number, string])
    if (suffix === 'Props' && literalRange) {
      edits.push([literalRange[0], literalRange[1], "'__TYPE__'"])
    }
    for (const [start, end, insert] of edits.sort((a, b) => b[0] - a[0])) {
      text = text.slice(0, start - from) + insert + text.slice(end - from)
    }
    return `${interfaceDocs[suffix]}\n${text.trimEnd()}`
  }

  // Every interface is reproduced under the clone's name — Parts / Classes /
  // Expose included: a clone is a new element built on the BLUEPRINT, so it
  // composes the same blueprint + feature types the original did instead of
  // extending the original component's interfaces (which would also inherit
  // any user augmentations of that component).
  const interfaceBlock = CLONE_SUFFIXES.map((suffix) =>
    renameFamily(interfaceText(suffix), name)
  ).join('\n\n')

  // withDefaults gets the clone's `type` spliced in — nothing else; any other
  // default (inputType etc.) is the user's to customize afterwards.
  const overrides = ["type: '__TYPE__',"]
  const arg: ts.Expression = withDefaultsArg
  const argStart = arg.getStart(setupAst)
  let replacement: string

  if (ts.isIdentifier(arg)) {
    replacement = `{\n    ...${arg.text},\n    ${overrides.join('\n    ')}\n  }`
  } else if (ts.isObjectLiteralExpression(arg)) {
    const inner = setup.content
      .slice(argStart + 1, arg.end - 1)
      .replace(/[\s,]*$/, ',')
    replacement = `{${inner}\n    ${overrides.join('\n    ')}\n  }`
  } else {
    return skip(
      'withDefaults argument is neither an identifier nor an object literal'
    )
  }

  // The extend-callback pattern is documented at the call site instead of
  // shipping an empty 5th argument (nothing dead at runtime, nothing whose
  // void return the types would have to tolerate forever).
  const useBlueprintDoc = jsdoc(
    [
      "Extend the element's API by passing a 5th 'extend' callback to",
      'useBlueprint — whatever it returns merges into the api / expose',
      '(declare the members on VfCloneNameExpose above).',
      '',
      '@example',
      '  useBlueprint(blueprint, props, events, slots, () => ({',
      "    plain: '',",
      "    vueRef: ref(''),",
      "    method: (arg1: any, arg2: any) => '',",
      '  }))',
    ],
    'components#extending-the-logic'
  )

  const useClassesDoc = jsdoc(
    [
      "The element's own classes, per part — reactive via the callback's api",
      'refs. The class keys come from VfCloneNameClasses above.',
    ],
    'classes'
  )

  const setupEdits: Array<[number, number, string]> = [
    [argStart, arg.end, replacement],
  ]
  const docAt = (call: ts.CallExpression, doc: string) => {
    let statement: ts.Node = call
    while (statement.parent && !ts.isSourceFile(statement.parent))
      statement = statement.parent
    const at = statement.getStart(setupAst)
    setupEdits.push([at, at, `${doc}\n`])
  }

  if (useBlueprintCall) docAt(useBlueprintCall, useBlueprintDoc)
  if (useClassesCall) docAt(useClassesCall, useClassesDoc)

  let setupContent = setup.content
  for (const [start, end, insert] of setupEdits.sort((a, b) => b[0] - a[0])) {
    setupContent =
      setupContent.slice(0, start) + insert + setupContent.slice(end)
  }

  // Imports: the SFC's own (minus the ./types family, which is now inlined)
  // plus everything the inlined interfaces reference — all blueprint / feature
  // level; the original component's module is not imported at all.
  const { groups, body } = collectImports(
    setupContent,
    target,
    name,
    styleImports(target, name)
  )
  const componentSpec = `${target.package}/components/${name}`
  const componentGroup = groups.get(componentSpec)

  if (componentGroup) {
    for (const rendered of [...componentGroup.named.keys()]) {
      if (familyNames.has(rendered)) componentGroup.named.delete(rendered)
    }
    if (!componentGroup.named.size && !componentGroup.defaultName) {
      groups.delete(componentSpec)
    }
  }

  const setupDeps = new Set<string>()
  for (const suffix of CLONE_SUFFIXES) {
    collectIdentifiers(interfaces.get(`${name}${suffix}`)!, setupDeps)
  }

  const importedLocals = new Set(
    [...groups.values()].flatMap((group) =>
      [...group.named.values()].map((named) =>
        named.rendered.split(' as ').pop()!
      )
    )
  )

  for (const dep of [...setupDeps].sort()) {
    if (familyNames.has(dep) || aliasNames.has(dep) || importedLocals.has(dep))
      continue
    const source = importOf.get(dep)
    if (!source) continue
    let group = groups.get(source.spec)
    if (!group) {
      group = { specifier: source.spec, defaultName: null, named: new Map() }
      groups.set(source.spec, group)
    }
    group.named.set(source.rendered, {
      rendered: source.rendered,
      typeOnly: true,
    })
    importedLocals.add(dep)
  }

  const breadcrumb = jsdoc(
    [
      `VfCloneName — a custom element created from Vueform's \`${blueprint}\` blueprint.`,
    ],
    'components#building-on-blueprints'
  )
  const importBlock = [...groups.values()].map(renderImport).join('\n')
  const newSetup = `\n${breadcrumb}\n\n${importBlock}\n\n${interfaceBlock}\n\n${renameFamily(body, name)}`

  // Plain <script>: the entry helpers plus the registry / GlobalComponents
  // augmentations that make the clone a first-class element.
  const entry = interfaces.get(`${name}Entry`)!
  const entryHeritage = entry.heritageClauses?.[0]?.types?.[0]
  if (!entryHeritage) return skip(`${name}Entry has no extends clause`)

  // The augmentation's parameter list must be IDENTICAL across every
  // ControlRegistry declaration in a program or TS2428 rejects the merge —
  // normalize the Entry interface's parameter name to core's `TEntry` (some
  // entries use `_TEntry` when unused).
  const rawParamName = entry.typeParameters?.[0]?.name.text ?? 'TEntry'
  const normalizeParam = (text: string) =>
    text.replace(new RegExp(`\\b${rawParamName}\\b`, 'g'), 'TEntry')
  const entryParam = normalizeParam(
    entry.typeParameters?.[0]?.getText(typesAst) ??
      'TEntry = Record<string, any>'
  )
  const entryText = normalizeParam(
    renameFamily(entryHeritage.getText(typesAst), name)
  )

  // Helper aliases are emitted code-only — their source docs are registry
  // narrowing prose that means nothing to a clone's owner.
  const helperTexts = aliases.map((alias) => {
    const text = typesText
      .slice(alias.getStart(typesAst), alias.end)
      .trimEnd()
      .replace(/^export type /, 'type ')
    return renameFamily(text, name)
  })

  const scriptDeps = new Set<string>()
  for (const alias of aliases) collectIdentifiers(alias, scriptDeps)
  collectIdentifiers(entryHeritage, scriptDeps)

  // The two script blocks share one module scope — only import what the
  // setup block doesn't already provide.
  const bySpec = new Map<string, string[]>()
  for (const dep of [...scriptDeps].sort()) {
    if (familyNames.has(dep) || aliasNames.has(dep) || importedLocals.has(dep))
      continue
    const source = importOf.get(dep)
    if (!source) continue
    if (!bySpec.has(source.spec)) bySpec.set(source.spec, [])
    bySpec.get(source.spec)!.push(source.rendered)
    importedLocals.add(dep)
  }

  const scriptImports = [...bySpec]
    .map(
      ([spec, names]) => `import type { ${names.join(', ')} } from '${spec}'`
    )
    .join('\n')

  const plain = [
    '',
    scriptImports,
    '',
    ...helperTexts.flatMap((text) => [text, '']),
    "declare module '@vueform/core' {",
    `  interface ControlRegistry<${entryParam}> {`,
    `    VfCloneName: ${entryText}`,
    '  }',
    '}',
    '',
    "declare module 'vue' {",
    '  interface GlobalComponents {',
    "    VfCloneName: (typeof import('./VfCloneName.vue'))['default']",
    '  }',
    '}',
    '',
  ].join('\n')

  let emitted =
    sfcSource.slice(0, setup.loc.start.offset) +
    newSetup +
    sfcSource.slice(setup.loc.end.offset)
  const closeTag = '</script>'
  const closeIndex =
    emitted.indexOf(closeTag, setup.loc.start.offset + newSetup.length) +
    closeTag.length
  emitted =
    emitted.slice(0, closeIndex) +
    `\n\n<script lang="ts">${plain}</script>` +
    emitted.slice(closeIndex)

  return { content: emitted, blueprint }
}

/**
 * Formats an emitted SFC with the repo's Prettier config so a user's
 * format-on-save is a no-op in matching projects and hashes stay stable.
 * (Projects with diverging Prettier configs will still reformat — resolving
 * that needs normalized comparison on the CLI side.)
 */
async function formatEmitted(content: string): Promise<string> {
  // resolveConfig resolves the config that applies to a FILE — hand it a
  // hypothetical file at the repo root so .prettierrc is found.
  const config =
    (await prettier.resolveConfig(path.join(repoRoot, 'x.vue'))) ?? {}
  return prettier.format(content, { ...config, parser: 'vue' })
}

function sha256(content: string): string {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

/**
 * Compiled validators for the canonical schemas in packages/core/schemas.
 */
function loadValidators() {
  const schemasDir = path.join(repoRoot, 'packages/core/schemas')
  if (!fs.existsSync(schemasDir)) {
    console.warn(
      `[registry] no ${path.relative(repoRoot, schemasDir)} — manifest validation skipped`
    )
    return null
  }
  const ajv = new Ajv({ allErrors: true })
  const read = (name: string) =>
    JSON.parse(fs.readFileSync(path.join(schemasDir, name), 'utf8'))

  return {
    item: ajv.compile(read('registry-item.json')),
    index: ajv.compile(read('registry.json')),
  }
}

/**
 * Typechecks the emitted registry files against the target's built package by
 * dropping them into the matching playground and running vue-tsc there.
 */
function runCheck(target: Target) {
  const playground = path.join(repoRoot, '.playgrounds', target.flag)

  if (!fs.existsSync(playground)) {
    console.warn(
      `[registry] --check skipped: no .playgrounds/${target.flag} (run pnpm pg:up --${target.flag})`
    )
    return
  }

  const checkDir = path.join(playground, 'src', '.registry-check')
  const tsconfigPath = path.join(playground, 'tsconfig.registry-check.json')
  const filesDir = path.join(target.packageDir, '.registry/copies')

  fs.rmSync(checkDir, { recursive: true, force: true })
  fs.mkdirSync(checkDir, { recursive: true })

  for (const file of fs.readdirSync(filesDir)) {
    fs.copyFileSync(path.join(filesDir, file), path.join(checkDir, file))
  }

  // Clone templates are checked as concrete instantiations (VfTextClone /
  // 'text-clone') — exactly what the CLI's substitution produces.
  const clonesDir = path.join(target.packageDir, '.registry/clones')

  for (const file of fs.readdirSync(clonesDir)) {
    const base = path.basename(file, '.vue')
    const cloneName = `${base}Clone`
    const cloneType = `${base
      .replace(/^Vf/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()}-clone`
    const content = fs
      .readFileSync(path.join(clonesDir, file), 'utf8')
      .replaceAll('VfCloneName', cloneName)
      .replaceAll('__TYPE__', cloneType)
    fs.writeFileSync(path.join(checkDir, `${cloneName}.vue`), content)
  }

  // The copies import theme chunks (side-effect .css imports); user projects
  // get these module types from vite/client — provide them here.
  fs.writeFileSync(
    path.join(checkDir, 'css-modules.d.ts'),
    "declare module '*.css'\n"
  )

  fs.writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          verbatimModuleSyntax: true,
          // Clone templates augment '@vueform/core', which pnpm doesn't hoist
          // into the playground — resolve it to the built core types (the same
          // file the adapter's own d.ts re-exports resolve to).
          baseUrl: '.',
          paths: {
            '@vueform/core': ['../../packages/core/dist/index.d.ts'],
          },
        },
        include: ['src/.registry-check/*.vue', 'src/.registry-check/*.d.ts'],
      },
      null,
      2
    )
  )

  const result = spawnSync(
    'pnpm',
    ['exec', 'vue-tsc', '-p', 'tsconfig.registry-check.json'],
    { cwd: playground, stdio: 'inherit' }
  )

  fs.rmSync(checkDir, { recursive: true, force: true })
  fs.rmSync(tsconfigPath, { force: true })

  if (result.status !== 0) {
    console.error(`[registry] --check FAILED for ${target.package}`)
    process.exit(result.status ?? 1)
  }

  process.stdout.write(
    `[registry] --check passed for ${target.package} (vue-tsc)` + '\n'
  )
}

export async function generateRegistry(options: RegistryOptions) {
  const { packageDir, components = [], check = false } = options
  repoRoot = path.resolve(packageDir, '../..')
  const target = targetFromPackageDir(packageDir)
  const names = components.length ? components : discoverComponents(target)
  const descriptions = loadDescriptions(target.flag)
  const validators = loadValidators()
  const version = JSON.parse(
    fs.readFileSync(path.join(target.packageDir, 'package.json'), 'utf8')
  ).version
  const registryDir = path.join(target.packageDir, '.registry')

  fs.rmSync(registryDir, { recursive: true, force: true })
  fs.mkdirSync(path.join(registryDir, 'schemas'), { recursive: true })
  fs.mkdirSync(path.join(registryDir, 'copies'), { recursive: true })
  fs.mkdirSync(path.join(registryDir, 'clones'), { recursive: true })

  const indexItems = []

  for (const name of names) {
    const { files, imports } = emitComponent(target, name)

    if (descriptions && !descriptions[name]) {
      console.warn(
        `[registry] ${name}: no description in scripts/data/components.json`
      )
    }
    const description = descriptions?.[name] ?? `${name} component`

    const fileEntries = []

    for (const file of files) {
      const emitted = await formatEmitted(file.emitted)
      fs.writeFileSync(path.join(registryDir, 'copies', file.fileName), emitted)
      fileEntries.push({
        path: file.fileName,
        target: `{componentsDir}/${file.fileName}`,
        kind: 'component',
        hash: sha256(emitted),
      })
    }

    const styles = imports
      .map((spec) => /^@vueform\/[\w-]+\/([\w-]+)\.css$/.exec(spec)?.[1])
      .filter((chunk): chunk is string => Boolean(chunk))

    const clone = emitCloneTemplate(target, name)
    let cloneEntry = null

    if (clone) {
      const formatted = await formatEmitted(clone.content)
      fs.writeFileSync(
        path.join(registryDir, 'clones', `${name}.vue`),
        formatted
      )
      cloneEntry = {
        path: `${name}.vue`,
        blueprint: clone.blueprint,
        hash: sha256(formatted),
        docs: `How to customize the clone:\n${target.cloneDocsUrl}`,
      }
    }

    const item = {
      schemaVersion: SCHEMA_VERSION,
      name,
      type: 'component',
      package: target.package,
      version,
      description,
      files: fileEntries,
      imports,
      dependencies: {},
      registryDependencies: [],
      ...(styles.length ? { styles } : {}),
      ...(cloneEntry ? { element: true, clone: cloneEntry } : {}),
      register: {
        component: name,
        import: `{componentsDir}/${name}.vue`,
      },
      docs: `How to customize the copy:\n${target.docsUrl}`,
    }

    if (validators && !validators.item(item)) {
      throw new Error(
        `${name}: manifest fails registry-item schema — ${JSON.stringify(validators.item.errors)}`
      )
    }

    fs.writeFileSync(
      path.join(registryDir, 'schemas', `${name}.json`),
      JSON.stringify(item, null, 2) + '\n'
    )
    indexItems.push({
      name,
      type: 'component',
      description,
      ...(cloneEntry ? { element: true } : {}),
    })
    process.stdout.write(
      `[registry] ${target.package}: ${name} (${files.map((f) => f.fileName).join(', ')}${cloneEntry ? ' + clone' : ''})` +
        '\n'
    )
  }

  const index = {
    schemaVersion: SCHEMA_VERSION,
    package: target.package,
    version,
    items: indexItems,
  }

  if (validators && !validators.index(index)) {
    throw new Error(
      `index fails registry-index schema — ${JSON.stringify(validators.index.errors)}`
    )
  }

  fs.writeFileSync(
    path.join(registryDir, 'index.json'),
    JSON.stringify(index, null, 2) + '\n'
  )
  process.stdout.write(
    `[registry] wrote ${path.relative(repoRoot, registryDir)} (${indexItems.length} items)` +
      '\n'
  )

  if (check) runCheck(target)
}
