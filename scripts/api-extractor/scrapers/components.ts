import * as fs from 'node:fs'
import * as path from 'node:path'

import {
  corePackage,
  nonCoreAdapters,
  type AdapterDef,
} from '../lib/adapters.js'
import {
  classifyPropSources,
  createProgram,
  deduplicateClasses,
  extractAdapterFeatureNames,
  extractAdapterTypeInfo,
  extractBaseAugmentations,
  extractBlueprintName,
  extractClassDefaults,
  extractClassTypes,
  extractComponentApi,
  extractComponentProps,
  extractDefaults,
  extractEvents,
  extractParts,
  extractSlots,
  findInterface,
  parseLayoutBaseClasses,
  resolveForwardedEventDescriptions,
  type BaseAugmentations,
  type ComponentEntry,
  type SlotInfo,
  type DefaultEntry,
} from '../lib/extract.js'
import { generatedDir, monorepoRoot } from '../lib/paths.js'
import { parseScope } from '../lib/scope.js'

// =============== PATHS ================

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const GENERATED_DIR = generatedDir
const CORE_DIR = path.join(ROOT, corePackage)
const CORE_COMPONENTS_DIR = path.join(CORE_DIR, 'src/components')
const BLUEPRINTS_DIR = path.join(CORE_DIR, 'src/blueprints')

// =============== HELPERS ==============

function isPureReExport(componentFile: string): boolean {
  if (!fs.existsSync(componentFile)) return false
  const content = fs.readFileSync(componentFile, 'utf-8')
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'))

  return (
    lines.every(
      (l) => l.startsWith('export') || l.startsWith('import') || l === ''
    ) &&
    lines.some((l) => l.includes("from '@vueform/core")) &&
    !lines.some((l) => /\binterface\b|\bfunction\b|\bclass\b/.test(l))
  )
}

function hasOwnTypes(componentDir: string): boolean {
  return fs.existsSync(path.join(componentDir, 'types.ts'))
}

function componentUsesVfLayout(
  componentName: string,
  componentDir: string
): boolean {
  const vuePath = path.join(componentDir, `${componentName}.vue`)
  if (!fs.existsSync(vuePath)) return false
  const tpl = fs
    .readFileSync(vuePath, 'utf-8')
    .match(/<template>([\s\S]*)<\/template>/)
  return tpl ? tpl[1].includes('<VfLayout') : false
}

function mergeBaseAugmentations(
  entry: ComponentEntry,
  augmentations: BaseAugmentations,
  baseClasses: Record<string, string>,
  ownDefaults: Record<string, string>
): void {
  for (const [name, info] of Object.entries(augmentations.slots)) {
    if (!entry.slots[name]) entry.slots[name] = info
  }
  for (const [name, info] of Object.entries(augmentations.parts)) {
    if (!entry.parts[name]) entry.parts[name] = info
  }
  for (const [name, info] of Object.entries(augmentations.classes)) {
    if (!entry.classes[name]) {
      const merged = { ...info }
      const combined = [baseClasses[name], ownDefaults[name]]
        .filter(Boolean)
        .join(' ')
      if (combined) {
        merged.default = deduplicateClasses(combined)
      }
      entry.classes[name] = merged
    }
  }
}

/**
 * Applies base augmentations from an adapter's `features/augment.ts` to every
 * element component in the map. Looks for `<VfLayout` usage in Vue files across
 * the provided component directories.
 */
function applyAugmentations(
  components: Record<string, ComponentEntry>,
  augmentations: BaseAugmentations | null,
  componentsDirs: string[],
  baseClasses: Record<string, string>
): void {
  if (!augmentations) return

  for (const [componentName, entry] of Object.entries(components)) {
    const elementDir = componentsDirs.find((dir) =>
      componentUsesVfLayout(componentName, path.join(dir, componentName))
    )

    if (elementDir) {
      const ownDefaults = extractClassDefaults(
        componentName,
        path.join(elementDir, componentName),
        {}
      )
      mergeBaseAugmentations(entry, augmentations, baseClasses, ownDefaults)
    }
  }
}

