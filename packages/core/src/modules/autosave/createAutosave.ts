import { computed, onMounted, onUnmounted, unref, watch } from 'vue'

import { useHttp, useSecurity } from '#src/composables'
import type { VueformInstance } from '#src/helpers'
import { HttpError, type HttpResponse } from '#src/modules/http'
import {
  clone,
  debounce,
  isFileValue,
  unset,
  warn,
  isDev,
  isProd,
} from '#src/utils'

import type {
  AutosaveInstance,
  AutosaveModule,
  DraftStorage,
  MakeAutosaveOptions,
} from './types'

/**
 * The default draft save triggers (`draft.on`) — drafts save on change,
 * debounced, regardless of validity. Navigation triggers are opt-in.
 */
const DEFAULT_DRAFT_SAVE_EVENTS = ['change']

/**
 * Drops `next`/`back` from a trigger list that also names `step`. A step
 * navigation fires `step` (the page change) alongside `next`/`back` (the
 * direction), so wiring both would trigger two saves for one navigation.
 */
function dedupeNavEvents(events: string[]): string[] {
  return events.includes('step')
    ? events.filter((e) => e !== 'next' && e !== 'back')
    : events
}

/**
 * Default debounce applied to change-triggered draft saves (`draft.debounce`).
 */
const DEFAULT_DRAFT_DEBOUNCE = 1000

/**
 * Creates an autosave instance from the given app config (`$autosave` may
 * provide the default draft `storage`). The returned module's `makeAutosave`
 * wires one form's
 * saving behavior: remote autosaves to `endpoint` on the configured events and
 * interval (deferred while the form is invalid unless `invalid: true` — a
 * skipped save runs when the form becomes valid), and a `draft` mirror that
 * saves the model to storage on the configured `draft.on` events, restores it
 * on mount, and discards it on successful submit.
 *
 * @param vueform The Vueform instance; its config (`$autosave.storage` is the
 *   default draft storage; `$security` is peeked at to warn when drafts would
 *   be stored without any cipher).
 */
