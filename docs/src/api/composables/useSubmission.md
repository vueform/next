# `useSubmission`

<!-- #region description -->
The host-independent submission flow shared by the form blueprint and `useModel`: cancellation guards, the submit-time validation floor, the `submit` event / endpoint dispatch chain, request encoding, and the success / fail / server-invalid / cancelled result handling with their events. Hosts contribute state and UX through the options' accessors and hooks; everything here is component-free.
<!-- #endregion description -->

<!--@include: ../../types/useSubmission.md-->

<!--
## Usage

A minimal example that uses the composable:
-->

## Params

The arguments accepted by the composable.

<!-- #region params -->

| Name | Description |
| --- | --- |
| [`options`](!code#params.options "object") | The host accessors and hooks the flow runs against. |

<!-- #endregion params -->

## Options

The properties of the options object passed to the composable.

<!-- #region options -->

| Name | Description |
| --- | --- |
| [`context$`](!code#options.context$ "any") | The context passed to events, transforms, endpoint functions, and results. |
| [`http`](!code#options.http "HttpInstance") | The http instance used for endpoint submissions. |
| [`payload`](!code#options.payload "() => any") | Returns the current submission payload. |
| [`update`](!code#options.update "(data: Record<string, any>) => void") | Applies (partial) data to the model — backs `setResponse`. |
| [`validate`](!code#options.validate "() => unknown") | Runs the host's submit-time validation (the host decides forcing). |
| [`invalid`](!code#options.invalid "() => boolean") | Whether the model is currently invalid. |
| [`errors`](!code#options.errors "() => Record<string, string[]>") | Current validation errors keyed by element path. |
| [`issues`](!code#options.issues "() => Issue[]") | Current structured validation issues. |
| [`endpoint`](!code#options.endpoint "() => EndpointProp \| undefined") | The active endpoint: a handler function, or an already-resolved URL string. |
| [`method`](!code#options.method "() => RequestMethod \| undefined") | The HTTP method for the submission request. |
| [`headers`](!code#options.headers "() => Record<string, string> \| undefined") | Custom HTTP headers for the submission request. |
| [`json`](!code#options.json "() => boolean \| undefined") | Whether to send the payload as JSON instead of FormData. |
| [`base64`](!code#options.base64 "() => boolean \| undefined") | Whether to encode file uploads as base64. |
| [`setInvalid`](!code#options.setInvalid "() => boolean \| undefined") | Whether 422 server errors should be applied via `applyServerErrors`. |
| [`setResponse`](!code#options.setResponse "() => boolean \| undefined") | Whether to update the model with the (transformed) server response data. |
| [`fire`](!code#options.fire "(e: any, args: any[]) => any") | Fires a submission event synchronously. |
| [`fireAsync`](!code#options.fireAsync "(e: any, args: any[]) => Promise<any>") | Fires a submission event asynchronously, honoring `false` cancellation. |
| [`validationDisabled?`](!code#options.validationDisabled "() => boolean") | Whether the host has disabled the submit-time validation floor (the form's `disableValidation()`). Omitted, validation always runs. |
| [`transformServerInvalid?`](!code#options.transformServerInvalid "() => ((data: any, context$: any) => Record<string, any>) \| undefined") | The server-error transform; `defaultTransformServerInvalid` when undefined. |
| [`transformResponse?`](!code#options.transformResponse "() => ((data: any, context$: any) => any) \| undefined") | The response transform; `defaultTransformResponse` when undefined. |
| [`cancelReason?`](!code#options.cancelReason "() => 'disabled' \| 'loading' \| undefined") | Returns a cancellation reason from host state (e.g. `loading`/`disabled`), or undefined when the host allows submission. An in-flight submission is always cancelled regardless. |
| [`onClientInvalid?`](!code#options.onClientInvalid "() => void \| Promise<void>") | Runs after a client-side validation failure (e.g. focus/scroll to the first error). |
| [`applyServerErrors?`](!code#options.applyServerErrors "(errors: Record<string, string[]>) => void \| Promise<void>") | Applies 422 server errors to the host's error surface (element message bags on a mounted form; the instance's server errors headlessly). Only called when `setInvalid()` is true. |
| [`onSuccess?`](!code#options.onSuccess "(result: SubmitSuccess) => void \| Promise<void>") | Runs right after the `success` event, before `setResponse` is applied (the form shows its success message and runs reset/clear-on-success here). |
| [`onAfterSuccess?`](!code#options.onAfterSuccess "(result: SubmitSuccess) => void \| Promise<void>") | Runs at the very end of a successful submission, after `setResponse` (the form scrolls to top and redirects here). |

<!-- #endregion options -->

## Returns

The reactive state and methods returned by the composable.

<!-- #region api -->

| Name | Description |
| --- | --- |
| [`submits`](!code#returns.submits "Ref<number, number>") | The number of times the form has been submitted. |
| [`submitting`](!code#returns.submitting "Ref<boolean, boolean>") | Whether the form is currently being submitted. |
| [`validating`](!code#returns.validating "Ref<boolean, boolean>") | Whether the form is currently being validated. |
| [`response`](!code#returns.response "Ref<&#10;  \| HttpResponse<any>&#10;  \| undefined, HttpResponse<any>&#10;  \| undefined&#10;>") | The HTTP response from the most recent submission. |
| [`result`](!code#returns.result "Ref<SubmitResult \| undefined, SubmitResult \| undefined>") | The result object from the most recent submission attempt. |
| [`submit()`](!code#returns.submit "() => Promise<SubmitResult \| undefined>") | Validates and submits the form, returning a result describing the outcome. |
| [`abort()`](!code#returns.abort "() => void") | Aborts the current in-flight submission request. |

<!-- #endregion api -->