// ========== CORE COMPONENTS ==========

function extractCoreComponents(): Record<string, ComponentEntry> {
  const { program, checker } = createProgram(CORE_DIR)

  const vfElementClasses = parseLayoutBaseClasses(
    path.join(ROOT, 'packages/core')
  )

  const componentDirs = fs
    .readdirSync(CORE_COMPONENTS_DIR)
    .filter(
      (d) =>
        d.startsWith('Vf') &&
        fs.statSync(path.join(CORE_COMPONENTS_DIR, d)).isDirectory()
    )
    .sort()

  const output: Record<string, ComponentEntry> = {}
  let skipped = 0

  for (const componentName of componentDirs) {
    const componentDir = path.join(CORE_COMPONENTS_DIR, componentName)

    const typesPath = path.join(componentDir, 'types.ts')
    const typesFile = program.getSourceFile(typesPath)
    if (!typesFile) {
      skipped++
      continue
    }

    const apiPath = path.join(componentDir, 'api.ts')
    const apiFile = program.getSourceFile(apiPath)

    let blueprint = apiFile ? extractBlueprintName(apiFile) : ''

    if (!blueprint) {
      const indexPath = path.join(componentDir, 'index.ts')
      const indexFile = program.getSourceFile(indexPath)
      if (indexFile) {
        blueprint = extractBlueprintName(indexFile)
      }
    }

    const blueprintPath = path.join(BLUEPRINTS_DIR, `${blueprint}.ts`)
    const blueprintFile = blueprint
      ? program.getSourceFile(blueprintPath)
      : undefined
    const defaults = blueprintFile
      ? extractDefaults(blueprintFile)
      : new Map<string, DefaultEntry>()

    const propsDecl = findInterface(typesFile, `${componentName}Props`)
    const eventsDecl = findInterface(typesFile, `${componentName}Emits`)
    const partsDecl = findInterface(typesFile, `${componentName}Parts`)
    const slotsDecl = findInterface(typesFile, `${componentName}Slots`)
    const classesDecl = findInterface(typesFile, `${componentName}Classes`)

    const props = propsDecl
      ? extractComponentProps(checker, propsDecl, defaults)
      : {}
    const events = eventsDecl ? extractEvents(checker, eventsDecl) : {}
    const parts = partsDecl ? extractParts(checker, partsDecl) : {}
    const slots = slotsDecl ? extractSlots(checker, slotsDecl) : {}

    const classTypes = classesDecl
      ? extractClassTypes(checker, classesDecl)
      : {}
    const classDefaults = extractClassDefaults(
      componentName,
      componentDir,
      vfElementClasses
    )

    // Base layout classes only apply to element components (<VfLayout users).
    const isElement = componentUsesVfLayout(componentName, componentDir)
    const partBase = isElement ? vfElementClasses : {}
    for (const [key, info] of Object.entries(classTypes)) {
      if (classDefaults[key] && partBase[key]) {
        info.default = deduplicateClasses(
          `${partBase[key]} ${classDefaults[key]}`
        )
      } else if (classDefaults[key]) {
        info.default = classDefaults[key]
      } else if (partBase[key]) {
        info.default = partBase[key]
      }
    }

    const entry: ComponentEntry = {
      blueprint,
      ...(isElement ? { element: true } : {}),
      props,
      events,
      parts,
      slots,
      classes: classTypes,
    }

    const componentApi = apiFile
      ? extractComponentApi(checker, apiFile)
      : undefined
    if (componentApi) entry.api = componentApi

    output[componentName] = entry
  }

  console.log(
    `ui/components: ${Object.keys(output).length} extracted${skipped ? `, ${skipped} skipped (no types.ts)` : ''}`
  )

  return output
}

// ======== ADAPTER COMPONENTS =========

