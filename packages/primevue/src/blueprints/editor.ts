import '@/features/augment'
import {
  defineDefaults,
  useConfig,
  useFeatures,
  makeElement,
  makeLayout,
  makeInteraction,
  makeDisabled,
  makeReadonly,
  makePlaceholder,
  makeInput,
  makeProvider,
  makeForwards,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AriaProps,
  type ExpressionProps,
  type DisabledProps,
  type ReadonlyProps,
  type PlaceholderProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type TranslatableModelApi,
  useComponentContext,
  aliasProps,
  type TValidationProps,
  type TranslateProps,
  type TranslateModelProp,
  type LanguagesProp,
  makeMultilingual,
  makeTData,
  merge,
} from '@vueform/core'
import { computed, ref, toRef, nextTick } from 'vue'
import {
  makeAria,
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '@/features'
import type { ForwardedEmits } from '@/types'
import type {
  EditorProps as AEditorProps,
  EditorEmitsOptions as AEditorEmits,
  EditorLoadEvent,
} from 'primevue/editor'

/**
 * The model value type carried by the editor element's wide props.
 */
type EditorModel = Required<EditorProps>['modelValue']

/**
 * Props for the editor element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages`). Plain usage (`EditorProps`) keeps
 * every member wide, so no separate plain-props alias is needed.
 */
export interface EditorProps<
  T extends string = 'editor',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = EditorSlots,
  P = EditorParts,
  C = EditorClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      TranslateModelProp<TTranslate, TLanguages>,
      TContext
    >,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    PlaceholderProps<TContext>,
    InfoProps,
    /* @vue-ignore */ Omit<
      AEditorProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'placeholder'
      | 'readonly'
      | 'modules'
    >,
    Pick<AEditorProps, 'modules'> {
  /**
   * Height of the editor content area. Numbers are interpreted as pixels.
   */
  editorHeight?: string | number

  /**
   * Inline style of the container.
   */
  editorStyle?: any
}

/**
 * Events emitted by the editor element.
 */
export interface EditorEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<EditorModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<EditorModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AEditorEmits,
      (typeof forwards.events)[number],
      TContext
    > {
  /**
   * Callback to invoke when the quill modules are loaded.
   *
   * @param event Custom load event.
   * @param context$ The component's context instance.
   */
  editorLoad: [event: EditorLoadEvent, context$: TContext]
}

/**
 * Slots available in the editor element blueprint.
 */
export interface EditorSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the editor element blueprint.
 */
export interface EditorParts extends BaseElementParts {}

/**
 * CSS classes for the editor element blueprint.
 */
export interface EditorClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for editor-based components.
 */
export interface EditorExpose extends BaseElementExpose, EditorApi {}

/**
 * Factory API produced by the editor blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type EditorApi<
  TProps extends EditorProps<string> = EditorProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue Editor events and slots to forward from the Vueform adapter to the
 * underlying PrimeVue component.
 */
export const forwards = {
  events: ['value-change', 'text-change', 'selection-change'],
  slots: [],
} as const

/**
 * Builds the editor factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Element props.
 * @param events Typed emitters.
 */
export function blueprint<TProps extends EditorProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<EditorEmits>
) {
  const config = useConfig()
  const context$ = useComponentContext()

  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeReadonly())
    .use(makePlaceholder())
    .use(makeMultilingual())
    .use(makeTData())
    .use(makeInput({ canonicalDomValue: false }))
    .use(makeAria())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  const { id, language, languages, translatable } = api

  /**
   * Unique security nonce for injecting scoped styles.
   */
  const nonce = toRef(() => config.nonce)

  /**
   * Whether the editor has finished loading (Quill initialized).
   */
  const ready = ref(false)

  /**
   * A unique CSS class scoped to this editor instance, used to target the
   * injected style rule.
   */
  const editorClass = computed(() => `vf-editor-${id.value}`)

  /**
   * The generated CSS for per-instance editor height when editorHeight is set.
   * Targets both the loaded editor and the placeholder content.
   */
  const editorCss = computed(() => {
    if (props.editorHeight == null) return ''

    const cls = editorClass.value
    const h =
      typeof props.editorHeight === 'number'
        ? `${props.editorHeight}px`
        : props.editorHeight

    return [
      `.${cls} .ql-editor{height:${h}}`,
      `.${cls} [data-editor-placeholder-content]{height:${h}}`,
    ].join('')
  })

  /**
   * Quill modules config, with an optional language picker when translatable.
   */
  const modules = computed(() => {
    if (!translatable.value || !props.modules) return props.modules

    return merge(
      {
        toolbar: {
          container: [
            [
              {
                vflanguage: Object.values(languages.value),
              },
            ],
          ],
          handlers: {
            vflanguage(this: { quill: any }, value: string) {
              const index = Object.values(api.languages.value).findIndex(
                (l) => l === value
              )

              this.quill.blur()

              language.value = Object.keys(languages.value)[index]

              nextTick(() => {
                this.quill.focus()
              })
            },
          },
        },
      },
      props.modules
    )
  })

  /**
   * Handles the PrimeVue Editor load event when Quill is initialized.
   *
   * @param event The editor load event.
   */
  const handleLoad = (event: EditorLoadEvent) => {
    ready.value = true

    events.fire('editorLoad', event, context$)
  }

  return {
    ...api,
    nonce,
    ready,
    editorClass,
    editorCss,
    modules,
    handleLoad,
  }
}

/**
 * Default prop values for the editor blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<EditorProps>()({
  type: 'editor',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  translate: false,
  untrackOn: undefined,
})