export function createAutosave(vueform: VueformInstance): AutosaveModule {
  const appConfig = vueform.config

  /**
   * Setup-only: binds to the calling component (lifecycle hooks, watchers), so
   * it resolves its collaborators through composables like any setup code.
   */
  const makeAutosave = (options: MakeAutosaveOptions): AutosaveInstance => {
    const $http = useHttp()
    const security = useSecurity()

    const {
      payload,
      model,
      sensitivePaths,
      invalid,
      headers,
      json,
      base64,
      name,
      load,
      form$,
      resolveEndpoint,
      fire,
      fireAsync,
      off,
      on,
    } = options

    // ============== REMOTE ================

    /**
     * The current autosave configuration object. A string prop is shorthand
     * for `{ endpoint }`.
     */
    const config = computed(() => {
      const value = unref(options.autosave)

      if (!value) return undefined

      return typeof value === 'string' ? { endpoint: value } : value
    })

    const endpoint = computed(() =>
      typeof config.value?.endpoint === 'string'
        ? resolveEndpoint(config.value.endpoint)
        : undefined
    )

    /**
     * The data a remote save sends: the form's payload (with `transformPayload`
     * applied), with `sensitive` element values stripped by data path (unless
     * `sensitive: true`), further shaped by `transform` when defined. Regular
     * submits are unaffected — they always carry the full payload.
     */
    const remoteData = computed(() => {
      let data = payload.value

      const sensitive = sensitivePaths.value

      if (sensitive.length && config.value?.sensitive !== true) {
        data = clone(data)
        sensitive.forEach((path) => unset(data, path))
      }

      const transform = config.value?.transform

      return transform ? transform(data, form$) : data
    })

    let intervalTimer: ReturnType<typeof setInterval> | undefined
    let cancelRemoteSave: (() => void) | undefined
    let cancelDraftSave: (() => void) | undefined
    let registeredHandlers: {
      event: string
      handler: (...args: any[]) => any
    }[] = []

    /**
     * Whether a save is pending: skipped by the validity gate, or rejected by
     * the server as invalid data (422) and awaiting retry. Flushed
     * automatically when the form becomes valid — only ever set while the gate
     * is active (`invalid` not enabled).
     */
    let pendingSave = false

    /**
     * The in-flight built-in request's abort controller. A new save aborts the
     * previous request first — on a slow connection, a stale response must not
     * land (or fire events) after a newer save already reported.
     */
    let inFlight: AbortController | null = null

    /**
     * Marks a rejected-as-invalid-data save (422) for retry: under the
     * validity gate the form turning valid is the retry signal, so the save is
     * left pending (flushed on the next invalid→valid transition, unless a
     * later save supersedes it). Every other failure says nothing about the
     * data and is retried by the next trigger or interval tick instead; with
     * `invalid: true`, validity never governs sending, so no failure is
     * coupled to it.
     */
    const queueInvalidRetry = (status: number | null) => {
      if (!config.value?.invalid && status === 422) {
        pendingSave = true
      }
    }

    /**
     * Performs the built-in autosave request to the given URL, aborting the
     * previous in-flight request first. Fires `autosaveResponse` (when a
     * response was received) and `autosaveFail` on `HttpError` — except an
     * aborted request, which settles silently. Returns the response, or
     * `undefined` when the request failed.
     */
    const sendRequest = async (
      url: string
    ): Promise<HttpResponse | undefined> => {
      inFlight?.abort()
      const controller = (inFlight = new AbortController())

      try {
        return await $http.request({
          url,
          method: config.value?.method ?? 'POST',
          data: remoteData.value,
          headers: headers.value,
          signal: controller.signal,
          requestType: json.value ? 'json' : 'form',
          base64: base64.value,
        })
      } catch (error: any) {
        if (error instanceof HttpError) {
          // An aborted save was superseded by a newer one (or abortAutosave()
          // was called) — its outcome belongs to nobody, so no events fire.
          if (error.reason === 'abort') return undefined

          queueInvalidRetry(error.status || null)

          if (error.response) {
            fire('autosaveResponse', error.response, form$)
          }

          fire(
            'autosaveFail',
            {
              type: 'fail',
              reason: error.status === 422 ? 'invalid' : error.reason,
              status: error.status || null,
              message: error.message,
              data: error.response?.data ?? null,
              response: error.response || null,
              context$: form$,
            },
            form$
          )
          return undefined
        }
        throw error
      } finally {
        if (inFlight === controller) inFlight = null
      }
    }

    /**
     * Judges a save's response the way a submission's is judged: a 2xx status
     * fires `autosaveResponse` + `autosaveSuccess`, any other fires
     * `autosaveResponse` + `autosaveFail` — a 422 as reason `'invalid'`,
     * joining the validity gate's retry queue. No response at all (a handler
     * that returned nothing) settles silently.
     */
    const settle = (response: HttpResponse | undefined) => {
      if (!response) return

      fire('autosaveResponse', response, form$)

      const status = response.status

      if (typeof status === 'number' && (status < 200 || status >= 300)) {
        queueInvalidRetry(status)

        fire(
          'autosaveFail',
          {
            type: 'fail',
            reason: status === 422 ? 'invalid' : 'http',
            status,
            message: `Request failed with status ${status}`,
            data: response.data ?? null,
            response,
            context$: form$,
          },
          form$
        )

        return
      }

      fire(
        'autosaveSuccess',
        {
          type: 'success',
          data: response.data,
          status,
          response,
          context$: form$,
        },
        form$
      )
    }

    /**
     * Performs a remote save, handling the pre-hook event, handler functions,
     * and URL-based requests with the response/success/fail events.
     */
    const save = async () => {
      const target = config.value?.endpoint

      if (!target) return

      // A running save supersedes any pending retry.
      pendingSave = false

      const isFunction = typeof target === 'function'

      const autosaveResponse = await fireAsync(
        'autosave',
        remoteData.value,
        form$
      )

      if (autosaveResponse === false) return

      let response: HttpResponse | undefined
      let failed = false

      const request = async (url: string) => {
        response = await sendRequest(url)
        failed = response === undefined
      }

      if (autosaveResponse !== true && autosaveResponse !== undefined) {
        if (typeof autosaveResponse === 'string') {
          await request(autosaveResponse)
        } else {
          response = autosaveResponse as HttpResponse
        }
      } else if (isFunction) {
        const fnResult = await target(remoteData.value, form$)

        if (fnResult === false) return

        if (typeof fnResult === 'string') {
          // A returned string is used as the endpoint URL — the built-in
          // request is performed against it (same as the submit endpoint).
          await request(fnResult)
        } else if (
          fnResult &&
          typeof fnResult === 'object' &&
          'status' in fnResult
        ) {
          response = fnResult as HttpResponse
        }
      } else if (endpoint.value) {
        await request(endpoint.value)
      }

      if (failed) return

      settle(response)
    }

    /**
     * Whether remote saves are currently blocked by the form's validation
     * state. A blocked save is deferred: it runs as soon as the form becomes
     * valid.
     */
    const blockedByInvalid = () => {
      const blocked = !config.value?.invalid && invalid.value

      if (blocked) {
        pendingSave = true
      }

      return blocked
    }

    // =============== DRAFT ================

    let warnedMissingKey = false
    let warnedFileValue = false
    let warnedUnencryptedDrafts = false

    /**
     * Warns once when drafts are about to be persisted without any `$security`
     * ciphers configured — storing plaintext must be a conscious choice, not a
     * silent default. Register real ciphers, opt out app-wide with identity
     * functions, or opt this form out with `draft.encrypt: false` (each
     * silences this warning).
     */
    const warnUnencryptedDrafts = () => {
      if (warnedUnencryptedDrafts || isProd()) return

      if (
        draftConfig.value?.encrypt === false ||
        appConfig.$security?.encrypt ||
        appConfig.$security?.decrypt
      )
        return

      warnedUnencryptedDrafts = true

      warn(
        'Drafts are being stored in plaintext — no `$security` ciphers are configured. Provide real ones via `createVueform({ $security: { encrypt, decrypt } })`, or consciously opt out by registering identity functions (`encrypt: (v) => v, decrypt: (v) => v`) or setting `draft.encrypt: false` on this form.'
      )
    }

    /**
     * The resolved draft configuration, or `undefined` when drafts are
     * disabled. `true` enables drafts with the defaults.
     */
    const draftConfig = computed(() => {
      const value = unref(options.draft)

      if (!value) return undefined

      return value === true ? {} : value
    })

    /**
     * The draft storage backend: the form's `draft.storage`, the app-level
     * `$autosave.storage`, then `localStorage`. `undefined` in non-browser
     * environments without a custom storage.
     */
    const draftStorage = computed<DraftStorage | undefined>(() => {
      if (!draftConfig.value) return undefined
      if (draftConfig.value.storage) return draftConfig.value.storage
      if (appConfig.$autosave?.storage) return appConfig.$autosave.storage
      if (typeof window === 'undefined' || !window.localStorage)
        return undefined

      return window.localStorage
    })

    /**
     * The draft storage key: the configured `key` or the form's `name`. Drafts
     * are disabled (with a dev warning) when neither is set.
     */
    const draftKey = computed(() => {
      if (!draftConfig.value) return undefined

      // Custom keys are namespace-enforced: `draft.key` is schema data, and
      // without the prefix a schema could read or clobber arbitrary
      // localStorage entries (`access_token`, …) through the draft cycle.
      const custom = draftConfig.value.key
      const key =
        (custom &&
          (custom.startsWith('vueform:') ? custom : `vueform:${custom}`)) ??
        (name.value && `vueform:${name.value}`)

      if (!key && !warnedMissingKey) {
        warnedMissingKey = true

        if (isDev()) {
          warn(
            'Drafts require the form to have a `name` (or `draft.key` to be set); drafts are disabled.'
          )
        }
      }

      return key || undefined
    })

    /**
     * Whether the draft mirror is active.
     */
    const draftActive = () => !!(draftStorage.value && draftKey.value)

    /**
     * The model snapshot a draft stores. Files/Blobs can't be JSON-serialized —
     * they are stripped (with a one-time dev warning). Values of `sensitive`
     * elements are stripped by data path, unless `draft.sensitive: true`.
     */
    const draftData = (): Record<string, any> => {
      const json = JSON.stringify(model.value, (_key, value) => {
        if (isFileValue(value)) {
          if (!warnedFileValue && isDev()) {
            warnedFileValue = true
            warn('File values are not stored in drafts.')
          }
          return undefined
        }
        return value
      })

      const data = JSON.parse(json)

      if (draftConfig.value?.sensitive !== true) {
        sensitivePaths.value.forEach((path) => unset(data, path))
      }

      return data
    }

    /**
     * Monotonic counter invalidating in-flight draft writes: an async cipher
     * must not land a stale draft over a newer write or a discard.
     */
    let draftWriteSeq = 0

    /**
     * Writes the given draft data to storage under an already-claimed write
     * sequence, encrypted by the security module's cipher when one is
     * configured (`$security.encrypt`) and the form hasn't opted out
     * (`draft.encrypt: false`). Fires `draftSaved` once the write lands.
     * Resolves whether the draft was written — a write superseded while
     * encrypting is dropped.
     */
    const writeDraft = async (
      data: Record<string, any>,
      seq: number
    ): Promise<boolean> => {
      try {
        const serialized = JSON.stringify(data)

        const stored =
          draftConfig.value?.encrypt === false
            ? serialized
            : await security.encrypt(serialized, 'draft')

        if (seq !== draftWriteSeq) return false

        draftStorage.value!.setItem(draftKey.value!, stored)
        fire('draftSaved', data, form$)

        return true
      } catch (error) {
        if (isDev()) {
          warn('Draft failed to save.', error)
        }
        return false
      }
    }

    /**
     * The automatic draft save (change and navigation events): fires the
     * `saveDraft` pre-hook (a handler returning `false` cancels the write),
     * then writes the current model snapshot. The snapshot is taken
     * synchronously; the write claims its sequence before any await — a
     * discard or newer save arriving during the pre-hook or encryption
     * invalidates it.
     */
    const autoSaveDraft = async () => {
      if (!draftActive()) return

      const seq = ++draftWriteSeq
      const data = draftData()

      if ((await fireAsync('saveDraft', data, form$)) === false) return

      if (seq !== draftWriteSeq) return

      await writeDraft(data, seq)
    }

    /**
     * Saves the current model snapshot to storage immediately, bypassing the
     * debounce. Unlike the automatic saves, a manual call fires no `saveDraft`
     * pre-hook — calling it _is_ the consent (`draftSaved` still fires).
     * Resolves whether a draft was written — `false` when drafts are inactive,
     * or the write was superseded or failed.
     */
    const saveDraft = async (): Promise<boolean> => {
      if (!draftActive()) return false

      const seq = ++draftWriteSeq

      return writeDraft(draftData(), seq)
    }

    /**
     * Removes the stored draft, if any, invalidating in-flight writes and
     * firing `draftDiscarded`.
     */
    const discardDraft = () => {
      if (!draftActive()) return

      draftWriteSeq++
      draftStorage.value!.removeItem(draftKey.value!)
      fire('draftDiscarded', form$)
    }

    /**
     * Reads, decrypts (unless the form opted out with `draft.encrypt: false`),
     * and parses the stored draft, removing unreadable entries — a throwing
     * `$security.decrypt` counts as corrupt, same as invalid JSON. Resolves
     * `undefined` when there's nothing (valid) stored.
     */
    const getDraft = async (): Promise<Record<string, any> | undefined> => {
      if (!draftActive()) return undefined

      const stored = draftStorage.value!.getItem(draftKey.value!)

      if (stored == null) return undefined

      try {
        return JSON.parse(
          draftConfig.value?.encrypt === false
            ? stored
            : await security.decrypt(stored, 'draft')
        )
      } catch {
        draftStorage.value!.removeItem(draftKey.value!)
        return undefined
      }
    }

    /**
     * Restores the stored draft into the form, resolving whether a draft was
     * found and restored. Unlike the automatic restore on mount, a manual call
     * fires no `restoreDraft` pre-hook — calling it _is_ the consent
     * (`draftRestored` still fires).
     */
    const restoreDraft = async (): Promise<boolean> => {
      const data = await getDraft()

      if (data === undefined) return false

      load(data)
      fire('draftRestored', data, form$)

      return true
    }

    /**
     * Restores a stored draft back into the form on mount, unless restoring is
     * disabled (`restore: false`) or a `restoreDraft` handler cancels it.
     * Fires `draftRestored` once the draft is loaded.
     */
    const autoRestore = async () => {
      if (draftConfig.value?.restore === false) return

      const data = await getDraft()

      if (data === undefined) return

      if ((await fireAsync('restoreDraft', data, form$)) === false) return

      load(data)
      fire('draftRestored', data, form$)
    }

    /**
     * Discards the stored draft after a successful submit, unless a
     * `discardDraft` handler cancels it.
     */
    const discardOnSuccess = async () => {
      if (!draftActive()) return

      if ((await fireAsync('discardDraft', form$)) === false) return

      discardDraft()
    }

    // ============== WIRING ================

    /**
     * Aborts the autosave that's underway or queued — the in-flight request, a
     * running change debounce, and a pending gated retry. Everything settles
     * silently, firing no fail event. Autosaving itself stays on — the
     * triggers and the interval keep arming future saves.
     */
    const abortAutosave = () => {
      inFlight?.abort()
      inFlight = null
      cancelRemoteSave?.()
      pendingSave = false
    }

    /**
     * Removes all previously registered event handlers, clears the interval,
     * and aborts the in-flight request.
     */
    const cleanup = () => {
      registeredHandlers.forEach(({ event, handler }) => off(event, handler))
      registeredHandlers = []
      abortAutosave()
      cancelRemoteSave = undefined
      cancelDraftSave?.()
      cancelDraftSave = undefined

      if (intervalTimer !== undefined) {
        clearInterval(intervalTimer)
        intervalTimer = undefined
      }
    }

    /**
     * Initializes all saving mechanisms: the remote interval timer and event
     * listeners, and the draft mirror's fixed event listeners.
     */
    const init = () => {
      cleanup()

      // ------------- remote -------------

      const conf = config.value

      if (conf?.endpoint) {
        const events = conf.on ?? ['change']
        const intervalMs = Number(conf.interval ?? 0)

        if (intervalMs > 0) {
          intervalTimer = setInterval(() => {
            if (blockedByInvalid()) return

            save()
          }, intervalMs)
        }

        if (events.includes('change')) {
          const debouncedSave = debounce(
            () => {
              if (blockedByInvalid()) return

              save()
            },
            Number(conf.debounce ?? 1000)
          )

          cancelRemoteSave = debouncedSave.cancel

          on('change', debouncedSave)
          registeredHandlers.push({ event: 'change', handler: debouncedSave })
        }

        const navEvents = dedupeNavEvents(events.filter((e) => e !== 'change'))

        navEvents.forEach((e) => {
          const handler = () => {
            if (blockedByInvalid()) return

            save()
          }

          on(e, handler)
          registeredHandlers.push({ event: e, handler })
        })
      }

      // ------------- draft --------------

      if (draftConfig.value) {
        warnUnencryptedDrafts()

        const draftEvents = draftConfig.value.on ?? DEFAULT_DRAFT_SAVE_EVENTS

        // The debounce bounds the serialization work while typing; the same
        // value caps staleness — when that much time has passed since the last
        // write, a change saves immediately instead of debouncing, so
        // continuous typing can't postpone the draft indefinitely.
        const debounceMs = Number(
          draftConfig.value.debounce ?? DEFAULT_DRAFT_DEBOUNCE
        )

        let lastDraftSave = 0

        const saveDraftNow = () => {
          lastDraftSave = Date.now()
          autoSaveDraft()
        }

        const debouncedDraftSave = debounce(saveDraftNow, debounceMs)
        cancelDraftSave = debouncedDraftSave.cancel

        if (draftEvents.includes('change')) {
          const handleDraftChange = () => {
            if (Date.now() - lastDraftSave >= debounceMs) {
              debouncedDraftSave.cancel()
              saveDraftNow()
            } else {
              debouncedDraftSave()
            }
          }

          on('change', handleDraftChange)
          registeredHandlers.push({
            event: 'change',
            handler: handleDraftChange,
          })
        }

        dedupeNavEvents(draftEvents.filter((e) => e !== 'change')).forEach(
          (e) => {
            const handler = () => {
              debouncedDraftSave.cancel()
              saveDraftNow()
            }

            on(e, handler)
            registeredHandlers.push({ event: e, handler })
          }
        )

        if (draftConfig.value.discardOnSuccess !== false) {
          on('success', discardOnSuccess)
          registeredHandlers.push({
            event: 'success',
            handler: discardOnSuccess,
          })
        }
      }
    }

    // ================ HOOKS ===============

    onMounted(() => {
      init()
      autoRestore()
    })
    onUnmounted(cleanup)

    // ============== WATCHERS ==============

    watch([config, draftConfig], init, { deep: true })

    // Pending saves flush on the invalid→valid transition — both saves the
    // validity gate skipped and failed saves awaiting retry.
    watch(invalid, (isInvalid) => {
      if (isInvalid || !pendingSave || !config.value?.endpoint) return

      pendingSave = false
      save()
    })

    /**
     * Performs a remote autosave immediately (when `autosave` is configured).
     * The validity gate applies as configured unless the call's `invalid`
     * option overrides the config for this one save. A gated call while the
     * form is invalid leaves the save pending: it runs as soon as the form
     * becomes valid.
     */
    const autosave = async (options?: { invalid?: boolean }): Promise<void> => {
      if (!config.value?.endpoint) return

      const allowInvalid = options?.invalid ?? config.value?.invalid

      if (!allowInvalid && invalid.value) {
        pendingSave = true
        return
      }

      await save()
    }

    return {
      autosave,
      abortAutosave,
      saveDraft,
      getDraft,
      restoreDraft,
      discardDraft,
    }
  }

  return {
    makeAutosave,
  }
}