function extractAdapterComponents(
  adapterName: string,
  adapterDef: AdapterDef,
  coreComponents: Record<string, ComponentEntry>
): Record<string, ComponentEntry> {
  const adapterDir = path.join(ROOT, adapterDef.path)
  const componentsDir = path.join(adapterDir, 'src/components')

  if (!fs.existsSync(componentsDir)) {
    throw new Error(`Components dir not found: ${componentsDir}`)
  }

  const { program: adapterProgram, checker: adapterChecker } =
    createProgram(adapterDir)

  const { program: coreProgram } = createProgram(CORE_DIR)

  const adapterBaseClasses = parseLayoutBaseClasses(adapterDir)
  const coreBaseClasses =
    Object.keys(adapterBaseClasses).length > 0
      ? adapterBaseClasses
      : parseLayoutBaseClasses(path.join(ROOT, 'packages/core'))

  const componentDirs = fs
    .readdirSync(componentsDir)
    .filter(
      (d) =>
        d.startsWith('Vf') &&
        fs.statSync(path.join(componentsDir, d)).isDirectory()
    )
    .sort()

  const output: Record<string, ComponentEntry> = {}
  let reExported = 0
  let fallback = 0

  for (const componentName of componentDirs) {
    const componentDir = path.join(componentsDir, componentName)
    const componentFile =
      ['styled.ts', 'unstyled.ts']
        .map((name) => path.join(componentDir, name))
        .find((file) => fs.existsSync(file)) ??
      path.join(componentDir, 'unstyled.ts')

    if (isPureReExport(componentFile) && !hasOwnTypes(componentDir)) {
      if (coreComponents[componentName]) {
        const entry = structuredClone(coreComponents[componentName])
        if (entry.classes) {
          const coreComponentDir = path.join(CORE_COMPONENTS_DIR, componentName)
          const ownDefaults = extractClassDefaults(
            componentName,
            coreComponentDir,
            {}
          )
          const partBase = componentUsesVfLayout(
            componentName,
            coreComponentDir
          )
            ? coreBaseClasses
            : {}
          for (const [key, info] of Object.entries(entry.classes) as [
            string,
            any,
          ][]) {
            if (ownDefaults[key] && partBase[key]) {
              info.default = deduplicateClasses(
                `${partBase[key]} ${ownDefaults[key]}`
              )
            } else if (ownDefaults[key]) {
              info.default = ownDefaults[key]
            } else if (partBase[key]) {
              info.default = partBase[key]
            }
          }
        }
        output[componentName] = entry
        reExported++
        continue
      }
      throw new Error(
        `${componentName}: re-export but not found in core components`
      )
    }

    const typesPath = path.join(componentDir, 'types.ts')
    const typesFile = adapterProgram.getSourceFile(typesPath)
    if (!typesFile) {
      if (coreComponents[componentName]) {
        const entry = structuredClone(coreComponents[componentName])
        if (entry.classes) {
          const coreComponentDir = path.join(CORE_COMPONENTS_DIR, componentName)
          const ownDefaults = extractClassDefaults(
            componentName,
            coreComponentDir,
            {}
          )
          const partBase = componentUsesVfLayout(
            componentName,
            coreComponentDir
          )
            ? coreBaseClasses
            : {}
          for (const [key, info] of Object.entries(entry.classes) as [
            string,
            any,
          ][]) {
            if (ownDefaults[key] && partBase[key]) {
              info.default = deduplicateClasses(
                `${partBase[key]} ${ownDefaults[key]}`
              )
            } else if (ownDefaults[key]) {
              info.default = ownDefaults[key]
            } else if (partBase[key]) {
              info.default = partBase[key]
            }
          }
        }
        output[componentName] = entry
        fallback++
      } else {
        throw new Error(`${componentName}: no types.ts found and not in core`)
      }
      continue
    }

    const apiPath = path.join(componentDir, 'api.ts')
    const apiFile = adapterProgram.getSourceFile(apiPath)

    let blueprint = apiFile ? extractBlueprintName(apiFile) : ''

    if (!blueprint) {
      const indexPath = path.join(componentDir, 'index.ts')
      const indexFile = adapterProgram.getSourceFile(indexPath)
      if (indexFile) {
        blueprint = extractBlueprintName(indexFile)
      }
    }

    if (!blueprint && coreComponents[componentName]) {
      blueprint = coreComponents[componentName].blueprint
    }

    const blueprintPath = path.join(BLUEPRINTS_DIR, `${blueprint}.ts`)
    const adapterBlueprintPath = path.join(
      adapterDir,
      'src/blueprints',
      `${blueprint}.ts`
    )
    const blueprintFile = blueprint
      ? (adapterProgram.getSourceFile(adapterBlueprintPath) ??
        coreProgram.getSourceFile(blueprintPath))
      : undefined
    const defaults = blueprintFile
      ? extractDefaults(blueprintFile)
      : new Map<string, DefaultEntry>()

    const propsDecl = findInterface(typesFile, `${componentName}Props`)
    const eventsDecl = findInterface(typesFile, `${componentName}Emits`)
    const partsDecl = findInterface(typesFile, `${componentName}Parts`)
    const slotsDecl = findInterface(typesFile, `${componentName}Slots`)
    const classesDecl = findInterface(typesFile, `${componentName}Classes`)

    const props = propsDecl
      ? extractComponentProps(adapterChecker, propsDecl, defaults)
      : {}
    const events = eventsDecl ? extractEvents(adapterChecker, eventsDecl) : {}
    const parts = partsDecl ? extractParts(adapterChecker, partsDecl) : {}
    const slots = slotsDecl ? extractSlots(adapterChecker, slotsDecl) : {}

    if (eventsDecl) {
      const forwardedDescs = resolveForwardedEventDescriptions(
        adapterChecker,
        eventsDecl
      )
      for (const [name, desc] of Object.entries(forwardedDescs)) {
        if (events[name] && !events[name].description) {
          events[name].description = desc
        }
      }
    }

    if (propsDecl) {
      const sources = classifyPropSources(
        adapterChecker,
        propsDecl,
        adapterName
      )
      for (const [name, source] of Object.entries(sources)) {
        if (props[name]) {
          props[name].source = source
          if (source === 'html') delete props[name].required
        }
      }
    }

    const blueprintPropsName = componentName.replace(/^Vf/, '') + 'Props'
    const blueprintPropsDecl = blueprintFile
      ? findInterface(blueprintFile, blueprintPropsName)
      : undefined

    const adapterTypeInfo =
      propsDecl && typesFile
        ? extractAdapterTypeInfo(
            propsDecl,
            adapterName,
            typesFile,
            adapterChecker,
            props,
            blueprintPropsDecl ?? undefined,
            blueprintFile ?? undefined
          )
        : undefined

    const classTypes = classesDecl
      ? extractClassTypes(adapterChecker, classesDecl)
      : {}
    const classDefaults = extractClassDefaults(
      componentName,
      componentDir,
      coreBaseClasses,
      'BaseVfLayoutClasses'
    )

    const isElement =
      componentUsesVfLayout(componentName, componentDir) ||
      componentUsesVfLayout(
        componentName,
        path.join(CORE_COMPONENTS_DIR, componentName)
      )
    const partBase = isElement ? coreBaseClasses : {}
    for (const [key, info] of Object.entries(classTypes)) {
      if (classDefaults[key] && partBase[key]) {
        info.default = deduplicateClasses(
          `${partBase[key]} ${classDefaults[key]}`
        )
      } else if (classDefaults[key]) {
        info.default = classDefaults[key]
      } else if (partBase[key]) {
        info.default = partBase[key]
      }
    }

    const entry: ComponentEntry = {
      blueprint,
      ...(isElement ? { element: true } : {}),
      props,
      events,
      parts,
      slots,
      classes: classTypes,
    }

    if (adapterTypeInfo) entry.adapterTypeInfo = adapterTypeInfo

    const componentApi = apiFile
      ? extractComponentApi(adapterChecker, apiFile)
      : undefined
    if (componentApi) entry.api = componentApi

    if (apiFile) {
      const adapterFeatures = extractAdapterFeatureNames(apiFile)
      if (adapterFeatures.length) {
        entry.adapterFeatures = adapterFeatures
      }
    }

    output[componentName] = entry
  }

  const own = Object.keys(output).length - reExported - fallback
  console.log(
    `${adapterName}/components: ${Object.keys(output).length} total, ${own} own, ${reExported} re-exported, ${fallback} core fallback`
  )

  return output
}

