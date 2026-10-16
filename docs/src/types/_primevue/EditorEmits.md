```ts
/**
 * Events emitted by the editor element.
 */
interface EditorEmits<TContext = any>
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
```
