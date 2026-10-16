```ts
/**
 * Events emitted by the file-upload element.
 */
interface FileUploadEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<FileUploadModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<FileUploadModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AFileUploadEmits,
      (typeof forwards.events)[number],
      TContext
    > {}
```