// ================ MAIN ================

/**
 * Expands `inherits: "Comp.slot"` slot refs in place: the target slot's
 * definition (params, exposes, …) is copied onto the inheriting slot, its own
 * description wins, and the ref is dropped. Chains resolve transitively.
 */
function expandSlotInheritance(
  components: Record<string, ComponentEntry>
): void {
  const resolve = (ref: string, seen: Set<string>): SlotInfo | undefined => {
    if (seen.has(ref)) {
      throw new Error(`circular slot @inherits chain at ${ref}`)
    }
    seen.add(ref)
    const [compName, slotName] = ref.split('.')
    const slot = components[compName]?.slots?.[slotName]
    if (!slot) return undefined
    if (!slot.inherits) return slot
    const target = resolve(slot.inherits, seen)
    if (!target) return slot
    const { inherits: _inherits, ...own } = slot
    return {
      ...structuredClone(target),
      ...own,
      description: own.description || target.description,
    }
  }

  for (const [compName, entry] of Object.entries(components)) {
    for (const [slotName, slot] of Object.entries(entry.slots ?? {})) {
      if (!slot.inherits) continue
      const expanded = resolve(`${compName}.${slotName}`, new Set())
      if (expanded) {
        entry.slots[slotName] = expanded
      } else {
        console.warn(
          `[components] ${compName}.slots.${slotName}: unresolved @inherits ${slot.inherits}`
        )
        delete entry.slots[slotName].inherits
      }
    }
  }
}

