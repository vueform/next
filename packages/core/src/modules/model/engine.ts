import {
  computed,
  effectScope,
  markRaw,
  ref,
  watch,
  type ComputedRef,
  type EffectScope,
  type Ref,
} from 'vue'

import type { VueformInstance } from '#src/helpers'
import {
  getConditionsModule,
  hasConditionsModule,
} from '#src/modules/conditions'
import { getExpressionModule } from '#src/modules/expression'
import {
  getValidationModule,
  hasValidationModule,
  type TRulesProp,
  type Validator,
  type ValidationOwner,
} from '#src/modules/validation'
import type {
  LanguagesProp,
  StandardSchemaV1,
  StatefulElement,
} from '#src/types'
import {
  alwaysTrue,
  clone,
  equals,
  isDev,
  isEmptyValue,
  isPlainObject,
  warn,
} from '#src/utils'

import type { ModelNode, ModelStore, SchemaIndex } from './types'
import type { SchemaIndexDiff } from './walk'

export type ModelEngine = ReturnType<typeof makeEngine>

/**
 * The headless half of a form: conditions, expressions, validation, payload,
 * and virtual element contexts for the index's unmounted nodes. Mounted
 * elements claim nodes (`node.el$`) and take over; the engine answers for
 * everything else.
 *
 * Must run inside the instance's effect scope so availability computeds and
 * async condition watchers are disposed by `destroy()`.
 */
