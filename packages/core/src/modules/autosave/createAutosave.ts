import { computed, onMounted, onUnmounted, unref, watch } from 'vue'
import { useHttp, useSecurity } from '@core/composables'
import type { VueformInstance } from '@core/helpers'
import { HttpError, type HttpResponse } from '@core/modules/http'
import { debounce, isFileValue, unset, warn, isDev, isProd } from '@core/utils'
import type {
  AutosaveInstance,
  AutosaveModule,
  AutosaveStorage,
  MakeAutosaveOptions,
} from './types'

/**
 * Navigation events that trigger an immediate local draft save. Fixed by design
 * — the local mirror saves on every action, regardless of validity.
 */
const LOCAL_NAV_SAVE_EVENTS = ['next', 'back', 'step', 'tab']

/**
 * Debounce applied to change-triggered local saves, bounding the synchronous
 * model serialization work while the user types. Fixed by design.
 */
const LOCAL_SAVE_DEBOUNCE = 100

/**
 * Upper bound on local draft staleness: when this much time has passed since
 * the last write, a change saves immediately instead of debouncing — so
 * continuous typing can't postpone the draft indefinitely.
 */
const LOCAL_SAVE_MAX_WAIT = 1000

/**
 * Creates an autosave instance from the given app config (`$autosave` is
 * currently reserved). The returned module's `makeAutosave` wires one form's
 * autosave behavior: remote saves to `endpoint` on the configured events and
 * interval (deferred while the form is invalid unless `invalid: true` — a
 * skipped save runs when the form becomes valid), and a `local` draft mirror
 * that saves the model to storage on every action, loads it back on mount, and
 * clears it on successful submit.
 *
 * @param vueform The Vueform instance; its config (`$autosave` is reserved;
 *   `$security` is peeked at to warn when local drafts would be stored without
 *   any cipher).
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
      autosave,
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

    /**
     * The current autosave configuration object.
     */
    const config = computed(() => unref(autosave))

    // ============== REMOTE ================

    const endpoint = computed(() =>
      typeof config.value?.endpoint === 'string'
        ? resolveEndpoint(config.value.endpoint)
        : undefined
    )

    /**
     * The data a remote save sends: the form's payload (with `transformPayload`
     * applied), further shaped by `transform` when defined.
     */
    const remoteData = computed(() => {
      const transform = config.value?.transform

      if (transform) {
        return transform(payload.value, form$)
      }
      return payload.value
    })

    let intervalTimer: ReturnType<typeof setInterval> | undefined
    let cancelLocalSave: (() => void) | undefined
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
     * Performs the built-in autosave request to the given URL, firing
     * `autosaveFail` on `HttpError`. Returns the response, or `undefined` when
     * the request failed.
     */
    const sendRequest = async (
      url: string
    ): Promise<HttpResponse | undefined> => {
      try {
        return await $http.request({
          url,
          method: config.value?.method ?? 'POST',
          data: remoteData.value,
          headers: headers.value,
          requestType: json.value ? 'json' : 'form',
          base64: base64.value,
        })
      } catch (error: any) {
        if (error instanceof HttpError) {
          // Under the validity gate, a 422 means the server rejected the data
          // itself — the form turning valid is the retry signal, so the save
          // is left pending (flushed on the next invalid→valid transition,
          // unless a later save supersedes it). Every other failure says
          // nothing about the data and is retried by the next trigger or
          // interval tick instead; with `invalid: true`, validity never
          // governs sending, so no failure is coupled to it.
          if (!config.value?.invalid && error.status === 422) {
            pendingSave = true
          }

          fire('autosaveFail', error, form$)
          return undefined
        }
        throw error
      }
    }

    /**
     * Performs a remote save, handling the pre-hook event, handler functions,
     * and URL-based requests with success/fail events.
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

      if (autosaveResponse !== true && autosaveResponse !== undefined) {
        response =
          typeof autosaveResponse === 'string'
            ? await sendRequest(autosaveResponse)
            : (autosaveResponse as HttpResponse)
      } else if (isFunction) {
        const fnResult = await target(remoteData.value, form$)

        if (fnResult === false) return

        if (typeof fnResult === 'string') {
          // A returned string is used as the endpoint URL — the built-in
          // request is performed against it (same as the submit endpoint).
          response = await sendRequest(fnResult)
        } else if (
          fnResult &&
          typeof fnResult === 'object' &&
          'status' in fnResult
        ) {
          response = fnResult as HttpResponse
        }
      } else if (endpoint.value) {
        response = await sendRequest(endpoint.value)
      }

      if (response) {
        fire('autosaveSuccess', response, form$)
      }
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

    // =============== LOCAL ================

    let warnedMissingKey = false
    let warnedFileValue = false
    let warnedUnencryptedDrafts = false

    /**
     * Warns once when local drafts are about to be persisted without any
     * `$security` ciphers configured — storing plaintext must be a conscious
     * choice, not a silent default. Register real ciphers, opt out app-wide
     * with identity functions, or opt this form out with `local.encrypt: false`
     * (each silences this warning).
     */
    const warnUnencryptedDrafts = () => {
      if (warnedUnencryptedDrafts || isProd()) return

      if (
        localConfig.value?.encrypt === false ||
        appConfig.$security?.encrypt ||
        appConfig.$security?.decrypt
      )
        return

      warnedUnencryptedDrafts = true

      warn(
        'Local autosave is storing drafts in plaintext — no `$security` ciphers are configured. Provide real ones via `createVueform({ $security: { encrypt, decrypt } })`, or consciously opt out by registering identity functions (`encrypt: (v) => v, decrypt: (v) => v`) or setting `autosave.local.encrypt: false` on this form.'
      )
    }

    /**
     * The resolved local configuration, or `undefined` when local autosave is
     * disabled.
     */
    const localConfig = computed(() => {
      const local = config.value?.local

      if (!local) return undefined

      return typeof local === 'object' ? local : {}
    })

    /**
     * The local storage backend. `undefined` in non-browser environments
     * without a custom storage.
     */
    const localStorageBackend = computed<AutosaveStorage | undefined>(() => {
      if (!localConfig.value) return undefined
      if (localConfig.value.storage) return localConfig.value.storage
      if (typeof window === 'undefined' || !window.localStorage)
        return undefined

      return window.localStorage
    })

    /**
     * The local storage key: the configured `key` or the form's `name`. Local
     * autosave is disabled (with a dev warning) when neither is set.
     */
    const localKey = computed(() => {
      if (!localConfig.value) return undefined

      // Custom keys are namespace-enforced: `local.key` is schema data, and
      // without the prefix a schema could read or clobber arbitrary
      // localStorage entries (`access_token`, …) through the autosave cycle.
      const custom = localConfig.value.key
      const key =
        (custom &&
          (custom.startsWith('vueform:') ? custom : `vueform:${custom}`)) ??
        (name.value && `vueform:${name.value}`)

      if (!key && !warnedMissingKey) {
        warnedMissingKey = true

        if (isDev()) {
          warn(
            'Local autosave requires the form to have a `name` (or `autosave.local.key` to be set); local autosave is disabled.'
          )
        }
      }

      return key || undefined
    })

    /**
     * Whether the local draft mirror is active.
     */
    const localActive = () => !!(localStorageBackend.value && localKey.value)

    // Files/Blobs can't be JSON-serialized — they are stripped from local
    // drafts (with a one-time dev warning). Values of `sensitive` elements are
    // stripped by data path.
    const serializeLocal = () => {
      const json = JSON.stringify(model.value, (_key, value) => {
        if (isFileValue(value)) {
          if (!warnedFileValue && isDev()) {
            warnedFileValue = true
            warn('File values are not stored by local autosave.')
          }
          return undefined
        }
        return value
      })

      const sensitive = sensitivePaths.value

      if (!sensitive.length) return json

      const data = JSON.parse(json)

      sensitive.forEach((path) => unset(data, path))

      return JSON.stringify(data)
    }

    /**
     * Monotonic counter invalidating in-flight local writes: an async cipher
     * must not land a stale draft over a newer write or a clear.
     */
    let localWriteSeq = 0

    /**
     * Writes the current model snapshot to local storage, encrypted by the
     * security module's cipher when one is configured (`$security.encrypt`) and
     * the form hasn't opted out (`local.encrypt: false`). The snapshot is taken
     * synchronously; a save superseded while encrypting is dropped.
     */
    const saveLocal = async () => {
      if (!localActive()) return

      const seq = ++localWriteSeq

      try {
        const serialized = serializeLocal()

        const stored =
          localConfig.value?.encrypt === false
            ? serialized
            : await security.encrypt(serialized, 'autosave:local')

        if (seq !== localWriteSeq) return

        localStorageBackend.value!.setItem(localKey.value!, stored)
      } catch (error) {
        if (isDev()) {
          warn('Local autosave failed to write.', error)
        }
      }
    }

    /**
     * Removes the locally stored draft, if any, invalidating in-flight writes.
     */
    const clearAutosaved = () => {
      if (!localActive()) return

      localWriteSeq++
      localStorageBackend.value!.removeItem(localKey.value!)
    }

    /**
     * Reads, decrypts (unless the form opted out with `local.encrypt: false`),
     * and parses the stored draft, removing unreadable entries — a throwing
     * `$security.decrypt` counts as corrupt, same as invalid JSON. Returns
     * `undefined` when there's nothing (valid) stored.
     */
    const readStored = async (): Promise<Record<string, any> | undefined> => {
      if (!localActive()) return undefined

      const stored = localStorageBackend.value!.getItem(localKey.value!)

      if (stored == null) return undefined

      try {
        return JSON.parse(
          localConfig.value?.encrypt === false
            ? stored
            : await security.decrypt(stored, 'autosave:local')
        )
      } catch {
        localStorageBackend.value!.removeItem(localKey.value!)
        return undefined
      }
    }

    /**
     * Loads the stored draft into the form, resolving whether a draft was found
     * and loaded. Unlike the automatic load on mount, a manual call fires no
     * `autosaveRestore` pre-hook — calling it _is_ the consent.
     */
    const loadAutosaved = async (): Promise<boolean> => {
      const data = await readStored()

      if (data === undefined) return false

      load(data)

      return true
    }

    /**
     * Loads a stored draft back into the form on mount, unless loading is
     * disabled (`load: false`) or an `autosaveRestore` handler cancels it.
     */
    const autoLoad = async () => {
      if (localConfig.value?.load === false) return

      const data = await readStored()

      if (data === undefined) return

      if ((await fireAsync('autosaveRestore', data, form$)) === false) return

      load(data)
    }

    // ============== WIRING ================

    /**
     * Removes all previously registered event handlers and clears the interval.
     */
    const cleanup = () => {
      registeredHandlers.forEach(({ event, handler }) => off(event, handler))
      registeredHandlers = []
      pendingSave = false
      cancelLocalSave?.()
      cancelLocalSave = undefined

      if (intervalTimer !== undefined) {
        clearInterval(intervalTimer)
        intervalTimer = undefined
      }
    }

    /**
     * Initializes all autosave mechanisms: the remote interval timer and event
     * listeners, and the local mirror's fixed event listeners.
     */
    const init = () => {
      cleanup()

      const conf = config.value

      if (!conf) return

      // ------------- remote -------------

      if (conf.endpoint) {
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
            Number(conf.delay ?? 1000)
          )

          on('change', debouncedSave)
          registeredHandlers.push({ event: 'change', handler: debouncedSave })
        }

        const navEvents = events.filter((e) => e !== 'change')

        navEvents.forEach((e) => {
          const handler = () => {
            if (blockedByInvalid()) return

            save()
          }

          on(e, handler)
          registeredHandlers.push({ event: e, handler })
        })
      }

      // ------------- local --------------

      if (conf.local) {
        warnUnencryptedDrafts()

        let lastLocalSave = 0

        const saveLocalNow = () => {
          lastLocalSave = Date.now()
          saveLocal()
        }

        const debouncedLocalSave = debounce(saveLocalNow, LOCAL_SAVE_DEBOUNCE)
        cancelLocalSave = debouncedLocalSave.cancel

        const handleLocalChange = () => {
          if (Date.now() - lastLocalSave >= LOCAL_SAVE_MAX_WAIT) {
            debouncedLocalSave.cancel()
            saveLocalNow()
          } else {
            debouncedLocalSave()
          }
        }

        on('change', handleLocalChange)
        registeredHandlers.push({ event: 'change', handler: handleLocalChange })

        LOCAL_NAV_SAVE_EVENTS.forEach((e) => {
          const handler = () => {
            debouncedLocalSave.cancel()
            saveLocalNow()
          }

          on(e, handler)
          registeredHandlers.push({ event: e, handler })
        })

        if (localConfig.value?.clear !== false) {
          on('success', clearAutosaved)
          registeredHandlers.push({ event: 'success', handler: clearAutosaved })
        }
      }
    }

    // ================ HOOKS ===============

    onMounted(() => {
      init()
      autoLoad()
    })
    onUnmounted(cleanup)

    // ============== WATCHERS ==============

    watch(config, init, { deep: true })

    // Pending saves flush on the invalid→valid transition — both saves the
    // validity gate skipped and failed saves awaiting retry.
    watch(invalid, (isInvalid) => {
      if (isInvalid || !pendingSave || !config.value?.endpoint) return

      pendingSave = false
      save()
    })

    /**
     * Performs an autosave immediately: writes the local draft (when `local` is
     * configured) and runs the remote save (when `endpoint` is configured). The
     * validity gate applies as configured unless the call's `invalid` option
     * overrides the config for this one save. A gated call while the form is
     * invalid still writes the local draft and leaves the remote save pending.
     */
    const triggerAutosave = async (options?: {
      invalid?: boolean
    }): Promise<void> => {
      const allowInvalid = options?.invalid ?? config.value?.invalid

      if (!allowInvalid && invalid.value) {
        pendingSave = true

        await saveLocal()
        return
      }

      await Promise.all([saveLocal(), save()])
    }

    return {
      autosave: triggerAutosave,
      clearAutosaved,
      loadAutosaved,
    }
  }

  return {
    makeAutosave,
  }
}