function main() {
  const coreComponents = extractCoreComponents()

  const uiBaseClasses = parseLayoutBaseClasses(path.join(ROOT, 'packages/core'))

  const uiAdapterDir = path.join(ROOT, 'packages/ui')
  const uiAugmentations = extractBaseAugmentations(uiAdapterDir)
  const uiComponents = structuredClone(coreComponents)
  applyAugmentations(
    uiComponents,
    uiAugmentations,
    [CORE_COMPONENTS_DIR],
    uiBaseClasses
  )
  expandSlotInheritance(uiComponents)

  if (scope.core) {
    const coreOutputDir = path.join(GENERATED_DIR, '_ui')
    fs.mkdirSync(coreOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(coreOutputDir, 'components.json'),
      JSON.stringify(uiComponents, null, 2) + '\n'
    )
  }

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterComponents = extractAdapterComponents(
      adapterName,
      adapterDef,
      coreComponents
    )

    const adapterDir = path.join(ROOT, adapterDef.path)
    const adapterAugmentations = extractBaseAugmentations(adapterDir)
    const adapterComponentsDir = path.join(adapterDir, 'src/components')
    const adapterBaseClasses = parseLayoutBaseClasses(adapterDir)
    const effectiveBaseClasses =
      Object.keys(adapterBaseClasses).length > 0
        ? adapterBaseClasses
        : uiBaseClasses
    applyAugmentations(
      adapterComponents,
      adapterAugmentations,
      [adapterComponentsDir, CORE_COMPONENTS_DIR],
      effectiveBaseClasses
    )
    expandSlotInheritance(adapterComponents)

    const adapterOutputDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterOutputDir, 'components.json'),
      JSON.stringify(adapterComponents, null, 2) + '\n'
    )
  }

  const oldFile = path.join(GENERATED_DIR, 'components.json')
  if (fs.existsSync(oldFile)) {
    fs.rmSync(oldFile)
    console.log('Removed old components.json')
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