export function makeEngine(options: {
  index: SchemaIndex
  store: ModelStore
  vueform: VueformInstance
  validationSchema?: StandardSchemaV1
  scope: EffectScope
  languages?: LanguagesProp
}) {
  const { index, store, vueform, scope } = options
  const config = vueform.config

  const languages: LanguagesProp = options.languages ?? config.languages ?? {}

  // Headless models read translatable values in the first language; the
  // mounted form owns language switching.
  const language = Object.keys(languages)[0]

  const conditionsModule = getConditionsModule(vueform)

  const availability = new Map<ModelNode, Ref<boolean> | ComputedRef<boolean>>()
  const contexts = new Map<ModelNode, StatefulElement>()
  const submits = ref(false)
  const version = index.version

  const nodeOwners = new Map<ModelNode, ValidationOwner>()

  const {
    makeValidator,
    makeValidationOwner,
    attachValidator,
    getAttachedValidator,
  } = getValidationModule(vueform)

  // Assigned after the virtual form exists; context getters read it lazily so
  // `contextOf` can be defined first.
  let validator: Validator

  const readValue = (node: ModelNode): any => {
    if (node.flat) {
      const result: Record<string, any> = {}
      for (const [name, child] of node.children ?? []) {
        if (child.flat) {
          Object.assign(result, readValue(child))
        } else {
          result[name] = store.get(child.dataPath)
        }
      }
      return result
    }

    return node.dataPath ? store.get(node.dataPath) : store.model.value
  }

  const makeFilled = (node: ModelNode) => {
    if (node.children && !node.array) {
      return (value: any) => {
        for (const [name, child] of node.children!) {
          if (!isAvailable(child)) continue
          if (!(contextOf(child) as any).filled(value?.[name])) return false
        }
        return true
      }
    }

    return (value: any) => {
      if (node.props.falseValue !== undefined) {
        return node.props.falseValue !== value
      }

      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== false &&
        (!Array.isArray(value) || !!value.length) &&
        (!isPlainObject(value) || !!Object.keys(value).length)
      )
    }
  }

  const availabilityOf = (node: ModelNode): Ref<boolean> => {
    return (availability.get(node) as Ref<boolean>) ?? alwaysTrue
  }

  const isAvailable = (node: ModelNode): boolean => {
    const el$ = node.el$ as any
    if (el$) return el$.available !== false
    return availabilityOf(node).value
  }

  const contextOf = (node: ModelNode): StatefulElement => {
    let context = contexts.get(node)
    if (context) return context

    const touched = ref(false)
    const filled = makeFilled(node)

    const el$: any = {
      path: node.path,
      dataPath: node.dataPath,
      genericName: node.genericName,
      props: node.props,
      ruleMessages: node.props.ruleMessages,
      filled,
      // Language-scoped for translatable nodes, mirroring the mounted update
      // (plain-object writes replace every language at once).
      update: (value: any) =>
        store.set(
          node.translatable && language && !isPlainObject(value)
            ? `${node.dataPath}.${language}`
            : node.dataPath,
          value
        ),
      get model() {
        return readValue(node)
      },
      // Like the mounted `value`, scoped to the active language for
      // translatable nodes (`model` stays the full locale object).
      get value() {
        const raw = readValue(node)
        return node.translatable && language && raw && typeof raw === 'object'
          ? raw[language]
          : raw
      },
      // Expression resolution binds `context$.form$`, so `PROP()` / `SELF()`
      // element lookups work headlessly through the virtual form.
      get form$() {
        return virtualForm$
      },
      get available() {
        return availabilityOf(node).value
      },
      get touched() {
        return touched.value
      },
      set touched(v: boolean) {
        touched.value = v
      },
      get validated() {
        const owner = nodeOwners.get(node)
        return owner ? validator.view(owner).validated.value : true
      },
      get invalid() {
        const owner = nodeOwners.get(node)
        return owner ? validator.view(owner).invalid.value : false
      },
      get errors() {
        const owner = nodeOwners.get(node)
        return owner ? validator.view(owner).errors.value : []
      },
    }

    context = markRaw(el$) as StatefulElement
    contexts.set(node, context)
    return context
  }

  // Reads `version` so reactive consumers re-resolve when claims change.
  const find = (path: string): StatefulElement | undefined => {
    void version.value

    const node = index.nodes.get(path)
    if (!node) return undefined

    return (node.el$ as StatefulElement | undefined) ?? contextOf(node)
  }

  // The minimal form$ stand-in for headless consumers (expressions,
  // validation, events).
  const virtualForm$: any = markRaw({
    find,
    get: store.get,
    get model() {
      return store.model.value
    },
    get submits() {
      return submits.value
    },
  })

  // ============ CONDITIONS ==============

  let availabilityScope: EffectScope | undefined

  const wireAvailability = () => {
    availabilityScope?.stop()
    availability.clear()

    availabilityScope = scope.run(() => effectScope())!

    availabilityScope.run(() => {
      for (const node of index.nodes.values()) {
        const parentRef: Ref<boolean> = node.parent
          ? (availability.get(node.parent) as Ref<boolean>)
          : alwaysTrue

        let chained: Ref<boolean> | ComputedRef<boolean> = parentRef

        if (hasConditionsModule(vueform) && node.conditions != null) {
          const own = conditionsModule.makeConditional(
            node.conditions,
            store.model,
            contextOf(node),
            {
              path: node.path,
              form$: virtualForm$,
              trigger: node.props.conditionsTrigger,
              debounce: node.props.conditionsDebounce,
              valueFormat: node.props.valueFormat,
            }
          )
          chained = computed(() => parentRef.value && own.value)
        }

        availability.set(node, chained)
        node.available = chained
      }
    })
  }

  wireAvailability()

  // ============ EXPRESSIONS =============

  const expressionTracking =
    getExpressionModule(vueform).makeExpressionTracking(index)

  const trackingExpressions = expressionTracking.activate({
    store,
    config,
    languages: () => languages,
  })

  if (trackingExpressions) {
    for (const node of index.nodes.values()) {
      expressionTracking.init(node, () => contextOf(node))
    }
  }

  // ============ VALIDATION ==============

  const ensureValidator = (): Validator => {
    const existing = getAttachedValidator(store)
    if (existing) return existing

    const created = makeValidator({
      model: store.model,
      form$: virtualForm$,
      store,
      find: (path) => find(path),
      submits: () => store.attachingContext.value?.submits ?? submits.value,
    })
    attachValidator(store, created)
    return created
  }

  validator = ensureValidator()

  if (options.validationSchema) {
    validator.setValidationSchema(options.validationSchema)
  }

  // No root owner is registered for the headless engine: root-bucket
  // validation-schema issues surface through the validator's rollup fallback.
  // Registering one here would duplicate them once a form attaches the store —
  // the mounted form root registers its own path-`''` owner on the same
  // validator.

  const ensureOwner = (node: ModelNode): ValidationOwner => {
    let owner = nodeOwners.get(node)
    if (owner) return owner

    owner = makeValidationOwner({
      id: node,
      path: () => node.path,
      dataPath: () => node.dataPath,
      el$: () => (node.el$ as StatefulElement | undefined) ?? contextOf(node),
      translatable: () => !!node.translatable,
      languages: () => Object.keys(languages),
      value: () => readValue(node),
      bail: () => !!node.props.bail,
      debounce: () => Number(node.props.debounce || 0),
      available: () => isAvailable(node),
    })

    nodeOwners.set(node, owner)
    validator.register(owner)
    validator.setRules(owner, node.rules as TRulesProp | undefined)
    version.value++
    return owner
  }

  // Mounted elements are the single authority for claimed nodes: drop the
  // engine's owner once its node gets claimed, so the validator never holds a
  // second owner for the same path. Sync flush — claims bump `version` right
  // after setting `node.el$`, so the drop lands in the same tick and no read
  // can observe both owners. After the claim is released, `validate()` lazily
  // re-creates a fresh owner.
  scope.run(() => {
    watch(
      version,
      () => {
        for (const [node, owner] of nodeOwners) {
          if (!node.el$) continue
          validator.unregister(owner)
          nodeOwners.delete(node)
        }
      },
      { flush: 'sync' }
    )
  })

  const validate = async (): Promise<boolean> => {
    submits.value = true

    if (!hasValidationModule(vueform)) {
      if (isDev()) {
        if (options.validationSchema) {
          warn(
            '`validate()` found a `validationSchema` but the `validation` module is not registered; treating the model as valid.'
          )
        } else {
          for (const node of index.nodes.values()) {
            if (node.rules != null) {
              warn(
                '`validate()` found rules but the `validation` module is not registered; treating the model as valid.'
              )
              break
            }
          }
        }
      }

      return !validator.invalid.value
    }

    for (const node of index.nodes.values()) {
      if (node.rules == null && !options.validationSchema) continue
      // Claimed nodes are validated through their mounted element's owner.
      if (node.el$) continue
      if (!isAvailable(node)) continue
      ensureOwner(node)
    }

    return validator.validate()
  }

  const invalid = computed(() => {
    void version.value
    return validator.invalid.value
  })

  const errors = computed(() => {
    void version.value
    return validator.errors.value
  })

  // =============== DATA =================

  const collectPayload = (node: ModelNode, acc: Record<string, any>) => {
    if (!node.submit || !isAvailable(node)) return

    const name = String(node.props.name)

    if (node.array) {
      acc[name] = clone(store.get(node.dataPath))
      return
    }

    if (node.children) {
      const target = node.flat ? acc : (acc[name] = {})
      for (const child of node.children.values()) {
        collectPayload(child, target)
      }
      return
    }

    acc[name] = clone(store.get(node.dataPath))
  }

  const payload = computed(() => {
    void version.value

    const result: Record<string, any> = {}
    for (const node of index.root.values()) {
      collectPayload(node, result)
    }
    return result
  })

  const nodeEmpty = (node: ModelNode): boolean => {
    if (!isAvailable(node)) return true

    if (node.children && !node.array) {
      for (const child of node.children.values()) {
        if (!nodeEmpty(child)) return false
      }
      return true
    }

    return isEmptyValue(store.get(node.dataPath), node.nullValue)
  }

  const empty = computed(() => {
    void version.value

    for (const node of index.root.values()) {
      if (!nodeEmpty(node)) return false
    }
    return true
  })

  // ============== REBUILD ===============

  const rebuild = (diff: SchemaIndexDiff) => {
    for (const node of diff.removed) {
      expressionTracking.release(node)
      contexts.delete(node)
      const owner = nodeOwners.get(node)
      if (owner) {
        validator.unregister(owner)
        nodeOwners.delete(node)
      }
    }

    for (const { node, prev } of diff.changed) {
      // Cached contexts captured the previous walk facts (props, genericName,
      // dataPath); drop them and recompile rules against the new facts.
      contexts.delete(node)
      const owner = nodeOwners.get(node)
      if (owner) {
        validator.unregister(owner)
        nodeOwners.delete(node)
      }

      if (!trackingExpressions) continue

      const inputsChanged =
        prev.dataPath !== node.dataPath ||
        prev.translatable !== node.translatable ||
        !equals(prev.props, node.props)

      if (!inputsChanged) continue

      // Re-init tracking against the new facts, preserving a user's earlier
      // untrack and carrying template sources the store no longer holds
      // (already resolved). Claimed nodes bind their mounted context.
      scope.run(() => {
        expressionTracking.reinit(node, () => node.el$ ?? contextOf(node))
      })
    }

    wireAvailability()

    if (trackingExpressions) {
      scope.run(() => {
        for (const node of diff.added) {
          expressionTracking.init(node, () => node.el$ ?? contextOf(node))
        }
      })
    }

    version.value++
  }

  return {
    find,
    virtualForm$,
    submits,
    validate,
    invalid,
    errors,
    issues: validator.issues,
    payload,
    empty,
    rebuild,
    validationSchema: options.validationSchema,
    validator,
    toStandardSchema: validator.toStandardSchema,
  }
}
