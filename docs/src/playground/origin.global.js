var Vueform = (function (e, r) {
  'use strict'
  var t = Object.defineProperty,
    n = (e, r, n) =>
      ((e, r, n) =>
        r in e
          ? t(e, r, {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: n,
            })
          : (e[r] = n))(e, 'symbol' != typeof r ? r + '' : r, n)
  class a extends Error {
    constructor() {
      ;(super('Vueform is not installed'), (this.name = 'NotInstalledError'))
    }
  }
  const o = new WeakMap(),
    l = (...e) => {
      var t
      const n = e[0],
        a = null == (t = r.getCurrentInstance()) ? void 0 : t.proxy
      if (null == a && !r.hasInjectionContext())
        throw new Error('injectLocal must be called in setup')
      return a && o.has(a) && n in o.get(a) ? o.get(a)[n] : r.inject(...e)
    }
  function s(e) {
    if (!r.isRef(e)) return r.reactive(e)
    const t = new Proxy(
      {},
      {
        get: (t, n, a) => r.unref(Reflect.get(e.value, n, a)),
        set: (t, n, a) => (
          r.isRef(e.value[n]) && !r.isRef(a)
            ? (e.value[n].value = a)
            : (e.value[n] = a),
          !0
        ),
        deleteProperty: (r, t) => Reflect.deleteProperty(e.value, t),
        has: (r, t) => Reflect.has(e.value, t),
        ownKeys: () => Object.keys(e.value),
        getOwnPropertyDescriptor: () => ({ enumerable: !0, configurable: !0 }),
      }
    )
    return r.reactive(t)
  }
  function i(e) {
    return s(r.computed(e))
  }
  function u(e) {
    const t = r.getCurrentInstance(),
      n = (function (e, t, n = {}) {
        let a,
          o,
          l,
          s = !0
        const i = () => {
          ;((s = !0), l())
        }
        r.watch(e, i, { flush: 'sync', ...n })
        const u = 'function' == typeof t ? t : t.get,
          d = 'function' == typeof t ? void 0 : t.set,
          c = r.customRef(
            (e, r) => (
              (o = e),
              (l = r),
              {
                get: () => (s && ((a = u(a)), (s = !1)), o(), a),
                set(e) {
                  null == d || d(e)
                },
              }
            )
          )
        return ((c.trigger = i), c)
      })(
        () => null,
        () => t.proxy.$el
      )
    return (r.onUpdated(n.trigger), r.onMounted(n.trigger), n)
  }
  function d(e, t, n) {
    return (
      (null == n ? void 0 : n.provide(e, t)) ??
        (function (e, t) {
          var n
          const a = null == (n = r.getCurrentInstance()) ? void 0 : n.proxy
          if (null == a) throw new Error('provideLocal must be called in setup')
          ;(o.has(a) || o.set(a, Object.create(null)),
            (o.get(a)[e] = t),
            r.provide(e, t))
        })(e, t),
      t
    )
  }
  function c(e) {
    return [
      function (t = e) {
        return (function (e) {
          return r.getCurrentInstance() ? l(e, void 0) : r.inject(e, void 0)
        })(t)
      },
      function (r, t) {
        return d(e, r, t)
      },
    ]
  }
  'undefined' != typeof WorkerGlobalScope && (globalThis, WorkerGlobalScope)
  const [p, f] = c('vueform-config')
  function m() {
    return (function () {
      const e = p()
      if (!e) throw new a()
      return e
    })()
  }
  function v(e, r) {
    return Array.isArray(e)
      ? e.concat(r)
      : Array.isArray(r)
        ? [e, ...r]
        : [e, r]
  }
  function g(e) {
    return Array.isArray(e) ? e : [e]
  }
  function y(e, r = 'value', t = 'label') {
    return e
      ? Array.isArray(e)
        ? e.length > 0 && 'string' == typeof e[0]
          ? e.map((e) => ({ [r]: e, [t]: e }))
          : e
        : Object.entries(e).map(([e, n]) => ({ [r]: e, [t]: n }))
      : []
  }
  function h(e, r, t) {
    if (
      void 0 === r ||
      void 0 === t ||
      r === t ||
      r < 0 ||
      r >= e.length ||
      t < 0 ||
      t > e.length
    )
      return e
    const n = [...e],
      [a] = n.splice(r, 1)
    return (n.splice(t, 0, a), n)
  }
  function b(e, r) {
    if (r) {
      if (e) {
        if ('string' == typeof e && 'string' == typeof r)
          return e.length ? (r.length ? `${e} ${r}` : e) : r
        if ('function' == typeof e)
          return (...t) => b(e(...t), 'function' == typeof r ? r(...t) : r)
        if ('function' == typeof r)
          throw new Error('Merged value cannot be a function')
        return v(e, r)
      }
      return r
    }
    return e
  }
  function k(e) {
    return e
      .replace(/[-_\s]+(.)?/g, (e, r) => (r ? r.toUpperCase() : ''))
      .replace(/^(.)/, (e) => e.toUpperCase())
  }
  function B(e) {
    return e.replace(
      /[A-Z]+(?![a-z])|[A-Z]/g,
      (e, r) => (r ? '-' : '') + e.toLowerCase()
    )
  }
  function w(e) {
    return e && 'string' == typeof e
      ? e
          .split('-')
          .map((e) =>
            0 === e.length ? '' : e.charAt(0).toUpperCase() + e.slice(1)
          )
          .join('')
      : ''
  }
  function x(e) {
    const r = e.match(/^\/(.+)\/([a-z]*)$/i)
    return r
      ? new RegExp(r[1] || '', r[2])
      : (console.warn('[Vueform warn]: Invalid regex string format'),
        new RegExp(''))
  }
  function $(e) {
    if ('object' != typeof e || null === e || Array.isArray(e)) return !1
    if (
      e instanceof Date ||
      e instanceof RegExp ||
      e instanceof Map ||
      e instanceof Set ||
      ArrayBuffer.isView(e) ||
      e instanceof ArrayBuffer
    )
      return !1
    if ('function' == typeof File && e instanceof File) return !1
    const r = Object.getPrototypeOf(e)
    return null === r || r === Object.prototype
  }
  function C(e) {
    var r
    if (
      null == e ||
      'string' == typeof e ||
      'number' == typeof e ||
      'boolean' == typeof e
    )
      return e
    if ('function' == typeof e) return e
    if (e instanceof Date) return new Date(e.getTime())
    if ('undefined' != typeof File && e instanceof File)
      return new File([e], e.name, {
        type: e.type,
        lastModified: e.lastModified,
      })
    if (
      'object' == typeof e &&
      e &&
      'File' === (null == (r = e.constructor) ? void 0 : r.name)
    )
      console.warn(
        '[Vueform warn]: File detected but not supported in Node, skipping:',
        e
      )
    else {
      if (Array.isArray(e)) return e.map(C)
      if ('object' == typeof e) {
        const r = {}
        for (const t of Object.keys(e)) {
          const n = e[t]
          r[t] = C(n)
        }
        return r
      }
      console.warn(
        `[Vueform warn]: Skipping unsupported type "${typeof e}" during clone`,
        e
      )
    }
  }
  function S(e, r) {
    if (e === r) return !0
    if (null === e || null === r || void 0 === e || void 0 === r) return !1
    if (typeof e != typeof r) return !1
    if ('object' != typeof e) return e === r
    if (Array.isArray(e)) {
      if (!Array.isArray(r) || e.length !== r.length) return !1
      for (let t = 0; t < e.length; t++) if (!S(e[t], r[t])) return !1
      return !0
    }
    if (Array.isArray(r)) return !1
    const t = e,
      n = r,
      a = Object.keys(t),
      o = Object.keys(n)
    if (a.length !== o.length) return !1
    for (let l = 0; l < a.length; l++) {
      const e = a[l]
      if (!S(t[e], n[e])) return !1
    }
    return !0
  }
  function E(e) {
    return Object.entries(e || {})
  }
  function _(e) {
    return Object.keys(e)
  }
  function O(e, r) {
    if (Object.prototype.hasOwnProperty.call(e, r)) return !0
    const t = r.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    if (Object.prototype.hasOwnProperty.call(e, t)) return !0
    const n = t.replace(/-([a-z])/g, (e, r) => r.toUpperCase())
    return Object.prototype.hasOwnProperty.call(e, n)
  }
  function A(e, r, t, n = !0) {
    return void 0 === r
      ? e
      : n
        ? void 0 === e
          ? r
          : e === r
            ? e
            : 'classes' === t
              ? (function (e, r) {
                  const t = { ...e }
                  return (
                    r.forEach((e) => {
                      for (const r in e) t[r] = b(t[r], e[r])
                    }),
                    t
                  )
                })(e, [r])
              : 'presets' === t && n
                ? [...e, ...r]
                : $(e) && $(r)
                  ? { ...e, ...r }
                  : r
        : r
  }
  function V(e, r, t, n) {
    const a = { ...e }
    for (const o of Object.keys(r)) {
      const e = r[o],
        l = a[o]
      $(l) && $(e) && t < n
        ? (a[o] = V(l, e, t + 1, n))
        : $(e)
          ? (a[o] = { ...e })
          : Array.isArray(e)
            ? (a[o] = [...e])
            : (a[o] = e)
    }
    return a
  }
  function P(e, r, t = 1 / 0) {
    return V(e, r, 0, t)
  }
  function D(e, r) {
    if (!$(e) || !$(r)) return r
    const t = { ...e }
    for (const n of Object.keys(r)) t[n] = D(e[n], r[n])
    return t
  }
  const [F, j] = c('vueform-globals')
  function R() {
    return F()
  }
  const [T, M] = c('vueform-services')
  function N(e) {
    const r = m()
    if (!r) throw new Error('Config context does not exist')
    let t = 'runWithContext' in e ? void 0 : e,
      n = 'runWithContext' in e ? e : void 0,
      o = {}
    try {
      o = { ...I() }
    } catch (s) {
      if (!(s instanceof a)) throw s
    }
    const l = R()
    for (const [a, i] of E(r.services))
      o[a] = i({ config: r, $services: o, form$: t, globals: l })
    return (M(o, n), o)
  }
  function I() {
    const e = T()
    if (!e) throw new a()
    return e
  }
  function L(e) {
    const r = I()[e]
    if (!r) throw new Error(`Service \`${e}\` is not registered`)
    return r
  }
  function q() {
    return L('$conditions')
  }
  function H() {
    return L('$http')
  }
  function z() {
    return L('$locale')
  }
  function W() {
    return z()
  }
  function U() {
    return L('$messageBag')
  }
  function G() {
    return L('$security')
  }
  function K() {
    const e = r.getCurrentInstance()
    if (!e || !e.proxy)
      throw new Error(
        '`useCurrentName()` must be called within setup() context'
      )
    return e.proxy.$options.name || e.type.name || ''
  }
  function Y() {
    const e = r.getCurrentInstance()
    if (!e || !e.proxy)
      throw new Error(
        '`useCurrentInstance()` must be called within setup() context'
      )
    return e
  }
  const [Z, X] = c('vueform-form')
  function J() {
    return Z()
  }
  const Q = Symbol('raw-exposed'),
    [ee, re] = c('vueform-component')
  function te() {
    const e = ee()
    if (!e) throw new Error('Component context is not available')
    return e
  }
  const [ne, ae] = c('vueform-element')
  function oe() {
    return ne()
  }
  function le() {
    const { resolve: e, installed: t, usedPaths: n } = L('$expression'),
      a = oe(),
      o = J(),
      l = m(),
      s = r.computed(() => {
        var e, r, t
        return (
          (null == (e = null == a ? void 0 : a.props)
            ? void 0
            : e.expressions) ??
          (null == (r = null == o ? void 0 : o.props)
            ? void 0
            : r.expressions) ??
          (null == (t = l.$expression) ? void 0 : t.trigger) ??
          !0
        )
      }),
      i = (e) => {
        var r
        return (
          !1 !== (null == (r = l.$expression) ? void 0 : r.enabled) &&
          (!0 === s.value || (Array.isArray(s.value) && s.value.includes(e)))
        )
      }
    function u(r) {
      if (!r || !t) return r
      let n = null == o ? void 0 : o.model
      const l = null == o ? void 0 : o.resolvedConsts
      return (l && n && (n = { ...l, ...n }), e(r, n, a))
    }
    return {
      installed: t,
      resolve: u,
      allowed: i,
      usedPaths: n,
      resolveIfAllowed: function (e, r) {
        return i(e) ? u(r) : r
      },
    }
  }
  const [se, ie] = c('vueform-view')
  const ue = /^[A-Z][A-Za-z0-9]+$/,
    de = /^<([a-zA-Z][a-zA-Z0-9-]*)((?:\s[^>]*)?)>([\s\S]*)<\/\1>$/,
    ce = /([\w-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([\w-]+)))?/g
  function pe(e) {
    const r = {}
    for (const t of e.matchAll(ce)) r[t[1]] = t[2] ?? t[3] ?? t[4] ?? !0
    return r
  }
  function fe(e) {
    const t = K(),
      n = m(),
      a = se(),
      { sanitize: o } = G(),
      { allowed: l, resolve: s } = le()
    var i
    ;((i = r.toRef(() =>
      null === e.view ? void 0 : e.view || (null == a ? void 0 : a.value)
    )),
      ie(i))
    const u = r.computed(() => {
        const t = {}
        for (const n in e.slots) {
          let a = e.slots[n]
          if ('string' == typeof a) {
            if (!ue.test(a)) {
              const e = l('slots') || l(`slots.${n}`),
                t = a,
                i = () => {
                  const n = o(t),
                    a = e ? s(n) : n
                  if (!a.includes('<')) return r.h('span', null, a)
                  const l = a.match(de)
                  if (l) {
                    const e = pe(l[2])
                    return ((e.innerHTML = l[3]), r.h(l[1], e))
                  }
                  return r.h('span', { innerHTML: a })
                }
              ;((i.inheritAttrs = !1), (a = r.markRaw(i)))
            }
          } else
            a &&
              'object' == typeof a &&
              !0 !== a.inheritAttrs &&
              (a = r.markRaw({ ...a, inheritAttrs: !1 }))
          t[n] = a
        }
        return t
      }),
      d = r.computed(() => {
        if (null === e.template) return null
        const o =
            null === e.view ? void 0 : e.view || (null == a ? void 0 : a.value),
          l =
            e.template ||
            u.value.template ||
            n.templates[`${t}_${o}`] ||
            n.templates[t]
        return l && 'string' != typeof l ? r.markRaw(l) : (l ?? null)
      })
    return { template: d, slots: u }
  }
  function me(e, r) {
    if (!e) return !1
    if ('function' == typeof e) return e(r)
    const { name: t } = r
    if (!t) throw Error('Vueform components must have a `name` defined.')
    const n = r.element ?? !1
    return g(e).some(
      (e) =>
        '*' === e ||
        e === t ||
        ('*element' === e && n) ||
        (e instanceof RegExp && e.test(t))
    )
  }
  function ve(e) {
    return (t, n) =>
      (function (e, t) {
        var n
        const a = m(),
          o = r.getCurrentInstance()
        if (!o || !o.proxy)
          throw new Error(
            '`usePlugins()` must be called within setup() context'
          )
        const l = null == (n = o.proxy) ? void 0 : n.$options,
          s = o.props || o.proxy.$props,
          i = e(),
          u = t ? { ...i, ...t } : i,
          d = ({ apply: e, extend: r, plugins: t }) => {
            ;(me(e, l) && (null == r || r(s, u)), null == t || t.forEach(d))
          }
        return (a.plugins.forEach(d), i)
      })(() => {
        const a = te(),
          o = n.fire
        r.onBeforeMount(() => o('beforeMount', a))
        const l = e(t, n)
        return (
          r.onMounted(() => o('mounted', a)),
          r.onBeforeUnmount(() => o('beforeUnmount', a)),
          r.onUnmounted(() => o('unmounted', a)),
          r.onUpdated(() => o('updated', a)),
          { ...l }
        )
      }, n)
  }
  const ge = {},
    ye = ve((e, t) => {
      const { sanitize: n } = G(),
        { localize: a } = z(),
        { template: o, slots: l } = fe(e)
      return {
        template: o,
        slots: l,
        resolved: r.computed(() => {
          if (!e.addon) return
          const r = e.addon
          if ('object' == typeof r && 'type' in r) {
            const e = r
            return { component: e.component || `Vf${w(e.type)}`, props: e }
          }
          const t = n(
            a('string' == typeof r || 'object' == typeof r ? r : void 0)
          )
          return t ? String(t) : void 0
        }),
      }
    })
  function he(e, ...t) {
    var n, a, o, l, s, i
    const u = m(),
      d = te(),
      c = Y(),
      p = (null == (n = c.vnode) ? void 0 : n.props) || {},
      f = new Set()
    for (const r of t) _('function' == typeof r ? r() : r).forEach(f.add, f)
    const v = !!(null == (a = u.components[e]) ? void 0 : a.element),
      g = [
        null == (o = u.baseClasses) ? void 0 : o['*'],
        v ? (null == (l = u.baseClasses) ? void 0 : l['*element']) : void 0,
        null == (s = u.baseClasses) ? void 0 : s[e],
      ].filter(Boolean)
    for (const r of g) _(r).forEach(f.add, f)
    for (const r in p)
      r.startsWith('class:')
        ? f.add(r.slice(6))
        : r.startsWith('reclass:') && f.add(r.slice(8))
    const y = null == (i = c.__vfProps) ? void 0 : i.classes
    if (y) for (const r of Object.keys(y)) f.add(r)
    const h = r.computed(() =>
        t.map((e) => ('function' == typeof e ? e() : e))
      ),
      k = r.reactive({}),
      B = r.ref(),
      w = r.ref()
    ;(Object.defineProperty(k, 'extend', {
      value: (e) => {
        B.value = e
        const r = 'function' == typeof e ? e() : e
        for (const t in r) t in k || $(t)
      },
      enumerable: !1,
      configurable: !1,
    }),
      Object.defineProperty(k, 'replace', {
        value: (e) => {
          w.value = e
        },
        enumerable: !1,
        configurable: !1,
      }))
    const x = (e, r) =>
        r && 'function' == typeof e
          ? (...r) => e(...r, d)
          : 'function' == typeof e
            ? e(d)
            : e,
      $ = (t) => {
        k[t] = r.computed(() => {
          var r, n, a, o, l, s, i, c
          const f = d.props,
            m = h.value.reduce((e, r) => b(e, null == r ? void 0 : r[t]), null),
            y = g.reduce((e, r) => b(e, null == r ? void 0 : r[t]), null)
          let k = b(y, m)
          const $ = 'function' == typeof k,
            C = w.value
              ? 'function' == typeof w.value
                ? w.value()
                : w.value
              : void 0,
            S = B.value
              ? 'function' == typeof B.value
                ? B.value()
                : B.value
              : void 0
          ;(C && t in C && (k = x(C[t], $)),
            S && t in S && (k = b(k, x(S[t], $))))
          const E =
              (null == (n = null == (r = u.reclass) ? void 0 : r[e])
                ? void 0
                : n[t]) ??
              (v
                ? null == (o = null == (a = u.reclass) ? void 0 : a['*element'])
                  ? void 0
                  : o[t]
                : void 0) ??
              (null == (s = null == (l = u.reclass) ? void 0 : l['*'])
                ? void 0
                : s[t]),
            _ = (null == (i = f.reclass) ? void 0 : i[t]) ?? p[`reclass:${t}`],
            O = null == (c = f.classes) ? void 0 : c[t],
            A = p[`class:${t}`],
            V = f.class
          if (
            (_ ? (k = x(_, $)) : E && (k = x(E, $)),
            $ && 'function' != typeof k)
          ) {
            const e = k
            k = () => e
          }
          return (
            O && (k = b(k, x(O, $))),
            A && (k = b(k, x(A, $))),
            t.startsWith('root') && V && (k = b(k, V)),
            u.classHelpers && 'production' !== process.env.NODE_ENV
              ? ((e, r, t, n) => {
                  const a = n(`${r}.${String(t)}`)
                  return (e =
                    'function' == typeof e
                      ? (...r) => {
                          const t = e(...r)
                          return t ? b(a, t) : null
                        }
                      : e
                        ? b(a, e)
                        : null)
                })(k, e, t, u.classHelper)
              : k
          )
        })
      }
    return (
      f.forEach((e) => {
        'string' == typeof e && $(e)
      }),
      k
    )
  }
  function be(e) {
    const t = r.useAttrs(),
      n = te(),
      a = new Map(),
      o = (r) => {
        var n
        return t[`part:${r}`] ?? (null == (n = e.parts) ? void 0 : n[r])
      }
    return new Proxy(
      {},
      {
        get(e, t) {
          if ('string' != typeof t) return
          const l = o(t)
          if ('function' != typeof l) return l
          const s = a.get(t)
          if (s && s.source === l) return s.proxy
          const i = (function (e, t) {
            const n = r.computed(() => e(t))
            return new Proxy((...r) => e(...r, t), {
              get(e, r) {
                var t
                return null == (t = n.value) ? void 0 : t[r]
              },
              ownKeys: () =>
                null != n.value && 'object' == typeof n.value
                  ? Reflect.ownKeys(n.value)
                  : [],
              getOwnPropertyDescriptor(e, r) {
                const t = n.value
                if (null != t && 'object' == typeof t && r in t)
                  return {
                    value: t[r],
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  }
              },
            })
          })(l, n)
          return (a.set(t, { source: l, proxy: i }), i)
        },
        has: (e, r) => 'string' == typeof r && void 0 !== o(r),
        ownKeys() {
          const r = new Set()
          if (e.parts) for (const t in e.parts) r.add(t)
          for (const e in t) e.startsWith('part:') && r.add(e.slice(5))
          return [...r]
        },
        getOwnPropertyDescriptor(e, r) {
          if ('string' == typeof r && void 0 !== o(r))
            return {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: void 0,
            }
        },
      }
    )
  }
  const [ke, Be] = c('vueform-defaults')
  function we() {
    const e = ke()
    if (!e) throw new Error('Defaults context does not exist')
    return e
  }
  function xe(e) {
    return (Array.isArray(e) ? e : [e]).map((e) => {
      const r = { ...e }
      return (
        void 0 === r.$cascade &&
          (!r.$apply ||
            'this' === r.$apply ||
            (Array.isArray(r.$apply) &&
              1 === r.$apply.length &&
              'this' === r.$apply[0])) &&
          (r.$cascade = !1),
        r.$apply || (r.$apply = ['this']),
        'function' == typeof r.$apply ||
          Array.isArray(r.$apply) ||
          (r.$apply = [r.$apply]),
        void 0 === r.$cascade && (r.$cascade = !0),
        void 0 === r.$merge && (r.$merge = !0),
        r
      )
    })
  }
  const [$e, Ce] = c('vueform-preset')
  function Se(e, t) {
    var n, a, o
    !(function () {
      const e = Y(),
        t = J()
      if (void 0 === (null == e ? void 0 : e.exposed))
        throw new Error(
          '`createComponentContext()` must be called within setup() context'
        )
      const n = {},
        a = r.shallowRef(!1),
        o = new Proxy(n, {
          get: (o, l, s) =>
            l === Q
              ? e.exposed
              : (e.exposed || 'string' != typeof l || a.value,
                'string' == typeof l && e.exposed && Reflect.has(e.exposed, l)
                  ? r.unref(Reflect.get(e.exposed, l))
                  : 'props' === l
                    ? e.props
                    : 'form$' === l
                      ? t
                      : Reflect.get(e.exposed || n, l, s)),
          set(t, a, o, l) {
            const s = e.exposed || n
            if (Reflect.has(s, a)) {
              const e = Reflect.get(s, a, l)
              if (r.isRef(e)) return ((e.value = o), !0)
            }
            return Reflect.set(s, a, o, l)
          },
          has: (r, t) => t in (e.exposed || n),
          ownKeys: () => Reflect.ownKeys(e.exposed || n),
          getOwnPropertyDescriptor: (r, t) =>
            Reflect.getOwnPropertyDescriptor(e.exposed || n, t),
        })
      ;(r.onBeforeMount(() => {
        if (((a.value = !0), e.exposed))
          for (const t of Reflect.ownKeys(e.exposed))
            'string' != typeof t ||
              t in n ||
              Object.defineProperty(n, t, {
                get: () => r.unref(Reflect.get(e.exposed, t)),
                enumerable: !0,
                configurable: !0,
              })
      }),
        re(o))
    })()
    const l = m(),
      s = Y(),
      i = K(),
      u = (null == (n = s.proxy) ? void 0 : n.$options.element) ?? !1,
      d = we()[i] || {},
      c = (null == (a = s.vnode) ? void 0 : a.props) || {},
      p = $e() || r.ref([]),
      f = r.computed(() => {
        const r = new Set(),
          n = null == t ? void 0 : t.presets
        if (n && 'function' == typeof n)
          for (const t of n(e)) r.add('string' == typeof t ? t : xe(t))
        const a = d.presets
        if (a) for (const e of a) r.add(e)
        const o = e.presets
        if (o) for (const e of o) r.add('string' == typeof e ? e : xe(e))
        if (0 === r.size) return []
        const s = []
        for (const e of r)
          if (e)
            if ('string' == typeof e) {
              const r = l.presets[e]
              if (!r) {
                'production' !== process.env.NODE_ENV &&
                  console.warn(`[Vueform warn]: Preset \`${e}\` not found`)
                continue
              }
              if (Array.isArray(r))
                for (let e = 0; e < r.length; e++) s.push(r[e])
              else s.push(r)
            } else for (let r = 0; r < e.length; r++) s.push(e[r])
        return s
      }),
      v = r.toRef(() => [...p.value, ...f.value])
    !(function (e) {
      Ce(e)
    })(r.toRef(() => [...p.value, ...f.value.filter(({ $cascade: e }) => e)]))
    const g = null == (o = s.proxy) ? void 0 : o.$options,
      y = r.computed(() =>
        v.value.filter((e) =>
          'function' == typeof e.$apply
            ? e.$apply(g)
            : e.$apply.some(
                (e) =>
                  e === i ||
                  'this' === e ||
                  '*' === e ||
                  ('*element' === e && u)
              )
        )
      ),
      h = r.computed(() => {
        const e = new Set()
        for (const r of y.value)
          for (const t in r) t.startsWith('$') || e.add(t)
        return e
      }),
      b = r.computed(() => y.value.length > 0),
      k = r.proxyRefs({})
    for (const m in e) {
      const n = B(m),
        a = null == t ? void 0 : t[m],
        o = 'function' == typeof a ? a(e) : a,
        l = c && (m in c || n in c)
      k[m] = r.computed(() => {
        const r = e[m],
          a = b.value && h.value.has(m),
          s = l ? r : void 0
        if (void 0 !== s && !$(s)) return s
        const i = d[m]
        let u = A(o, i, m)
        if (a) {
          const e = y.value
          for (let r = 0; r < e.length; r++) {
            const t = e[r][m]
            void 0 !== t && (u = A(u, t, m, e[r].$merge))
          }
        }
        return (
          void 0 !== s && (u = A(u, s, m)),
          (t && m in t) || m in d || m in c || n in c || a ? (u ?? i) : r
        )
      })
    }
    return ((s.__vfProps = k), k)
  }
  function Ee(e, t) {
    const n = {},
      a = (e) => {
        for (const t in e) {
          const a = e[t]
          r.isRef(a)
            ? Object.defineProperty(n, t, {
                get: () => a.value,
                enumerable: !0,
                configurable: !0,
              })
            : (n[t] = a)
        }
      }
    return (a(e), t && a(t), n)
  }
  function _e(e, t) {
    const n = {}
    for (const a of t) n[a] = r.toRef(e, a)
    return n
  }
  const Oe = (e, { slots: r }) => {
    var t
    return null == (t = r.default) ? void 0 : t.call(r)
  }
  async function Ae(e, r) {
    const t = $(e),
      n = t ? Object.values(e) : e,
      a = t ? Object.keys(e) : e.map((e, r) => r)
    for (let o = 0; o < n.length; o++) await r(n[o], a[o], e)
  }
  function Ve(e) {
    return null != e && 'function' == typeof e.then
  }
  function Pe() {
    const { nativeEmit: e } = m(),
      t = Y(),
      n = Y(),
      a = r.ref({}),
      o = r.ref({}),
      l = r.ref({}),
      s = r.ref(!1),
      i = r.ref(!1)
    return {
      fire: (r, ...s) => {
        const i = B(String(r))
        for (const e of [o.value, a.value, l.value])
          for (const r of e[i] || []) r(...s)
        if (e) n.emit(i, ...s)
        else {
          const e = t.vnode.props,
            r =
              (null == e ? void 0 : e[`on${k(i)}`]) ||
              (null == e ? void 0 : e[`on-${B(i)}`])
          'function' == typeof r && r(...s)
        }
      },
      fireAsync: async (r, ...u) => {
        let d
        s.value = !1
        const c = B(String(r))
        for (const e of [o.value, a.value, l.value])
          for (const r of e[c] || []) {
            const e = r(...u)
            Ve(e) && (i.value = !0)
            const t = Ve(e) ? await e : e
            if (!1 === t) return ((i.value = !1), !1)
            void 0 !== t && (d = t)
          }
        if (e) n.emit(c, ...u)
        else {
          const e = t.vnode.props,
            r =
              (null == e ? void 0 : e[`on${k(c)}`]) ||
              (null == e ? void 0 : e[`on-${B(c)}`])
          if ('function' == typeof r) {
            const e = r(...u),
              t = Ve(e) ? await e : e
            if (!1 === t) return ((i.value = !1), !1)
            void 0 !== t && (d = t)
          }
        }
        return ((i.value = !1), void 0 === d || d)
      },
      on: (e, r) => {
        const t = B(String(e))
        ;(a.value[t] || (a.value[t] = []), a.value[t].push(r))
      },
      off: (e, r) => {
        const t = B(String(e))
        ;[o.value, a.value, l.value].forEach((e) => {
          e[t] &&
            (r
              ? (e[t] = e[t].filter((e) => e.toString() !== r.toString()))
              : delete e[t])
        })
      },
      onBefore: (e, r) => {
        const t = B(String(e))
        ;(o.value[t] || (o.value[t] = []), o.value[t].push(r))
      },
      onAfter: (e, r) => {
        const t = B(String(e))
        ;(l.value[t] || (l.value[t] = []), l.value[t].push(r))
      },
      eventInProgress: i,
    }
  }
  Oe.inheritAttrs = !1
  const De = { key: 1 },
    Fe = r.defineComponent({
      name: 'VfAddon',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfAddon',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        addon: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, ge),
          l = be(o),
          s = ye(o, a),
          i = he('VfAddon', () => ({ root: 'vf-addon' })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { template: d, slots: c, resolved: p } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(d)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(d)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'div',
                    r.mergeProps(
                      { key: 1, class: r.unref(i).root },
                      { ...r.unref(l).root, ...e.$attrs }
                    ),
                    [
                      r.unref(p) && 'object' == typeof r.unref(p)
                        ? (r.openBlock(),
                          r.createBlock(
                            r.resolveDynamicComponent(r.unref(p).component),
                            r.mergeProps({ key: 0 }, r.unref(p).props, {
                              inline: '',
                              hoist: '',
                            }),
                            null,
                            16
                          ))
                        : r.unref(p)
                          ? (r.openBlock(),
                            r.createElementBlock(
                              'span',
                              De,
                              r.toDisplayString(r.unref(p)),
                              1
                            ))
                          : r.renderSlot(
                              e.$slots,
                              'default',
                              { key: 2 },
                              () => {
                                var e
                                return [
                                  (
                                    null == (e = r.unref(c))
                                      ? void 0
                                      : e.default
                                  )
                                    ? (r.openBlock(),
                                      r.createBlock(
                                        r.resolveDynamicComponent(
                                          r.unref(c).default
                                        ),
                                        { key: 0 }
                                      ))
                                    : r.createCommentVNode('', !0),
                                ]
                              }
                            ),
                    ],
                    16
                  )),
            ])
        )
      },
    })
  function je(e, r, t) {
    return t.reduce(
      (t, n) => ({ ...t, ...n({ props: e, events: r, deps: t }) }),
      {}
    )
  }
  function Re(e) {
    const t = oe(),
      n = J()
    return r.toRef(() => {
      var r, a
      return (
        (null == (r = null == t ? void 0 : t.props) ? void 0 : r[e]) ??
        (null == (a = null == n ? void 0 : n.props) ? void 0 : a[e])
      )
    })
  }
  function Te() {
    const { sanitize: e } = G(),
      { localize: t } = z(),
      n = le(),
      a = Re('showRequired')
    return function (o, l, s, i = !1) {
      return r.computed(() => {
        if (!l) return
        let u = r.unref(l)
        if (void 0 === u) return
        if ((r.isRef(u) && (u = r.unref(u)), void 0 === u)) return
        let d = e(
          t(
            'function' == typeof u
              ? u(s)
              : 'string' == typeof u || 'object' == typeof u
                ? u
                : void 0
          )
        )
        return (
          n.allowed(o) && (d = n.resolve(d)),
          i &&
            a.value &&
            a.value.includes(o) &&
            (null == s ? void 0 : s.required) &&
            (d += '*'),
          String(d)
        )
      })
    }
  }
  function Me(e) {
    const { on: t, off: n, fire: a } = Pe(),
      o = r.shallowReactive(new Map()),
      l = r.toRef(() => [...o.values()].filter((e) => !e.isStatic)),
      s = r.toRef(() =>
        [...o.values()].filter(({ available: e, isStatic: r }) => e && !r)
      ),
      i = r.toRef(() => [...s.value.values()].filter(({ hoisted: e }) => e)),
      u = (t) => {
        const n = t.substr(
          (void 0 !== r.unref(e) ? `${r.unref(e)}.` : '').length
        )
        return { relativePath: n, furtherNested: n.includes('.') }
      }
    return {
      statefulChildren$: l,
      availableStatefulChildren$: s,
      hoistedChildren$: i,
      children$: o,
      register: (e, r) => {
        const { relativePath: t, furtherNested: n } = u(e)
        ;(n || o.set(t, r), a('register', e, r))
      },
      unregister: (e) => {
        const { relativePath: r, furtherNested: t } = u(e)
        ;(t || o.delete(r), a('unregister', e))
      },
      on: t,
      off: n,
    }
  }
  const [Ne, Ie] = c('vueform-container')
  function Le(e) {
    var t, n, a
    const o =
        e.register ||
        ((r, t, n, a) => {
          var o, l
          ;(null == (o = e.children) || o.register(t, r),
            null == (l = e.container) || l.register(r, t, n, a))
        }),
      l =
        e.unregister ||
        ((r, t) => {
          var n, a
          ;(null == (n = e.children) || n.unregister(r),
            null == (a = e.container) || a.unregister(r, t))
        }),
      s =
        e.update ||
        (null == (t = e.container) ? void 0 : t.update) ||
        (() => {
          throw new Error(
            '`update()` is not defined for this container context'
          )
        }),
      i =
        e.subscribe ||
        (null == (n = e.container) ? void 0 : n.subscribe) ||
        (() => () => {}),
      u = {
        id: e.id,
        type: e.type,
        children:
          e.children || (null == (a = e.container) ? void 0 : a.children),
        model: e.model,
        pager: r.toRef(() => r.unref(e.pager)),
        available: r.toRef(() => r.unref(e.available) ?? !0),
        visible: r.toRef(() => r.unref(e.visible) ?? !0),
        disabled: r.toRef(() => r.unref(e.disabled) ?? !1),
        dataPath: r.toRef(() => r.unref(e.dataPath) ?? ''),
        path: r.toRef(() => r.unref(e.path) ?? ''),
        register: o,
        unregister: l,
        update: s,
        subscribe: i,
      }
    return (Ie(u), u)
  }
  function qe() {
    return Ne()
  }
  function He(e, t) {
    const n = qe(),
      a = J(),
      o = te(),
      { check: l, isNegated: s } = q(),
      i = (e) =>
        null != e &&
        (s(e) ? i(e.not) : !!r.isRef(e) || !Array.isArray(e) || e.length > 0),
      u = (e) =>
        r.computed(() => {
          if (void 0 !== n && !(null == n ? void 0 : n.available.value))
            return !1
          const s = r.unref(e)
          return (
            !(i(s) && (!a || (null == a ? void 0 : a.model))) ||
            l(s, o, r.unref(t))
          )
        }),
      d = u(e)
    return { make: u, available: d }
  }
  function ze(e) {
    const t = r.unref(e)
    let n = null
    if (t instanceof HTMLElement) n = t
    else {
      const e = null == t ? void 0 : t.nextElementSibling
      n = e instanceof HTMLElement ? e : null
    }
    if (n && 'contents' === getComputedStyle(n).display) {
      const e = n.firstElementChild
      return e instanceof HTMLElement ? e : n
    }
    return n
  }
  function We(e) {
    const r = e.getBoundingClientRect()
    return r.top >= 0 && r.top <= window.innerHeight
  }
  function Ue() {
    const e = u()
    return r.toRef(() => ze(e))
  }
  function Ge(e, r) {
    var t
    return r.match(/\.([0-9]+)(?![a-zA-Z]+)/g)
      ? (null == (t = r.match(/\.([0-9]+)(?![a-zA-Z]+)/g)) ||
          t.forEach((r) => {
            e = e.replace('.*', r)
          }),
        e)
      : e
  }
  const Ke = (e) =>
      null == e || '' === e
        ? []
        : e.includes('__proto__') ||
            e.includes('constructor') ||
            e.includes('prototype')
          ? (console.warn(
              '[Vueform warn]: Attempted access to prototype path disallowed:',
              e
            ),
            [])
          : e
              .replace(/\[(\d+)\]/g, '.$1')
              .split('.')
              .filter((e) => '' !== e),
    Ye = (e) => /^\d+$/.test(e)
  function Ze(e, r, t = void 0) {
    if (null == e) return t
    const n = Array.isArray(r) ? r : Ke(r)
    if (0 === n.length) return void 0 === e ? t : e
    let a = e
    for (let o = 0; o < n.length; o++) {
      const e = n[o]
      if (null == a) return t
      if (!Object.prototype.hasOwnProperty.call(a, e)) {
        if (
          !(
            Ye(e) &&
            (Array.isArray(a) ||
              ('object' == typeof a && 'number' == typeof a.length))
          ) ||
          void 0 === a[e]
        )
          return t
      }
      a = a[e]
    }
    return void 0 === a ? t : a
  }
  function Xe(e, r, t) {
    if (null == e || 'object' != typeof e) return e
    const n = Array.isArray(r) ? r : Ke(r)
    if (0 === n.length)
      return (
        console.warn(
          '[Vueform warn]: Empty path provided to `set()`, cannot replace the root object'
        ),
        e
      )
    let a = e
    for (let o = 0; o < n.length - 1; o++) {
      const e = n[o],
        r = n[o + 1]
      if (null == a[e] || 'object' != typeof a[e]) {
        const t = Ye(r)
        a[e] = t ? [] : {}
      }
      a = a[e]
    }
    return ((a[n[n.length - 1]] = t), e)
  }
  function Je(e) {
    const t = te(),
      n = Y()
    if (!t)
      throw new Error('`useRootModel()` must be called within setup() context')
    const a = r.ref(C(r.unref(e.modelValue)) || {}),
      o = r.ref(),
      l = r.ref(),
      s = r.ref(''),
      i = r.toRef(e, 'modelValue'),
      u = r.computed(() => O(n.vnode.props || {}, 'onUpdate:modelValue')),
      d = r.ref(0)
    let c,
      p,
      f,
      m = !1
    const v = new Map(),
      g = (e) => {
        var r, t
        if (!v.size) return
        if ((null == (r = v.get('')) || r.forEach((e) => e()), !e)) return
        const n = e.split('.')
        let a = ''
        for (let o = 0; o < n.length; o++)
          ((a = a ? `${a}.${n[o]}` : n[o]),
            null == (t = v.get(a)) || t.forEach((e) => e()))
      }
    return {
      model: a,
      lastModel: o,
      initialModel: l,
      dataPath: s,
      modelValue: i,
      set: (e, r) => {
        Ze(a.value, e) !== r && (Xe(a.value, e, r), (m = !0), d.value++, g(e))
      },
      register: (e, r) => {
        const t = Ze(a.value, e)
        !e || (S(t, r) && void 0 !== t) || (Xe(a.value, e, r), d.value++, g(e))
      },
      unregister: (e) => {
        ;(!(function (e, r) {
          if (null == e || 'object' != typeof e) return !1
          const t = Array.isArray(r) ? r : Ke(r)
          if (0 === t.length) return !1
          let n = e
          for (let o = 0; o < t.length - 1; o++) {
            const e = t[o]
            if (null == n || 'object' != typeof n) return !1
            const r = Object.prototype.hasOwnProperty.call(n, e),
              a = r ? n[e] : void 0
            if (null == a || 'object' != typeof a) {
              if (void 0 === a && r) return !1
              if (!r) return !0
            }
            n = a
          }
          const a = t[t.length - 1]
          if (null == n || 'object' != typeof n) return !0
          if (!Object.prototype.hasOwnProperty.call(n, a)) return !0
          if (Array.isArray(n) && Ye(a)) {
            const e = parseInt(a, 10)
            return !(e >= 0 && e < n.length && (n.splice(e, 1), 0))
          }
          delete n[a]
        })(a.value, e),
          d.value++,
          g(e))
      },
      subscribe: (e, r) => {
        let t = v.get(e)
        return (
          t || v.set(e, (t = new Set())),
          t.add(r),
          () => {
            const t = v.get(e)
            t && (t.delete(r), t.size || v.delete(e))
          }
        )
      },
      init: () => {
        if (
          ((o.value = C(a.value)),
          (l.value = C(a.value)),
          u.value && !S(i.value, a.value))
        ) {
          const r = C(a.value)
          ;((c = r), e.fire('update:modelValue', r))
        }
        ;((p = r.watch(
          d,
          () => {
            const r = m
            m = !1
            const n = C(a.value)
            ;(!r && void 0 !== o.value && S(n, o.value)) ||
              (u.value && ((c = n), e.fire('update:modelValue', n)),
              void 0 !== o.value && e.fire('change', n, o.value, t),
              (o.value = n))
          },
          { flush: 'post' }
        )),
          (f = r.watch(
            () => i.value,
            (r) => {
              var n
              void 0 !== r &&
                r !== c &&
                (S(a.value, r) ||
                  ((n = C(r)),
                  'function' == typeof e.onModelValueChange
                    ? e.onModelValueChange(n)
                    : t.update(n)))
            },
            { deep: !0 }
          )))
      },
      destroy: () => {
        ;(null == p || p(), null == f || f())
      },
    }
  }
  function Qe() {
    const e = R()
    if (!e) throw new Error('Globals context is not initialized')
    return e
  }
  const er = 'undefined' != typeof window,
    rr = !er
  const tr = (e) => {
    const r = e && 'object' == typeof e ? e : { container: e || 12 },
      t = {}
    if ((r.container && (t.container = Number(r.container)), r.label)) {
      const e = Number(r.label)
      ;((t.label = e), (t.group = e <= 0 || e >= 12 ? 12 : 12 - e))
    }
    return (r.wrapper && (t.wrapper = Number(r.wrapper)), (t.full = 12), t)
  }
  function nr({ props: e }) {
    const t = _e(e, ['type', 'name']).type
    if (!t.value)
      throw new Error('Prop `type` must be specified for an element')
    !(function () {
      const e = te()
      ae(e)
    })()
    const n = m(),
      a = te(),
      o = Te(),
      { defaultBreakpoint: l } = Qe(),
      s = le(),
      i = u(),
      d = r.useSlots(),
      c = Ue(),
      p = J(),
      f = K(),
      v = r.toRef(() => String(e.name)),
      g = () => ({}),
      y = { fire: g, on: g, off: g, onBefore: g, onAfter: g },
      h = r.ref(n.uid()),
      b = o(
        'id',
        r.toRef(() => e.id || h.value),
        a
      ),
      k = r.computed(() => `${b.value}__help`),
      B = r.computed(() => `${b.value}__hint`),
      w = r.computed(() => `${b.value}__error`),
      x = r.computed(() => `${b.value}__label`)
    let $ = e.detached ? void 0 : qe()
    if (!$) {
      const e = Je({ id: b, ...y, modelValue: r.ref(void 0) })
      $ = Le({
        type: 'root',
        id: b,
        model: e.model,
        register: (r, t, n, a) => {
          !n || e.register(n, a)
        },
        unregister: (r, t) => {
          !t || e.unregister(t)
        },
        update: e.set,
        subscribe: e.subscribe,
      })
    }
    const S = r.computed(
        () => `${'' !== $.path.value ? `${$.path.value}.` : ''}${e.name}`
      ),
      E = Me(S),
      _ = He(
        r.toRef(() => e.conditions),
        S
      ).available,
      { template: O, slots: A } = fe(e),
      V = r.unref($.pager),
      P = r.ref(!n.lazy),
      D = r.computed(
        () =>
          !((!$.visible.value && !P.value) || !_.value) &&
          (!(null == V ? void 0 : V.active) ||
            (null == V ? void 0 : V.page) === e.name) &&
          _.value
      ),
      F = o(
        'label',
        r.toRef(() => {
          var r
          return e.label
            ? e.label
            : d.label || (null == (r = e.slots) ? void 0 : r.label)
              ? ''
              : void 0
        }),
        a,
        !1
      ),
      j = o(
        'help',
        r.toRef(() => {
          var r
          return e.help
            ? e.help
            : d.help || (null == (r = e.slots) ? void 0 : r.help)
              ? '.'
              : void 0
        }),
        a
      ),
      R = o(
        'hint',
        r.toRef(() => {
          var r
          return e.hint
            ? e.hint
            : d.hint || (null == (r = e.slots) ? void 0 : r.hint)
              ? '.'
              : void 0
        }),
        a
      ),
      T = r.computed(() => e.page)
    n.lazy &&
      (r.onMounted(() => {
        return (
          (e = () => {
            P.value = !0
          }),
          er && 'requestIdleCallback' in window
            ? window.requestIdleCallback(e)
            : setTimeout(() => r.nextTick(e), 300)
        )
        var e
      }),
      r.watch(
        D,
        (e, r) => {
          P.value || (e && !r && (P.value = !0))
        },
        { immediate: !0 }
      ))
    const M = o('display-name', r.toRef(e, 'displayName'), a),
      N = r.computed(() =>
        String(
          M.value ??
            F.value ??
            e.floating ??
            e.floatLabel ??
            e.ifta ??
            e.placeholder ??
            e.name
        )
      ),
      I = r.ref(C(e.columns)),
      L = (e) => (e.includes('{') ? e : `{${e}}`),
      q = (e) => {
        if (!s.installed || !s.allowed('columns')) return e
        if ('string' == typeof e) return s.resolve(L(e))
        if (e && 'object' == typeof e) {
          const r = {}
          for (const t of Object.keys(e)) {
            const n = e[t]
            r[t] = 'string' == typeof n ? s.resolve(L(n)) : n
          }
          return r
        }
        return e
      },
      H = r.computed(() => {
        const e = r.unref(I),
          t = 'function' == typeof e ? e(a) || void 0 : e,
          n = {
            [l.value]: {
              container: 12,
              label: 12,
              wrapper: 12,
              group: 12,
              full: 12,
            },
          }
        if (
          !(o = t) ||
          'object' != typeof o ||
          'container' in o ||
          'label' in o ||
          'wrapper' in o
        )
          Object.assign(n[l.value], tr(q(t)))
        else
          for (const r in t) {
            const e = tr(q(t[r]))
            'base' === r ? Object.assign(n[l.value], e) : (n[r] = e)
          }
        var o
        return n
      }),
      z = (e) => (I.value = C(e))
    r.watch(() => e.columns, z, { immediate: !1, deep: !0 })
    const W = async (t, n) => {
      const a = t ?? { behavior: 'smooth' },
        o = r.unref($.pager)
      if ((null == o ? void 0 : o.active) && o.page !== e.name)
        ((o.page = e.name), await r.nextTick())
      else if (p) {
        const e = r.unref(p.pager)
        if (null == e ? void 0 : e.active) {
          const t = e.pages.find((e) =>
            e.elements.includes(S.value.split('.')[0])
          )
          t && !t.selected && ((e.page = t.name), await r.nextTick())
        }
      }
      const l = ze(i.value)
      return !!l && !(!n && We(l)) && (l.scrollIntoView(a), !0)
    }
    return {
      $el: c,
      type: t,
      name: v,
      componentName: f,
      form$: p,
      uid: h,
      id: b,
      helpId: k,
      hintId: B,
      errorId: w,
      labelId: x,
      container: $,
      path: S,
      children: E,
      available: _,
      template: O,
      slots: A,
      visible: D,
      viewLoaded: P,
      label: F,
      page: T,
      help: j,
      hint: R,
      genericName: N,
      resolvedColumns: H,
      updateColumns: z,
      scrollTo: W,
      focus: async (e = !1) => {
        if ((e && (await W()), !(i.value instanceof HTMLElement))) return !1
        const r = i.value.querySelector(
          'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,[tabindex],[contentEditable=true],trix-editor'
        )
        return r instanceof HTMLElement && (r.focus(), !0)
      },
    }
  }
  function ar({ props: e, deps: t }) {
    const { path: n } = t,
      { check: a, isNegated: o } = q(),
      l = te(),
      s = J(),
      i = qe(),
      u = r.ref()
    return {
      disabled: r.computed(() => {
        const t = r.unref(e.disabled)
        return (
          (null == s ? void 0 : s.disabled) ||
          (null == i ? void 0 : i.disabled.value) ||
          u.value ||
          !0 === t ||
          '' === t ||
          ('function' == typeof t
            ? t(l)
            : ((d = t),
              Array.isArray(d) || 'string' == typeof d || o(d)
                ? a(t, l, n.value)
                : !!t))
        )
        var d
      }),
      disable: () => {
        u.value = !0
      },
      enable: () => {
        u.value = !1
      },
    }
  }
  function or(e, r) {
    if (!e) return []
    let t = e
    return (
      'function' == typeof t && (t = t(r)),
      t ? (Array.isArray(t) ? t : [t]) : []
    )
  }
  function lr({ props: e }) {
    const t = te()
    return {
      addonable: !0,
      beforeAddons: r.computed(() => or(e.before, t)),
      afterAddons: r.computed(() => or(e.after, t)),
    }
  }
  const sr = {
      type: 'button',
      disabled: !1,
      conditions: void 0,
      download: void 0,
    },
    ir = ve((e, t) => {
      const n = je(e, t, [nr, ar, lr]),
        { path: a, disabled: o } = n,
        l = te(),
        s = J(),
        i = Te(),
        { check: u, isNegated: d } = q(),
        { make: c } = U(),
        p = c(),
        f = p.errors,
        m = p.messages,
        v = r.computed(() => e.severity ?? 'secondary'),
        g = i(
          'button',
          r.toRef(() => e.text),
          l
        ),
        y = i(
          'button-href',
          r.toRef(() => e.href),
          l
        ),
        h = r.computed(() => !!y.value),
        b = r.computed(() => {
          const t = r.unref(e.loading)
          return (
            '' === t ||
            ('function' == typeof t
              ? t(l)
              : ((n = t),
                Array.isArray(n) || 'string' == typeof n || d(n)
                  ? u(t, l, a.value)
                  : !!t))
          )
          var n
        })
      return {
        ...n,
        ...t,
        severity: v,
        text: g,
        href: y,
        isAnchor: h,
        loading: b,
        messageBag: p,
        errors: f,
        messages: m,
        handleClick: (r) => {
          o.value ||
            b.value ||
            (t.fire('click', r, l),
            'submit' === e.action && (null == s || s.submit()),
            'reset' === e.action && (null == s || s.reset()))
        },
      }
    }),
    ur = r.defineComponent({
      name: 'VfButton',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfButton',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        text: { type: [String, Object, Function] },
        href: { type: [String, Object, Function] },
        target: {},
        rel: {},
        download: { type: [String, Boolean] },
        loading: { type: [String, Boolean, Object, Function, Array] },
        action: {},
        variant: {},
        severity: {},
        fluid: { type: Boolean },
        align: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        aria: {},
        as: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        before: { type: [String, Object, Array, Function] },
        after: { type: [String, Object, Array, Function] },
      },
      emits: [
        'click',
        'focus',
        'blur',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, sr),
          l = be(o),
          s = ir(o, a),
          i = he('VfButton', () => ({
            root: 'vf-button',
            text: 'vf-button-text',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            viewLoaded: d,
            template: c,
            text: p,
            severity: f,
            beforeAddons: m,
            afterAddons: v,
            disabled: g,
            handleClick: y,
          } = s,
          {
            fluid: h,
            slots: b,
            variant: k,
          } = _e(o, ['fluid', 'slots', 'variant'])
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (t, n) => {
            const a = r.resolveComponent('VfAddon'),
              o = r.resolveComponent('VfBtn'),
              s = r.resolveComponent('VfLayout')
            return r.unref(d)
              ? r.renderSlot(
                  t.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(c)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(c)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          s,
                          { key: 1, addons: !1 },
                          {
                            default: r.withCtx(() => [
                              r.createVNode(
                                o,
                                r.mergeProps(
                                  {
                                    variant: r.unref(k),
                                    severity: r.unref(f),
                                    fluid: r.unref(h),
                                    disabled: r.unref(g),
                                  },
                                  r.unref(l).btn,
                                  { onClick: r.unref(y) }
                                ),
                                {
                                  default: r.withCtx(() => [
                                    r.renderSlot(
                                      t.$slots,
                                      'before',
                                      { before: e.before },
                                      () => {
                                        var e
                                        return [
                                          (
                                            null == (e = r.unref(b))
                                              ? void 0
                                              : e.before
                                          )
                                            ? (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  r.unref(b).before
                                                ),
                                                { key: 0 }
                                              ))
                                            : (r.openBlock(!0),
                                              r.createElementBlock(
                                                r.Fragment,
                                                { key: 1 },
                                                r.renderList(
                                                  r.unref(m),
                                                  (e, t) => {
                                                    var n, o
                                                    return (
                                                      r.openBlock(),
                                                      r.createBlock(
                                                        a,
                                                        r.mergeProps(
                                                          {
                                                            key: `before-${t}`,
                                                            addon: e,
                                                          },
                                                          { ref_for: !0 },
                                                          'function' ==
                                                            typeof r.unref(l)
                                                              .beforeAddon
                                                            ? null ==
                                                              (o = (n =
                                                                r.unref(l))
                                                                .beforeAddon)
                                                              ? void 0
                                                              : o.call(n, e, t)
                                                            : {}
                                                        ),
                                                        null,
                                                        16,
                                                        ['addon']
                                                      )
                                                    )
                                                  }
                                                ),
                                                128
                                              )),
                                        ]
                                      }
                                    ),
                                    r.renderSlot(
                                      t.$slots,
                                      'default',
                                      { text: r.unref(p) },
                                      () => {
                                        var e
                                        return [
                                          (
                                            null == (e = r.unref(b))
                                              ? void 0
                                              : e.default
                                          )
                                            ? (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  r.unref(b).default
                                                ),
                                                { key: 0, text: r.unref(p) },
                                                null,
                                                8,
                                                ['text']
                                              ))
                                            : (r.openBlock(),
                                              r.createElementBlock(
                                                'span',
                                                r.mergeProps(
                                                  {
                                                    key: 1,
                                                    class: r.unref(i).text,
                                                  },
                                                  r.unref(l).text
                                                ),
                                                r.toDisplayString(r.unref(p)),
                                                17
                                              )),
                                        ]
                                      }
                                    ),
                                    r.renderSlot(
                                      t.$slots,
                                      'after',
                                      { after: e.after },
                                      () => {
                                        var e
                                        return [
                                          (
                                            null == (e = r.unref(b))
                                              ? void 0
                                              : e.after
                                          )
                                            ? (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  r.unref(b).after
                                                ),
                                                { key: 0 }
                                              ))
                                            : (r.openBlock(!0),
                                              r.createElementBlock(
                                                r.Fragment,
                                                { key: 1 },
                                                r.renderList(
                                                  r.unref(v),
                                                  (e, t) => {
                                                    var n, o
                                                    return (
                                                      r.openBlock(),
                                                      r.createBlock(
                                                        a,
                                                        r.mergeProps(
                                                          {
                                                            key: `after-${t}`,
                                                            addon: e,
                                                          },
                                                          { ref_for: !0 },
                                                          'function' ==
                                                            typeof r.unref(l)
                                                              .afterAddon
                                                            ? null ==
                                                              (o = (n =
                                                                r.unref(l))
                                                                .afterAddon)
                                                              ? void 0
                                                              : o.call(n, e, t)
                                                            : {}
                                                        ),
                                                        null,
                                                        16,
                                                        ['addon']
                                                      )
                                                    )
                                                  }
                                                ),
                                                128
                                              )),
                                        ]
                                      }
                                    ),
                                  ]),
                                  _: 3,
                                },
                                16,
                                [
                                  'variant',
                                  'severity',
                                  'fluid',
                                  'disabled',
                                  'onClick',
                                ]
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    })
  function dr(e, r) {
    return L('$theme').make(e, r)
  }
  const cr = { download: void 0 },
    pr = ve((e, t) => {
      const n = te(),
        a = m(),
        o = Te(),
        l = dr(r.toRef(e, 'tokens')),
        s = r.toRef(() => a.nonce),
        i = `vf-t-${r.useId().replace(/:/g, '-')}`,
        u = r.computed(() => {
          const e = Object.entries(l.value)
          return e.length
            ? `.${i}{${e.map(([e, r]) => `${e}:${r}`).join(';')}}`
            : ''
        }),
        d = o(
          'button',
          r.toRef(() => e.text),
          n
        ),
        { template: c, slots: p } = fe(e)
      return {
        tokens: l,
        tokenClass: i,
        tokenCss: u,
        nonce: s,
        text: d,
        template: c,
        slots: p,
        handleClick: (r) => {
          e.disabled || t.fire('click', r, n)
        },
      }
    }),
    fr = r.defineComponent({
      name: 'VfBtn',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfBtn',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        text: { type: [String, Object, Function] },
        variant: {},
        severity: {},
        size: {},
        fluid: { type: Boolean },
        disabled: { type: [String, Boolean] },
        href: {},
        target: {},
        rel: {},
        download: { type: [String, Boolean] },
        tokens: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'click',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, cr),
          l = be(o),
          s = pr(o, a),
          i = he('VfBtn', () => ({
            root: {
              'vf-btn': !0,
              [s.tokenClass]: !!s.tokenCss.value,
              'vf-outline': 'outline' === o.variant,
              'vf-text': 'text' === o.variant,
              'vf-primary': 'primary' === o.severity,
              'vf-danger': 'danger' === o.severity,
              'vf-success': 'success' === o.severity,
              'vf-sm': 'small' === o.size,
              'vf-fluid': o.fluid,
              'vf-disabled': o.disabled,
            },
            text: 'vf-btn-text',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            href: d,
            target: c,
            rel: p,
            download: f,
            disabled: m,
          } = _e(o, ['href', 'target', 'rel', 'download', 'disabled']),
          {
            text: v,
            template: g,
            slots: y,
            tokenCss: h,
            nonce: b,
            handleClick: k,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(g)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(g)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(d) ? 'a' : 'button'),
                    r.mergeProps(
                      {
                        key: 1,
                        type: r.unref(d) ? void 0 : 'button',
                        href: r.unref(d),
                        target: r.unref(c),
                        rel: r.unref(p),
                        download: r.unref(f),
                        disabled: r.unref(m),
                        class: r.unref(i).root,
                      },
                      { ...r.unref(l).root, ...e.$attrs },
                      { onClick: r.withModifiers(r.unref(k), ['prevent']) }
                    ),
                    {
                      default: r.withCtx(() => [
                        r.renderSlot(e.$slots, 'before', {}, () => {
                          var e
                          return [
                            (null == (e = r.unref(y)) ? void 0 : e.before)
                              ? (r.openBlock(),
                                r.createBlock(
                                  r.resolveDynamicComponent(r.unref(y).before),
                                  { key: 0 }
                                ))
                              : r.createCommentVNode('', !0),
                          ]
                        }),
                        r.renderSlot(
                          e.$slots,
                          'default',
                          { text: r.unref(v) },
                          () => {
                            var e
                            return [
                              (null == (e = r.unref(y)) ? void 0 : e.default)
                                ? (r.openBlock(),
                                  r.createBlock(
                                    r.resolveDynamicComponent(
                                      r.unref(y).default
                                    ),
                                    { key: 0, text: r.unref(v) },
                                    null,
                                    8,
                                    ['text']
                                  ))
                                : r.unref(v)
                                  ? (r.openBlock(),
                                    r.createElementBlock(
                                      'span',
                                      r.mergeProps(
                                        { key: 1, class: r.unref(i).text },
                                        r.unref(l).text
                                      ),
                                      r.toDisplayString(r.unref(v)),
                                      17
                                    ))
                                  : r.createCommentVNode('', !0),
                            ]
                          }
                        ),
                        r.renderSlot(e.$slots, 'after', {}, () => {
                          var e
                          return [
                            (null == (e = r.unref(y)) ? void 0 : e.after)
                              ? (r.openBlock(),
                                r.createBlock(
                                  r.resolveDynamicComponent(r.unref(y).after),
                                  { key: 0 }
                                ))
                              : r.createCommentVNode('', !0),
                          ]
                        }),
                      ]),
                      _: 3,
                    },
                    16,
                    [
                      'type',
                      'href',
                      'target',
                      'rel',
                      'download',
                      'disabled',
                      'class',
                      'onClick',
                    ]
                  )),
              r.unref(h)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent('style'),
                    { key: 2, '^nonce': r.unref(b) },
                    {
                      default: r.withCtx(() => [
                        r.createTextVNode(r.toDisplayString(r.unref(h)), 1),
                      ]),
                      _: 1,
                    },
                    8,
                    ['^nonce']
                  ))
                : r.createCommentVNode('', !0),
            ])
        )
      },
    })
  function mr({
    container: e,
    children: r,
    type: t = 'input',
    id: n,
    model: a,
    available: o,
    visible: l,
    disabled: s,
    dataPath: i,
    path: u,
    pager: d,
    register: c,
    unregister: p,
    update: f,
  }) {
    Le({
      type: t,
      id: n ?? e.id,
      model: a ?? e.model,
      dataPath: i ?? e.dataPath,
      path: u ?? e.path,
      pager: d ?? e.pager,
      available: o ?? e.available,
      visible: l ?? e.visible,
      disabled: s ?? e.disabled,
      children: r,
      container: e,
      ...(c && { register: c }),
      ...(p && { unregister: p }),
      ...(f && { update: f }),
    })
  }
  function vr({ events: e }) {
    const { on: t } = e,
      n = Ue(),
      a = te(),
      o = r.ref(!1),
      l = r.ref(!1),
      s = r.ref(!1)
    return (
      t('focus', () => {
        ;((o.value = !0), (s.value = !0))
      }),
      t('blur', () => {
        ;((o.value = !1), (l.value = !0))
      }),
      {
        focused: o,
        touched: l,
        visited: s,
        handleBlur: (r) => {
          if (!n.value) return
          const t = r.relatedTarget
          ;(t && n.value.contains(t)) || e.fire('blur', a)
        },
        handleFocus: (r) => {
          o.value || e.fire('focus', a)
        },
      }
    )
  }
  function gr({ props: e }) {
    const t = te()
    return {
      text: Te()(
        'text',
        r.toRef(() => e.text),
        t
      ),
    }
  }
  function yr(e, r = !0) {
    return r
      ? $(e)
        ? E(e).reduce((e, [t, n]) => ({ ...e, [t]: yr(n, r) }), {})
        : void 0 === e || 'string' != typeof e
          ? e
          : e.match(/^-*\d+$/)
            ? parseInt(e, 10)
            : e.match(/^\d+\.\d+$/)
              ? parseFloat(e)
              : e
      : e
  }
  function hr({ props: e, deps: t, events: n }) {
    const { update: a, path: o, model: l, translatable: s, languages: i } = t,
      { on: u } = n,
      { installed: d, resolveIfAllowed: c, usedPaths: p, allowed: f } = le()
    let m
    const v = r.ref(!1),
      g = r.computed(() => {
        if (!e.default) return
        if (!(null == s ? void 0 : s.value)) return c('default', e.default)
        const r = {}
        for (const t of Object.keys(i.value)) {
          const n = $(e.default) ? e.default[t] : e.default
          r[t] = n ? c('default', n) : null
        }
        return r
      }),
      y = r.computed(() => {
        if (d && f('default')) {
          if (!(null == s ? void 0 : s.value)) {
            if (0 === p(e.default, o.value).length) return
            return e.default
          }
          if (h().some((e) => e && p(e, o.value).length > 0)) return e.default
        }
      }),
      h = () =>
        $(e.default)
          ? Object.keys(i.value).map((r) => e.default[r])
          : Object.keys(i.value).map(() => e.default),
      b = (r) => !!e.untrackOn && e.untrackOn.includes(r),
      k = () => {
        void 0 !== l.value && a(yr(g.value ?? null))
      },
      B = () => {
        v.value ||
          ((v.value = !0),
          (m = r.watch(g, k, { flush: 'sync', immediate: !0 })))
      },
      w = () => {
        v.value && ((v.value = !1), null == m || m())
      }
    return (
      r.watch(
        y,
        (e, r) => {
          ;(void 0 !== r && w(), void 0 !== e && B())
        },
        { immediate: !0 }
      ),
      u('input', () => {
        b('input') && w()
      }),
      u('load', () => {
        b('load') && w()
      }),
      { tracking: v, track: B, untrack: w }
    )
  }
  let br = 0
  const kr = () => 'i' + br++
  function Br(e) {
    var t, n
    const { children: a, fire: o } = e,
      {
        statefulChildren$: l,
        availableStatefulChildren$: s,
        hoistedChildren$: u,
      } = a,
      d = J(),
      c = le(),
      p = te(),
      { sanitize: f } = G(),
      { make: m } = L('$validation'),
      { make: v } = U(),
      g = Te(),
      y = Re('clearCustomErrors'),
      b = Re('validateOn'),
      k = e.rootModel,
      B = r.toRef(
        () =>
          'boolean' == typeof r.unref(e.nested) ||
          !!k ||
          void 0 !== r.unref(e.items)
      ),
      w = e.languages ?? r.computed(() => ({})),
      x = e.translatable ?? r.computed(() => !1)
    if (!k && !e.container) throw new Error('Container context does not exist')
    if (!k && void 0 === (null == (t = e.name) ? void 0 : t.value))
      throw new Error('`name` must be provided for `useData()`')
    if (!B.value && !x.value && $(r.unref(e.rules)))
      throw new Error(
        'Multilingual rules can only be used when `translatable` is `true`'
      )
    const E = () => {
        const e = x.value ? Object.keys(w.value || {}) : ['default'],
          r = {}
        for (const t of e) r[t] = m(p, t)
        return r
      },
      _ = v(),
      A = r.shallowReactive(E()),
      V = r.computed(() => !1 === r.unref(e.nested) || !!k),
      P = r.toRef(() => {
        var r
        return k
          ? ''
          : void 0 !== (null == (r = e.dataPath) ? void 0 : r.value)
            ? e.dataPath.value
            : V.value
              ? e.container.dataPath.value || ''
              : e.container.dataPath.value
                ? `${e.container.dataPath.value}.${e.name.value}`
                : String(e.name.value)
      }),
      {
        model: F,
        initialModel: j,
        lastModel: R,
        init: T,
        destroy: M,
      } = k ??
      (function (e) {
        const t = te(),
          n = Y(),
          a = r.ref(),
          o = r.ref(),
          l = r.toRef(() => r.unref(e.modelValue)),
          s = r.toRef(() => {
            var r
            return !1 !== (null == (r = e.available) ? void 0 : r.value)
          }),
          i = r.computed(() => {
            var r
            return e.isFlatContainer.value
              ? e.container.model.value
              : null == (r = e.container.model.value)
                ? void 0
                : r[e.name.value]
          }),
          u = r.computed(() => O(n.vnode.props || {}, 'onUpdate:modelValue')),
          d = r.ref(0)
        let c,
          p,
          f,
          m,
          v,
          g = !1
        return {
          model: i,
          lastModel: a,
          initialModel: o,
          init: () => {
            if (((g = !1), e.isFlatContainer.value))
              return ((a.value = void 0), void (o.value = void 0))
            const n = C(i.value)
            if (
              ((void 0 !== a.value && S(a.value, n)) ||
                ((a.value = n), (o.value = C(i.value))),
              u.value && !S(l.value, i.value))
            ) {
              const r = C(i.value)
              ;((c = r), e.fire('update:modelValue', r))
            }
            ;((f = r.watch(
              d,
              () => {
                const r = g
                if (((g = !1), !s.value)) return
                const n = i.value
                if (void 0 === n) return
                const o = C(n)
                ;(!r && void 0 !== a.value && S(o, a.value)) ||
                  (u.value && ((c = o), e.fire('update:modelValue', o)),
                  void 0 !== a.value && e.fire('change', o, a.value, t),
                  (a.value = o))
              },
              { flush: 'post' }
            )),
              (p = e.container.subscribe(e.dataPath.value, () => {
                ;((g = !0), d.value++)
              })),
              (m = r.watch(i, () => {
                d.value++
              })),
              (v = r.watch(
                () => l.value,
                (r) => {
                  void 0 !== r && r !== c && (S(i.value, r) || e.update(C(r)))
                },
                { deep: !0 }
              )))
          },
          destroy: () => {
            ;(null == p || p(),
              null == f || f(),
              null == m || m(),
              null == v || v())
          },
        }
      })({
        container: e.container,
        name: e.name,
        dataPath: P,
        modelValue: e.modelValue,
        available: e.available,
        isFlatContainer: V,
        fire: o,
        update: (e) => p.update(e),
      }),
      N = r.computed(() => {
        const e = new Set()
        if (!x.value) return e
        for (const [r, t] of Object.entries(A))
          'default' !== r && t.invalid.value && e.add(r)
        return e
      }),
      I = r.computed(() => {
        var r, t
        return (
          (null == (r = e.rules) ? void 0 : r.value) &&
          (!d ||
            (!(null == d ? void 0 : d.supressValidation) &&
              ((null == d ? void 0 : d.submits) ||
                (null == (t = b.value)
                  ? void 0
                  : t.some((r) => {
                      var t
                      return (
                        ve.value ||
                        'change' === r ||
                        ('blur' === r &&
                          (null == (t = e.touched) ? void 0 : t.value))
                      )
                    })))))
        )
      }),
      q = r.computed(() => {
        var r, t
        return (
          !1 !== (null == (r = e.touched) ? void 0 : r.value) &&
          (!(null == (t = e.rules) ? void 0 : t.value) ||
            (de.value.validated.value && !de.value.invalid.value))
        )
      }),
      H = e.language ?? r.ref('default'),
      z = r.toRef(() => {
        var r
        return k || null == (r = e.rules) ? void 0 : r.value
      }),
      W = r.toRef(() => {
        var r
        return k ? '' : ((null == (r = e.path) ? void 0 : r.value) ?? '')
      }),
      K = r.toRef(() => {
        var r
        return !!k || ((null == (r = e.available) ? void 0 : r.value) ?? !0)
      }),
      Z = r.toRef(() => {
        if (!k && !V.value) return P.value
      }),
      X = r.toRef(() => {
        var r
        return (
          B.value &&
          !k &&
          'number' == typeof (null == (r = e.items) ? void 0 : r.value)
        )
      }),
      Q = r.ref([])
    let ee = !1
    const re = r.ref(),
      ne = r.ref(),
      ae = i(() => {
        var t
        const n = {}
        for (const a in null == (t = e.ruleMessages) ? void 0 : t.value)
          n[a] = g(
            'rule',
            r.toRef(() => {
              var r, t
              return null ==
                (t = null == (r = e.ruleMessages) ? void 0 : r.value)
                ? void 0
                : t[a]
            }),
            p
          )
        return n
      }),
      oe = r.toRef(() => {
        var t
        let n
        if (
          ((n =
            void 0 !== r.unref(e.nullValue)
              ? r.unref(e.nullValue)
              : void 0 !== r.unref(e.falseValue)
                ? r.unref(e.falseValue)
                : B.value
                  ? X.value
                    ? new Array(
                        Number((null == (t = e.items) ? void 0 : t.value) || 0)
                      ).fill(void 0)
                    : {}
                  : r.unref(e.multiple)
                    ? []
                    : null),
          !x.value)
        )
          return n
        const a = {}
        for (const e of Object.keys(w.value))
          a[e] = $(n) ? (n[e] ?? null) : (n ?? null)
        return a
      }),
      se = r.toRef(() => {
        if (!e.default) return oe.value
        const r = e.default.value
        if (!x.value) {
          const e = 'number' == typeof r ? r : (r ?? oe.value)
          return c.resolveIfAllowed('default', e)
        }
        const t = {}
        for (const e of Object.keys(w.value)) {
          const n = ($(r) ? r[e] : r) ?? oe.value[e]
          t[e] = c.resolveIfAllowed('default', n)
        }
        return t
      }),
      ie = r.toRef(() => {
        var r, t, n, a
        return void 0 !== (null == (r = e.startupModel) ? void 0 : r.value)
          ? e.startupModel.value
          : k || V.value
            ? void 0
            : B.value
              ? (C(F.value) ??
                C(null == (t = e.modelValue) ? void 0 : t.value) ??
                C(oe.value))
              : (function (...e) {
                  return e.find((e) => void 0 !== e)
                })(
                  F.value,
                  null == (n = e.modelValue) ? void 0 : n.value,
                  se.value,
                  null == (a = e.nullValue) ? void 0 : a.value,
                  null
                )
      }),
      ue = r.computed({
        get: () =>
          x.value && F.value && 'object' == typeof F.value && H.value
            ? F.value[H.value]
            : F.value,
        set(r) {
          var t
          ;(null == (t = e.handleInput) ? void 0 : t.value)
            ? e.handleInput.value(r, p)
            : B.value
              ? Fe(r)
              : De(r)
        },
      }),
      de = r.toRef(() => A[x.value && H.value ? H.value : 'default'] || {}),
      ce = r.computed(() => new Map(Q.value.map((e, r) => [e, r]))),
      pe = r.computed(() => {
        var r
        if (!B.value || k) return []
        if (Array.isArray(null == (r = e.items) ? void 0 : r.value))
          return e.items.value
        if (!X.value) return []
        const t = ce.value
        return h([...Q.value], re.value, ne.value).map((e) => ({
          id: e,
          index: t.get(e),
        }))
      }),
      fe = r.computed(() => {
        var e
        return null == (e = de.value.numeric) ? void 0 : e.value
      }),
      me = r.computed(() => r.unref(e.hoist)),
      ve = r.computed(
        () =>
          Object.values(A).some(({ invalid: e }) => e.value) ||
          s.value.some(({ invalid: e }) => e)
      ),
      ge = r.computed(
        () =>
          Object.values(A).some(({ pending: e }) => e.value) ||
          s.value.some(({ pending: e }) => e)
      ),
      ye = r.computed(
        () =>
          Object.values(A).some(({ debouncing: e }) => e.value) ||
          s.value.some(({ debouncing: e }) => e)
      ),
      he = r.computed(() => ye.value || ge.value),
      be = r.computed(
        () =>
          Object.values(A).every(({ validated: e }) => e.value) &&
          s.value.every(({ validated: e }) => e)
      ),
      ke = r.computed(() => {
        var e
        return null == (e = de.value.required) ? void 0 : e.value
      }),
      Be = r.computed(
        () => !S(j.value, F.value) || s.value.some(({ dirty: e }) => e)
      ),
      we = r.computed(() =>
        B.value
          ? s.value.every(({ empty: e }) => e)
          : void 0 !== r.unref(e.falseValue)
            ? '' === String(ue.value ?? '').trim() ||
              ue.value === r.unref(e.falseValue)
            : '' === String(ue.value ?? '').trim()
      ),
      xe = r.computed(
        () =>
          (!z.value && s.value.every(({ completed: e }) => e)) ||
          (be.value && !ve.value)
      ),
      $e = r.computed(() => [
        ..._.messages.value.map(f),
        ...u.value.reduce(
          (e, { messageBag: r }) => [...e, ...r.messages.value.map(f)],
          []
        ),
      ]),
      Ce = r.computed(() => [
        ..._.prepends.errors,
        ...Object.keys(A).reduce(
          (e, r) => [
            ...e,
            ...A[r].errors.value.map((e) => {
              var t
              return x.value
                ? `${e} (${(null == (t = w.value) ? void 0 : t[r]) || r})`
                : e
            }),
          ],
          []
        ),
        ..._.appends.errors,
      ]),
      Se = r.computed(() => u.value.flatMap((e) => e.errors ?? [])),
      Ee = r.computed(() =>
        B.value ? [...Se.value, ...Ce.value] : [...Ce.value, ...Se.value]
      ),
      _e = r.computed(() => !!Ee.value.length),
      Oe = r.computed(() => {
        var r, t
        if (me.value) return []
        const n = [
          ...Se.value,
          ..._.prepends.errors,
          ...de.value.errors.value,
          ..._.appends.errors,
        ]
        return void 0 !== (null == (r = e.maxErrors) ? void 0 : r.value) &&
          (null == (t = e.maxErrors) ? void 0 : t.value) >= 1
          ? n.slice(0, e.maxErrors.value)
          : n
      }),
      Ve = r.computed(() => {
        if (me.value) return {}
        const e = [...Ce.value, ...Se.value]
        return e.length ? { [W.value]: e } : {}
      }),
      Pe = r.computed(() => {
        var r, t, n
        if (!K.value || !1 === (null == (r = e.submit) ? void 0 : r.value))
          return {}
        if (B.value) {
          let r = X.value ? [] : {}
          for (const e of s.value)
            X.value
              ? r.push(...Object.values(e.payload))
              : Object.assign(r, e.payload)
          return (
            (null == (t = e.transformPayload) ? void 0 : t.value) &&
              (r = e.transformPayload.value(r, p)),
            V.value ? r : { [e.name.value]: r }
          )
        }
        const a = (null == (n = e.transformPayload) ? void 0 : n.value)
          ? e.transformPayload.value(F.value, p)
          : F.value
        return { [e.name.value]: a }
      }),
      De = (e) => {
        ;(o('input', e, p),
          Fe(
            e instanceof Event &&
              'target' in e &&
              null !== e.target &&
              'value' in e.target
              ? e.target.value
              : e
          ),
          I.value && Ne())
      },
      Fe = (r) => {
        if (B.value) {
          if (void 0 === r) return
          const t = D(F.value, yr(r))
          if (k) return void Object.keys(t).forEach((e) => k.set(e, t[e]))
          if ('' === P.value)
            return void Object.keys(t).forEach((r) =>
              e.container.update(r, t[r])
            )
          e.container.update(P.value, t)
        } else {
          if (S(F.value, r)) return
          ;(void 0 !== r &&
            e.container.update(
              `${P.value}${!$(r) && x.value ? `.${H.value}` : ''}`,
              yr(r)
            ),
            (null == y ? void 0 : y.value) && ze(),
            qe())
        }
      },
      je = async () =>
        !z.value ||
        (await Ae(A, async ({ validate: e }, r) => {
          await e(
            x.value && F.value && 'object' == typeof F.value
              ? F.value[r]
              : F.value
          )
        }),
        !Object.values(A).some(({ invalid: e }) => e.value)),
      Me = async () => (
        await Ae(
          l.value.filter(({ completed: e }) => !e),
          async ({ validate: e }) => await e()
        ),
        !s.value.some(({ invalid: e }) => e)
      ),
      Ne = async () => (await je(), B.value && (await Me()), !ve.value),
      Ie = async () => !z.value || (await de.value.validate(ue.value)),
      Le = () => {
        ;(Object.values(A).forEach(({ reset: e }) => e()),
          B.value && l.value.forEach(({ unvalidate: e }) => e()))
      },
      qe = () => {
        ;(Object.values(A).forEach(({ invalidate: e }) => e()),
          B.value && l.value.forEach(({ invalidate: e }) => e()))
      },
      He = B.value
        ? (e) =>
            s.value.every(({ filled: r, name: t }) =>
              r(null == e ? void 0 : e[t])
            )
        : (t) =>
            void 0 !== r.unref(e.falseValue)
              ? r.unref(e.falseValue) !== t
              : !(
                  null == t ||
                  '' === t ||
                  !1 === t ||
                  (Array.isArray(t) && !t.length)
                ),
      ze = () => _.clear('errors'),
      We = () => {
        ;(T(), Xe())
      },
      Ue = () => {
        ;(Ke(), Je(), Xe())
      },
      Ge = () => {
        ;(Je(), M(), er())
      },
      Ke = (e) => {
        const r = e ?? (B.value ? Z.value : P.value)
        ;(M(), er(r), Qe(), T())
      },
      Ye = () => {
        ;(M(), T())
      },
      Ze = () => void 0 !== R.value && S(R.value, C(F.value)),
      Xe = () => {
        if (!B.value && !x.value && $(z.value))
          throw new Error(
            'Multilingual rules can only be used when `translatable` is `true`'
          )
        ;(Object.keys(A).length ||
          Object.entries(E()).forEach(([e, r]) => (A[e] = r)),
          Object.values(A).forEach(({ init: e, language: r }) => {
            e(x.value && $(z.value) && r ? z.value[r] : z.value)
          }))
      },
      Je = () => {
        ;(Le(), Object.keys(A).forEach((e) => delete A[e]))
      },
      Qe = () => {
        k ||
          e.container.register(
            p,
            W.value,
            B.value ? Z.value : P.value,
            ie.value
          )
      },
      er = (r) => {
        if (k) return
        const t = r ?? (B.value ? Z.value : P.value)
        e.container.unregister(W.value, t)
      }
    if (
      (r.onMounted(We),
      r.onBeforeUnmount(Ge),
      !B.value &&
        x.value &&
        ((F.value && !$(F.value)) ||
          ((null == (n = e.modelValue) ? void 0 : n.value) &&
            !$(e.modelValue.value))))
    )
      throw new Error('Multilingual model must be an object')
    if (
      (Qe(),
      r.watch(z, () => {
        ;(Je(), Xe())
      }),
      B.value)
    ) {
      let e = null
      ;(r.watch(
        z,
        (t) => {
          t && !e
            ? (e = r.watch(
                F,
                () => {
                  I.value && je()
                },
                { deep: !0 }
              ))
            : !t && e && (e(), (e = null))
        },
        { immediate: !0 }
      ),
        r.watch(Z, (e, r) => (Ze() ? Ye() : Ke(r))),
        X.value &&
          r.watch(
            () => (Array.isArray(F.value) ? F.value.length : 0),
            (e) => {
              if (!ee) {
                for (; Q.value.length < e;) Q.value.push(kr())
                Q.value.length > e && Q.value.splice(e)
              }
            },
            { immediate: !0 }
          ))
    } else
      (r.watch(P, (e, r) => (Ze() ? Ye() : Ke(r))),
        r.watch(() => x.value, Ue, { flush: 'pre' }))
    return (
      void 0 !== e.multiple &&
        r.watch(
          () => r.unref(e.multiple),
          () => Ue(),
          { immediate: !1 }
        ),
      r.watch(ve, (e, r) => {
        e ? o('invalid', p) : r && o('valid', p)
      }),
      r.watch(
        () => e.default,
        () => {
          const e = yr(se.value)
          ;(Be.value || Fe(C(e)), (j.value = C(e)))
        }
      ),
      e.on('blur', () => {
        var e
        !(null == d ? void 0 : d.submits) &&
          (null == (e = b.value) ? void 0 : e.includes('blur')) &&
          Ie()
      }),
      {
        value: ue,
        model: F,
        initialModel: j,
        payload: Pe,
        dataPath: P,
        nullValue: oe,
        invalid: ve,
        required: ke,
        dirty: Be,
        pending: ge,
        debouncing: ye,
        busy: he,
        validated: be,
        completed: xe,
        success: q,
        empty: we,
        numeric: fe,
        hoisted: me,
        errors: Ee,
        hasError: _e,
        displayErrors: Oe,
        ownErrors: Ce,
        formErrors: Ve,
        messages: $e,
        messageBag: _,
        ruleMessages: ae,
        items: pe,
        dragIndex: re,
        dropIndex: ne,
        invalidLanguages: N,
        validation: A,
        currentValidation: de,
        shouldValidate: I,
        isContainer: B,
        update: Fe,
        reset: () => {
          ;(B.value
            ? X.value && !k
              ? e.container.update(P.value, C(j.value))
              : l.value.forEach(({ reset: e }) => e())
            : Fe(C(j.value)),
            o('reset', F.value, p))
        },
        clear: () => {
          ;(B.value
            ? X.value && !k
              ? e.container.update(P.value, [])
              : l.value.forEach(({ clear: e }) => e())
            : Fe(C(oe.value)),
            o('clear', F.value, p))
        },
        load: (e) => {
          ;(Fe(e),
            B.value &&
              l.value.forEach((e) => {
                var r
                return null == (r = e.load) ? void 0 : r.call(e, e.model)
              }),
            o('load', F.value, p))
        },
        validate: Ne,
        validateSelf: je,
        validateChildren: Me,
        validateCurrent: Ie,
        unvalidate: Le,
        invalidate: qe,
        clean: () => {
          B.value
            ? l.value.forEach(({ clean: e }) => e())
            : (j.value = C(F.value))
        },
        clearErrors: ze,
        clearMessages: () => _.clear('messages'),
        clearMessageBag: () => _.clear(),
        add: async (e = 1) => {
          if (!X.value) return
          ;(isNaN(e) && (e = 1), (ee = !0))
          const t = Array.isArray(F.value) ? F.value.length : 0
          for (Q.value.length > t && Q.value.splice(t); Q.value.length < t;)
            Q.value.push(kr())
          for (let r = 0; r < e; r++) Q.value.push(kr())
          ;(await r.nextTick(), (ee = !1))
        },
        remove: (r) => {
          X.value &&
            !k &&
            F.value.length &&
            (void 0 === r && (r = F.value.length - 1),
            void 0 !== F.value[r] &&
              (r < 0 || r >= F.value.length
                ? console.warn(
                    `[Vueform warn]: Invalid index ${r} for removal at \`${P.value}\``
                  )
                : (Q.value.splice(Q.value.length - 1, 1),
                  e.container.update(
                    P.value,
                    F.value.filter((e, t) => t !== r)
                  ))))
        },
        sort: async (e, t) => {
          X.value &&
            e !== t &&
            ((Q.value = h([...Q.value], e, t)),
            Fe(h(C(F.value), e, t)),
            (re.value = void 0),
            (ne.value = void 0),
            await r.nextTick())
        },
        filled: He,
        handleInput: De,
        init: We,
        reinit: Ue,
        destroy: Ge,
        register: Qe,
        unregister: er,
        initModel: T,
        reinitModel: Ke,
        destroyModel: M,
        initValidation: Xe,
        destroyValidation: Je,
      }
    )
  }
  function wr({
    props: e,
    deps: t,
    events: n,
    nullValue: a,
    items: o,
    handleInput: l,
  }) {
    return Br({
      ...t,
      ...n,
      ..._e(e, [
        'name',
        'rules',
        'maxErrors',
        'submit',
        'modelValue',
        'ruleMessages',
        'transformPayload',
        'hoist',
        'falseValue',
        'multiple',
        'default',
        'translate',
        'nested',
      ]),
      nullValue: r.toRef(() => e.nullValue ?? (null == a ? void 0 : a.value)),
      items: o,
      handleInput: l,
    })
  }
  const xr = {
      type: 'checkbox',
      submit: !0,
      bail: !0,
      maxErrors: 1,
      trueValue: !0,
      falseValue: !1,
      default: void 0,
      modelValue: void 0,
      conditions: void 0,
      expressions: void 0,
      showRequired: void 0,
      untrackOn: () => ['input'],
    },
    $r = ve((e, t) => {
      const n = je(e, t, [nr, ar, vr, gr]),
        {
          path: a,
          container: o,
          helpId: l,
          hintId: s,
          errorId: i,
          labelId: u,
          text: d,
          children: c,
        } = n,
        p = Te(),
        f = te(),
        m = r.ref(),
        {
          value: v,
          model: g,
          initialModel: y,
          payload: h,
          dataPath: b,
          nullValue: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          update: L,
          reset: q,
          clear: H,
          validate: z,
          validateSelf: W,
          validateChildren: U,
          unvalidate: G,
          invalidate: K,
          clean: Y,
          clearErrors: Z,
          clearMessages: X,
          clearMessageBag: J,
          filled: Q,
          handleInput: ee,
          reinit: re,
        } = wr({ props: e, deps: n, events: t }),
        {
          tracking: ne,
          track: ae,
          untrack: oe,
        } = hr({ props: e, deps: { ...n, model: g, update: L }, events: t }),
        le = r.computed(() => {
          var r, t, n, a
          return {
            describedby:
              (null == (r = e.aria) ? void 0 : r.describedby) ||
              [
                (null == d ? void 0 : d.value) && e.label ? u.value : null,
                e.help ? l.value : null,
                e.hint ? s.value : null,
                F.value ? i.value : null,
              ]
                .filter((e) => !!e)
                .join(' ') ||
              void 0,
            invalid:
              (null == (t = e.aria) ? void 0 : t.invalid) ??
              (F.value || void 0),
            required:
              (null == (n = e.aria) ? void 0 : n.required) ??
              (w.value || void 0),
            busy:
              (null == (a = e.aria) ? void 0 : a.busy) ?? (S.value || void 0),
          }
        }),
        se = p('checkbox-name', r.toRef(e, 'checkboxName'), f),
        ie = r.computed(
          () => se.value || ('checkboxes' === o.type ? o.path.value : a.value)
        )
      return (
        mr({ container: o, children: c }),
        {
          ...n,
          ...t,
          input: m,
          inputName: ie,
          aria: le,
          value: v,
          model: g,
          initialModel: y,
          payload: h,
          dataPath: b,
          nullValue: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          update: L,
          reset: q,
          clear: H,
          validate: z,
          validateSelf: W,
          validateChildren: U,
          unvalidate: G,
          invalidate: K,
          clean: Y,
          clearErrors: Z,
          clearMessages: X,
          clearMessageBag: J,
          filled: Q,
          handleInput: ee,
          reinit: re,
          tracking: ne,
          track: ae,
          untrack: oe,
        }
      )
    }),
    Cr = [
      'name',
      'id',
      'true-value',
      'false-value',
      'disabled',
      'aria-describedby',
      'aria-invalid',
      'aria-required',
    ],
    Sr = ['for'],
    Er = ['for'],
    _r = r.defineComponent({
      name: 'VfCheckbox',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfCheckbox',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: { type: [String, Number, Boolean, null] },
        default: { type: [String, Number, Boolean, null] },
        trueValue: { type: [String, Number, Boolean, null] },
        falseValue: { type: [String, Number, Boolean, null] },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        text: { type: [String, Object, Function] },
        checkboxName: { type: [String, Object, Function] },
        align: {},
        aria: {},
        as: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        untrackOn: {},
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
      },
      emits: [
        'input',
        'focus',
        'blur',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, xr),
          l = be(o),
          s = $r(o, a),
          i = he('VfCheckbox', () => ({
            root: 'vf-checkbox',
            wrapper: {
              'vf-choice-wrapper': !0,
              'vf-left': 'left' === o.align,
              'vf-right': 'right' === o.align,
              'vf-success': s.success.value,
              'vf-danger': s.hasError.value,
              'vf-disabled': s.disabled.value,
              'vf-focused': s.focused.value,
            },
            input: 'vf-choice-input',
            text: 'vf-choice-text',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { trueValue: d, falseValue: c } = _e(o, ['trueValue', 'falseValue']),
          {
            value: p,
            id: f,
            disabled: m,
            viewLoaded: v,
            template: g,
            aria: y,
            inputName: h,
            text: b,
            input: k,
            genericName: B,
            slots: w,
            handleBlur: x,
            handleFocus: $,
            handleInput: C,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(v)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(g)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(g)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1, label: !1 },
                          {
                            default: r.withCtx(() => [
                              r.renderSlot(
                                e.$slots,
                                'default',
                                r.mergeProps(
                                  {
                                    model: r.unref(p),
                                    aria: r.unref(y),
                                    inputName: r.unref(h),
                                    id: r.unref(f),
                                    trueValue: r.unref(d),
                                    falseValue: r.unref(c),
                                    disabled: r.unref(m),
                                    input: r.unref(k),
                                    text: r.unref(b),
                                    handleBlur: r.unref(x),
                                    handleFocus: r.unref($),
                                    handleInput: r.unref(C),
                                    class: r.unref(i).wrapper,
                                  },
                                  r.unref(l).wrapper
                                ),
                                () => {
                                  var n
                                  return [
                                    (
                                      null == (n = r.unref(w))
                                        ? void 0
                                        : n.default
                                    )
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(w).default
                                          ),
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              model: r.unref(p),
                                              aria: r.unref(y),
                                              'input-name': r.unref(h),
                                              id: r.unref(f),
                                              'true-value': r.unref(d),
                                              'false-value': r.unref(c),
                                              disabled: r.unref(m),
                                              input: r.unref(k),
                                              text: r.unref(b),
                                              'handle-blur': r.unref(x),
                                              'handle-focus': r.unref($),
                                              'handle-input': r.unref(C),
                                              class: r.unref(i).wrapper,
                                            },
                                            r.unref(l).wrapper
                                          ),
                                          null,
                                          16,
                                          [
                                            'model',
                                            'aria',
                                            'input-name',
                                            'id',
                                            'true-value',
                                            'false-value',
                                            'disabled',
                                            'input',
                                            'text',
                                            'handle-blur',
                                            'handle-focus',
                                            'handle-input',
                                            'class',
                                          ]
                                        ))
                                      : (r.openBlock(),
                                        r.createElementBlock(
                                          'div',
                                          r.mergeProps(
                                            {
                                              key: 1,
                                              class: r.unref(i).wrapper,
                                            },
                                            r.unref(l).wrapper
                                          ),
                                          [
                                            r.withDirectives(
                                              r.createElementVNode(
                                                'input',
                                                r.mergeProps(
                                                  {
                                                    type: 'checkbox',
                                                    name: r.unref(h),
                                                    id: r.unref(f),
                                                    'onUpdate:modelValue':
                                                      t[0] ||
                                                      (t[0] = (e) =>
                                                        r.isRef(p)
                                                          ? (p.value = e)
                                                          : null),
                                                    'true-value': r.unref(d),
                                                    'false-value': r.unref(c),
                                                    disabled: r.unref(m),
                                                    'aria-describedby':
                                                      r.unref(y).describedby,
                                                    'aria-invalid':
                                                      r.unref(y).invalid,
                                                    'aria-required':
                                                      r.unref(y).required,
                                                    class: r.unref(i).input,
                                                  },
                                                  r.unref(l).input,
                                                  {
                                                    onBlur:
                                                      t[1] ||
                                                      (t[1] = (...e) =>
                                                        r.unref(x) &&
                                                        r.unref(x)(...e)),
                                                    onFocus:
                                                      t[2] ||
                                                      (t[2] = (...e) =>
                                                        r.unref($) &&
                                                        r.unref($)(...e)),
                                                    ref_key: 'input',
                                                    ref: k,
                                                  }
                                                ),
                                                null,
                                                16,
                                                Cr
                                              ),
                                              [[r.vModelCheckbox, r.unref(p)]]
                                            ),
                                            r.renderSlot(
                                              e.$slots,
                                              'text',
                                              r.mergeProps(
                                                {
                                                  text: r.unref(b),
                                                  id: r.unref(f),
                                                  genericName: r.unref(B),
                                                  class: r.unref(i).text,
                                                },
                                                r.unref(l).text
                                              ),
                                              () => {
                                                var e
                                                return [
                                                  (
                                                    null == (e = r.unref(w))
                                                      ? void 0
                                                      : e.text
                                                  )
                                                    ? (r.openBlock(),
                                                      r.createBlock(
                                                        r.resolveDynamicComponent(
                                                          r.unref(w).text
                                                        ),
                                                        r.mergeProps(
                                                          {
                                                            key: 0,
                                                            text: r.unref(b),
                                                            id: r.unref(f),
                                                            'generic-name':
                                                              r.unref(B),
                                                            class:
                                                              r.unref(i).text,
                                                          },
                                                          r.unref(l).text
                                                        ),
                                                        null,
                                                        16,
                                                        [
                                                          'text',
                                                          'id',
                                                          'generic-name',
                                                          'class',
                                                        ]
                                                      ))
                                                    : r.unref(b)
                                                      ? (r.openBlock(),
                                                        r.createElementBlock(
                                                          'label',
                                                          r.mergeProps(
                                                            {
                                                              key: 1,
                                                              class:
                                                                r.unref(i).text,
                                                              for: r.unref(f),
                                                            },
                                                            r.unref(l).text
                                                          ),
                                                          r.toDisplayString(
                                                            r.unref(b)
                                                          ),
                                                          17,
                                                          Sr
                                                        ))
                                                      : (r.openBlock(),
                                                        r.createElementBlock(
                                                          'label',
                                                          {
                                                            key: 2,
                                                            class: 'sr-only',
                                                            for: r.unref(f),
                                                          },
                                                          r.toDisplayString(
                                                            r.unref(B)
                                                          ),
                                                          9,
                                                          Er
                                                        )),
                                                ]
                                              }
                                            ),
                                          ],
                                          16
                                        )),
                                  ]
                                }
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    })
  function Or(e) {
    return (
      e &&
      'object' == typeof e &&
      'string' == typeof e.name &&
      'number' == typeof e.lastModified &&
      'number' == typeof e.size &&
      'string' == typeof e.type
    )
  }
  function Ar({ props: e, deps: t, multiple: n }) {
    const { check: a } = q(),
      o = te(),
      l = r.computed(() => {
        if (!e.items) return []
        const r = e.labelProp ?? 'label',
          n = e.valueProp ?? 'value'
        let l = []
        return (
          Array.isArray(e.items)
            ? (l = e.items.map((e) =>
                $(e)
                  ? {
                      ...e,
                      label: void 0 !== e[r] ? String(e[r]) : void 0,
                      value: e[n],
                      disabled: e.disabled ?? !1,
                      conditions: e.conditions ?? [],
                    }
                  : { label: String(e), value: e, disabled: !1, conditions: [] }
              ))
            : $(e.items) &&
              (l = Object.entries(e.items).map(([e, r]) => ({
                label: String(r),
                value: e,
                disabled: !1,
                conditions: [],
              }))),
          l.filter((e) => !s(e.conditions) || a(e.conditions, o, t.path.value))
        )
      }),
      s = (e) => !!e && (!Array.isArray(e) || e.length > 0)
    return (
      r.watch(l, (e) => {
        if (r.unref(n)) {
          if (!Array.isArray(t.model.value) || !t.model.value.length) return
          const r = new Set(e.map((e) => String(e.value))),
            n = t.model.value.filter((e) => r.has(String(e)))
          n.length !== t.model.value.length &&
            t.container.update(t.dataPath.value, n)
        } else {
          if (null === t.model.value || void 0 === t.model.value) return
          e.some((e) => String(e.value) === String(t.model.value)) ||
            t.container.update(t.dataPath.value, null)
        }
      }),
      { items: l }
    )
  }
  function Vr({ props: e, deps: t }) {
    const {
      help: n,
      hint: a,
      helpId: o,
      hintId: l,
      errorId: s,
      hasError: i,
      busy: u,
      required: d,
    } = t
    return {
      aria: r.computed(() => {
        var r, t, c, p, f
        return {
          describedby:
            (null == (r = e.aria) ? void 0 : r.describedby) ||
            [
              n.value ? o.value : null,
              a.value ? l.value : null,
              i.value ? s.value : null,
            ]
              .filter((e) => !!e)
              .join(' ') ||
            void 0,
          labelledby: null == (t = e.aria) ? void 0 : t.labelledby,
          invalid:
            (null == (c = e.aria) ? void 0 : c.invalid) ?? (i.value || void 0),
          required:
            (null == (p = e.aria) ? void 0 : p.required) ?? (d.value || void 0),
          busy: (null == (f = e.aria) ? void 0 : f.busy) ?? (u.value || void 0),
        }
      }),
    }
  }
  const Pr = {
      type: 'checkboxes',
      submit: !0,
      bail: !0,
      maxErrors: 1,
      conditions: void 0,
      showRequired: void 0,
    },
    Dr = ve((e, t) => {
      const n = je(e, t, [nr, vr, ar]),
        {
          available: a,
          path: o,
          container: l,
          children: s,
          visible: i,
          help: u,
          hint: d,
          helpId: c,
          hintId: p,
          errorId: f,
          id: m,
        } = n,
        v = r.computed(() => []),
        {
          value: g,
          model: y,
          initialModel: h,
          payload: b,
          dataPath: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          shouldValidate: L,
          update: q,
          reset: H,
          clear: z,
          validate: W,
          validateSelf: U,
          validateChildren: G,
          unvalidate: K,
          invalidate: Y,
          clean: Z,
          clearErrors: X,
          clearMessages: J,
          clearMessageBag: Q,
          filled: ee,
          handleInput: re,
          reinit: te,
        } = wr({ props: e, deps: n, events: t, nullValue: v }),
        { items: ne } = Ar({
          props: e,
          deps: { path: o, container: l, model: y, dataPath: k },
          multiple: !0,
        }),
        { aria: ae } = Vr({
          props: e,
          deps: {
            help: u,
            hint: d,
            helpId: c,
            hintId: p,
            errorId: f,
            hasError: F,
            busy: S,
            required: w,
          },
        }),
        oe = r.computed(() => ({
          invalid: B.value,
          required: w.value,
          describedby: F.value ? f.value : void 0,
        }))
      return (
        mr({
          type: 'checkboxes',
          id: m,
          available: a,
          visible: i,
          dataPath: k,
          path: o,
          children: s,
          container: l,
          model: r.computed(() => {
            const e = {}
            for (const r of y.value || []) e[r] = !0
            return e
          }),
          register(e, r) {
            ;(s.register(r, e), l.register(e, r))
          },
          unregister(e) {
            ;(s.unregister(e), l.unregister(e))
          },
          update(e, r) {
            const t = yr(e.split('.').slice(-1)[0]),
              n = [...y.value.filter((e) => String(e) !== String(t))]
            ;((function (e) {
              return null != e && !1 !== e && '' !== e
            })(r) && n.push(t),
              l.update(k.value, n),
              L.value && W())
          },
        }),
        {
          ...n,
          ...t,
          items: ne,
          checkboxAria: oe,
          aria: ae,
          value: g,
          model: y,
          initialModel: h,
          payload: b,
          dataPath: k,
          nullValue: v,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          update: q,
          reset: H,
          clear: z,
          validate: W,
          validateSelf: U,
          validateChildren: G,
          unvalidate: K,
          invalidate: Y,
          clean: Z,
          clearErrors: X,
          clearMessages: J,
          clearMessageBag: Q,
          filled: ee,
          handleInput: re,
          reinit: te,
        }
      )
    }),
    Fr = r.defineComponent({
      name: 'VfCheckboxes',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfCheckboxes',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        default: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        items: {},
        stacked: { type: Boolean },
        aria: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        heading: {},
      },
      emits: [
        'blur',
        'focus',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Pr),
          l = be(o),
          s = Dr(o, a),
          i = he('VfCheckboxes', () => ({
            root: 'vf-checkboxes vf-choices',
            group: { 'vf-choices-group': !0, 'vf-stacked': o.stacked },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            items: d,
            viewLoaded: c,
            template: p,
            path: f,
            checkboxAria: m,
            disabled: v,
            label: g,
            slots: y,
            handleFocus: h,
            handleBlur: b,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfCheckbox'),
              a = r.resolveComponent('VfLayout')
            return r.unref(c)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(p)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(p)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          a,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.createElementVNode(
                                'div',
                                r.mergeProps(
                                  {
                                    class: r.unref(i).group,
                                    onFocusin:
                                      t[0] ||
                                      (t[0] = (...e) =>
                                        r.unref(h) && r.unref(h)(...e)),
                                    onFocusout:
                                      t[1] ||
                                      (t[1] = (...e) =>
                                        r.unref(b) && r.unref(b)(...e)),
                                  },
                                  r.unref(l).group
                                ),
                                [
                                  r.renderSlot(
                                    e.$slots,
                                    'default',
                                    {
                                      items: r.unref(d),
                                      radioName: r.unref(f),
                                      disabled: r.unref(v),
                                      label: r.unref(g),
                                    },
                                    () => {
                                      var t
                                      return [
                                        (
                                          null == (t = r.unref(y))
                                            ? void 0
                                            : t.default
                                        )
                                          ? (r.openBlock(),
                                            r.createBlock(
                                              r.resolveDynamicComponent(
                                                r.unref(y).default
                                              ),
                                              {
                                                key: 0,
                                                items: r.unref(d),
                                                'radio-name': r.unref(f),
                                                disabled: r.unref(v),
                                                label: r.unref(g),
                                              },
                                              null,
                                              8,
                                              [
                                                'items',
                                                'radio-name',
                                                'disabled',
                                                'label',
                                              ]
                                            ))
                                          : (r.openBlock(!0),
                                            r.createElementBlock(
                                              r.Fragment,
                                              { key: 1 },
                                              r.renderList(r.unref(d), (t) => {
                                                var a, o, s, i
                                                return (
                                                  r.openBlock(),
                                                  r.createBlock(
                                                    n,
                                                    r.mergeProps(
                                                      {
                                                        name: t.value,
                                                        text: t.label,
                                                        'checkbox-name':
                                                          r.unref(f),
                                                        disabled:
                                                          r.unref(v) ||
                                                          t.disabled,
                                                        conditions:
                                                          t.conditions,
                                                        aria: r.unref(m),
                                                        inline: '',
                                                      },
                                                      { ref_for: !0 },
                                                      null ==
                                                        (o = (a = r.unref(l))
                                                          .VfCheckbox)
                                                        ? void 0
                                                        : o.call(a, t)
                                                    ),
                                                    r.createSlots({ _: 2 }, [
                                                      (
                                                        null == (s = r.unref(y))
                                                          ? void 0
                                                          : s.checkbox
                                                      )
                                                        ? {
                                                            name: 'default',
                                                            fn: r.withCtx(
                                                              (t) => [
                                                                r.renderSlot(
                                                                  e.$slots,
                                                                  'checkbox',
                                                                  r.mergeProps(
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    t
                                                                  ),
                                                                  () => [
                                                                    (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          y
                                                                        )
                                                                          .checkbox
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        t
                                                                      ),
                                                                      null,
                                                                      16
                                                                    )),
                                                                  ]
                                                                ),
                                                              ]
                                                            ),
                                                            key: '0',
                                                          }
                                                        : void 0,
                                                      (
                                                        null == (i = r.unref(y))
                                                          ? void 0
                                                          : i.text
                                                      )
                                                        ? {
                                                            name: 'text',
                                                            fn: r.withCtx(
                                                              (t) => [
                                                                r.renderSlot(
                                                                  e.$slots,
                                                                  'text',
                                                                  r.mergeProps(
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    t
                                                                  ),
                                                                  () => [
                                                                    (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          y
                                                                        ).text
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        t
                                                                      ),
                                                                      null,
                                                                      16
                                                                    )),
                                                                  ]
                                                                ),
                                                              ]
                                                            ),
                                                            key: '1',
                                                          }
                                                        : void 0,
                                                    ]),
                                                    1040,
                                                    [
                                                      'name',
                                                      'text',
                                                      'checkbox-name',
                                                      'disabled',
                                                      'conditions',
                                                      'aria',
                                                    ]
                                                  )
                                                )
                                              }),
                                              256
                                            )),
                                      ]
                                    }
                                  ),
                                ],
                                16
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    [jr, Rr] = c('vueform-row')
  const Tr = {},
    Mr = ve((e, t) => {
      const n = jr(),
        a = m(),
        o = Y().uid
      if (!n) throw new Error('<VfCol> must be used inside a <VfRow> component')
      const {
          cells: l,
          cols: s,
          row: i,
          colHeaders: u,
          rowHeaders: d,
          align: c,
          valign: p,
          refreshInlineGrid: f,
        } = n,
        { template: v, slots: g } = fe(e),
        y = r.toRef(() => a.nonce),
        h = r.computed(() => s.value.indexOf(o)),
        b = r.computed(() =>
          l.value.find((e) => e.col === h.value && e.row === i.value)
        ),
        k = r.toRef(() => e.align || c.value),
        B = r.toRef(() => e.valign || p.value),
        w = r.computed(
          () =>
            !(!u.value || 0 !== i.value) ||
            (!!e.header && (0 === i.value || 0 !== h.value))
        ),
        x = r.computed(
          () =>
            !(!d.value || 0 !== h.value) ||
            (!!e.header && (0 === h.value || 0 !== i.value))
        ),
        $ = r.toRef(() => Number(e.colspan || 1)),
        C = r.toRef(() => Number(e.rowspan || 1)),
        S = r.computed(() => {
          const e = b.value
          return !e || ($.value <= 1 && C.value <= 1)
            ? ''
            : `[data-col-id="${o}"]{grid-area:${e.rowStart + 1}/${e.colStart + 1}/${e.rowEnd + 2}/${e.colEnd + 2}}`
        })
      return (
        r.onMounted(f),
        r.watch([() => e.colspan, () => e.rowspan], f, { flush: 'post' }),
        {
          align: k,
          valign: B,
          cell: b,
          cellCss: S,
          colspan: $,
          rowspan: C,
          colHeader: w,
          rowHeader: x,
          nonce: y,
          uid: o,
          template: v,
          slots: g,
        }
      )
    }),
    Nr = [
      'data-col-id',
      'data-col',
      'data-row',
      'data-col-start',
      'data-col-end',
      'data-row-start',
      'data-row-end',
      'data-colspan',
      'data-rowspan',
    ],
    Ir = r.defineComponent({
      name: 'VfCol',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfCol',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        colspan: {},
        rowspan: {},
        align: {},
        valign: {},
        header: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Tr),
          l = be(o),
          s = Mr(o, a),
          i = he('VfCol', () => ({
            root: ({ align: e, valign: r, colHeader: t, rowHeader: n }) => ({
              'vf-grid-cell': !0,
              [`vf-${e}`]: !!e,
              [`vf-${r}`]: !!e,
              'vf-grid-col-header': t,
              'vf-grid-row-header': n,
            }),
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            template: d,
            slots: c,
            align: p,
            valign: f,
            cell: m,
            cellCss: v,
            colspan: g,
            rowspan: y,
            colHeader: h,
            rowHeader: b,
            nonce: k,
            uid: B,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(u) }, () => {
              var t, n, a, o, s, w
              return [
                r.unref(d)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(d)),
                      { key: 0, context: r.unref(u) },
                      null,
                      8,
                      ['context']
                    ))
                  : r.createCommentVNode('', !0),
                r.unref(d)
                  ? r.createCommentVNode('', !0)
                  : (r.openBlock(),
                    r.createElementBlock(
                      'div',
                      r.mergeProps(
                        {
                          key: 1,
                          class: r.unref(i).root({
                            align: r.unref(p),
                            valign: r.unref(f),
                            colHeader: r.unref(h),
                            rowHeader: r.unref(b),
                          }),
                          'data-col-id': r.unref(B),
                          'data-col': null == (t = r.unref(m)) ? void 0 : t.col,
                          'data-row': null == (n = r.unref(m)) ? void 0 : n.row,
                          'data-col-start':
                            null == (a = r.unref(m)) ? void 0 : a.colStart,
                          'data-col-end':
                            null == (o = r.unref(m)) ? void 0 : o.colEnd,
                          'data-row-start':
                            null == (s = r.unref(m)) ? void 0 : s.rowStart,
                          'data-row-end':
                            null == (w = r.unref(m)) ? void 0 : w.rowEnd,
                          'data-colspan': r.unref(g),
                          'data-rowspan': r.unref(y),
                        },
                        r.unref(l).root
                      ),
                      [
                        r.renderSlot(e.$slots, 'default', {}, () => {
                          var e
                          return [
                            (null == (e = r.unref(c)) ? void 0 : e.default)
                              ? (r.openBlock(),
                                r.createBlock(
                                  r.resolveDynamicComponent(r.unref(c).default),
                                  { key: 0 }
                                ))
                              : r.createCommentVNode('', !0),
                          ]
                        }),
                      ],
                      16,
                      Nr
                    )),
                r.unref(v)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent('style'),
                      { key: 2, '^nonce': r.unref(k) },
                      {
                        default: r.withCtx(() => [
                          r.createTextVNode(r.toDisplayString(r.unref(v)), 1),
                        ]),
                        _: 1,
                      },
                      8,
                      ['^nonce']
                    ))
                  : r.createCommentVNode('', !0),
              ]
            })
        )
      },
    })
  function Lr(e) {
    return r.computed(() => {
      const t = r.unref(e)
      if (!t) return []
      let n = []
      if (Array.isArray(t)) n = t
      else if ('object' == typeof t) {
        n = []
        for (const [e, r] of E(t)) n.push({ ...r, name: e })
      }
      return n.map((e) => ({
        props: e,
        component: e.component || `Vf${w(e.type)}`,
      }))
    })
  }
  function qr(e) {
    const {
        schema: t,
        children: n,
        onSelect: a,
        onStep: o,
        onBack: l,
        onNext: s,
        onFinish: i,
        onInvalid: u,
        onBeforeSelect: d,
        onBeforeStep: c,
        onBeforeBack: p,
        onBeforeNext: f,
        onBeforeFinish: m,
      } = e,
      v = te(),
      y = Te(),
      h = Re('validateOn'),
      b = (function (e, t) {
        const n = Y(),
          a = r.computed(() => `history-${n.uid}`),
          o = (n) => {
            var o
            return !r.unref(e) || t(null == (o = n.state) ? void 0 : o[a.value])
          }
        return (
          r.onBeforeUnmount(
            () => !r.unref(e) || window.removeEventListener('popstate', o)
          ),
          r.watch(
            () => r.unref(e),
            (e, r) => {
              rr ||
                (e
                  ? window.addEventListener('popstate', o)
                  : r && window.removeEventListener('popstate', o))
            },
            { immediate: !0 }
          ),
          {
            back: async () => (r.unref(e) && er ? await history.back() : {}),
            push: (t, n = !1) =>
              !r.unref(e) ||
              rr ||
              history.pushState(
                { [a.value]: t },
                '',
                n ? new URLSearchParams(t).toString() : void 0
              ),
          }
        )
      })(!!r.unref(e.history), (e) =>
        L((null == e ? void 0 : e.page) || G(0), !1, !1)
      ),
      { on: k, off: B, fire: w, fireAsync: x, eventInProgress: $ } = Pe(),
      C = Ue(),
      S = r.ref(),
      _ = r.shallowRef([]),
      O = r.ref(),
      A = r.ref(0),
      V = r.ref(),
      P = r.toRef(() => r.unref(e.sequential)),
      D = r.computed(() => K(S.value)),
      F = r.computed(() => r.unref(e.active) ?? !0),
      j = r.computed(() => _.value.some(({ loading: e }) => e)),
      R = r.computed(() => _.value.some(({ invalid: e }) => e)),
      T = r.computed(() => U(S.value)),
      M = r.computed(() =>
        _.value.find((e) => e.index > D.value && e.available)
      ),
      N = r.computed(() =>
        [..._.value].reverse().find((e) => e.index < D.value && e.available)
      ),
      I = r.toRef(() =>
        F.value
          ? t.value.length
            ? t.value.map(({ props: e }) => e)
            : n.children$.size
              ? [...n.children$.values()]
              : []
          : []
      ),
      L = async (e, r = !1, t = !0) => {
        var n
        if (
          ((e = G(e)),
          !(null == (n = U(e)) ? void 0 : n.available) ||
            $.value ||
            S.value === e)
        )
          return
        const a = U(e),
          o = T.value
        ;(O.value && !1 === (await x('beforeSelect', a, o))) ||
          (Z(e, r),
          (S.value = e),
          O.value && w('select', a, o),
          t && b.push({ page: S.value }))
      },
      q = async (e, r = !1) => {
        var t, n
        const a = !e || X(e)
        if (
          a &&
          (await (null == (t = T.value) ? void 0 : t.validate()),
          null == (n = T.value) ? void 0 : n.invalid)
        )
          return (w('invalid', T.value), !1)
        if (r && a)
          for (const o of _.value.filter((e) => e.index < D.value))
            if ((await o.validate(), o.invalid)) return (w('invalid', o), !1)
        return !0
      },
      H = () => z(0),
      z = (e) => {
        var r
        const t = 'number' == typeof e ? e : K(e)
        if (t > -1 && t < A.value)
          for (let n = t; n <= A.value; n++)
            null == (r = _.value[n]) || r.unvalidate()
        L(e, !0)
      },
      W = (e, t) => {
        const a = r.toRef(() => n.children$.get(e.name)),
          o = r.toRef(e, 'name'),
          l = r.computed(() => {
            const r =
              'function' == typeof e.page ? e.page(a.value || {}) : e.page
            return Array.isArray(r) ? r[0] : { label: r }
          }),
          s = r.proxyRefs({
            elements: r.toRef(() => [e.name]),
            available: r.toRef(() =>
              a.value ? a.value.available : !e.conditions
            ),
            label: y(
              'page-label',
              r.toRef(() => l.value.label),
              v
            ),
            meta: l,
            view: r.toRef(e, 'view'),
            name: o,
            index: r.toRef(() => t),
            pageId: r.toRef(() => `${o.value}__tab`),
            panelId: r.toRef(() => `${o.value}__panel`),
            selected: r.toRef(() => S.value === e.name),
            tabindex: r.toRef(() =>
              void 0 !== V.value
                ? V.value === t
                  ? 0
                  : -1
                : S.value === e.name
                  ? 0
                  : -1
            ),
            completed: r.toRef(() => {
              var e
              return (
                t < A.value && !!(null == (e = a.value) ? void 0 : e.completed)
              )
            }),
            enabled: r.toRef(() => t <= A.value),
            invalid: r.toRef(() => {
              var e
              return !!(null == (e = a.value) ? void 0 : e.invalid)
            }),
            loading: r.toRef(() => {
              var e
              return (
                !!(null == (e = a.value) ? void 0 : e.busy) ||
                (t === D.value && $.value)
              )
            }),
            el$: a,
            validate: async () => await a.value.validate(),
            unvalidate: () => a.value.unvalidate(),
            select: () => {
              var e
              return !P.value || (null == (e = U(t)) ? void 0 : e.enabled)
                ? L(t)
                : {}
            },
            keydown: (e) => ee(e, s),
            focus: () => J(t),
            blur: () => Q(),
          })
        return s
      },
      U = (e) => (void 0 !== e && _.value.length ? _.value[K(e)] : void 0),
      G = (e) => {
        var r
        return 'number' == typeof e
          ? null == (r = _.value[e])
            ? void 0
            : r.name
          : e
      },
      K = (e) =>
        void 0 === e
          ? -1
          : 'number' == typeof e
            ? e
            : Object.values(_.value)
                .map((e) => e.name)
                .indexOf(e),
      Z = (e, r = !1) => {
        const t = K(e)
        if (!(-1 === t || (A.value >= t && !r))) return ((A.value = t), t)
      },
      X = (e) =>
        g(e).some((e) => {
          var r
          return null == (r = h.value) ? void 0 : r.includes(e)
        }),
      J = (e) => {
        V.value = e
      },
      Q = () => {
        V.value = void 0
      },
      ee = (e, r) => {
        var t
        switch (e.key) {
          case 'Enter':
          case 'NumpadEnter':
            ;(e.preventDefault(), r.select())
            break
          case 'ArrowRight':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowUp':
          case 'Home':
          case 'End':
            if (void 0 === V.value) return
            e.preventDefault()
            const n = _.value.filter(({ available: e }) => e)
            let a
            switch (e.key) {
              case 'ArrowRight':
              case 'ArrowDown':
                a = n[V.value + 1] || n[0]
                break
              case 'ArrowLeft':
              case 'ArrowUp':
                a = n[V.value - 1] || n[n.length - 1]
                break
              case 'Home':
                a = n[0]
                break
              case 'End':
                a = n[n.length - 1]
            }
            if (!C.value || !a) return
            null == (t = C.value.querySelector(`#${a.pageId}`)) || t.focus()
        }
      }
    return (
      E({
        select: a,
        step: o,
        back: l,
        next: s,
        finish: i,
        invalid: u,
        beforeSelect: d,
        beforeStep: c,
        beforeBack: p,
        beforeNext: f,
        beforeFinish: m,
      }).forEach(([e, r]) => !r || k(e, r)),
      r.watch(S, (e, r) => (O.value = void 0 === r ? e : r)),
      r.watch(
        I,
        () => {
          var e
          if (((_.value = I.value.map(W)), !_.value.length))
            return ((A.value = 0), void (S.value = void 0))
          ;(_.value.length &&
            A.value > _.value.length - 1 &&
            (A.value = _.value.length - 1),
            K(S.value) > _.value.length - 1 &&
              (S.value = G(_.value.length - 1)),
            (void 0 !== S.value &&
              (null == (e = U(S.value)) ? void 0 : e.available)) ||
              H())
        },
        { deep: !1, immediate: !0 }
      ),
      r.proxyRefs({
        page: S,
        oldPage: O,
        index: D,
        active: F,
        lastEnabled: A,
        loading: j,
        invalid: R,
        sequential: P,
        pages: _,
        nextPage: M,
        previousPage: N,
        currentPage: T,
        select: L,
        next: async () => {
          var e
          if (!M.value || (j.value && D.value === A.value)) return
          const r = M.value,
            t = T.value
          ;(await x('beforeNext', r, t)) &&
            ((null == (e = T.value) ? void 0 : e.loading) ||
              !1 !== (await q('next', !0))) &&
            (L(M.value.name), w('next', r, t))
        },
        back: async () => {
          var e
          if (!N.value) return
          const r = N.value,
            t = T.value
          ;(await x('beforeBack', r, t)) &&
            ((null == (e = T.value) ? void 0 : e.loading) ||
              !1 !== (await q('back'))) &&
            (await b.back(), L(N.value.name, !1, !1), w('back', r, t))
        },
        finish: async () => {
          M.value ||
            j.value ||
            (!1 !== (await x('beforeFinish')) && x('finish'))
        },
        reset: H,
        revertTo: z,
        on: k,
        off: B,
        enableUntil: Z,
        getPage: U,
      })
    )
  }
  const Hr = {
      type: 'group',
      submit: !0,
      disabled: !1,
      wrap: !1,
      conditions: void 0,
    },
    zr = ve((e, t) => {
      const n = je(e, t, [nr, ar]),
        {
          container: a,
          available: o,
          visible: l,
          help: s,
          hint: i,
          path: u,
          helpId: d,
          hintId: c,
          errorId: p,
          id: f,
          disabled: m,
          children: v,
        } = n,
        { on: g, fire: y } = t,
        h = te(),
        b = Lr(r.toRef(() => e.schema)),
        {
          value: k,
          model: B,
          initialModel: w,
          payload: x,
          dataPath: $,
          nullValue: C,
          invalid: S,
          required: E,
          dirty: _,
          pending: O,
          debouncing: A,
          busy: V,
          validated: P,
          completed: D,
          success: F,
          empty: j,
          numeric: R,
          hoisted: T,
          errors: M,
          hasError: N,
          displayErrors: I,
          ownErrors: L,
          formErrors: q,
          messages: H,
          messageBag: z,
          ruleMessages: W,
          isContainer: U,
          update: G,
          reset: K,
          clear: Y,
          validate: Z,
          validateSelf: X,
          validateChildren: J,
          unvalidate: Q,
          invalidate: ee,
          clean: re,
          clearErrors: ne,
          clearMessages: ae,
          clearMessageBag: oe,
          filled: le,
          reinit: se,
        } = wr({ props: e, deps: n, events: t }),
        { aria: ie } = Vr({
          props: e,
          deps: {
            help: s,
            hint: i,
            helpId: d,
            hintId: c,
            errorId: p,
            hasError: N,
            busy: V,
            required: E,
          },
        }),
        ue = qr({
          active: r.toRef(() => e.tabbed),
          schema: b,
          children: v,
          onSelect: (e, r) => y('tab', e, r, ue, h),
          onBeforeSelect: async (e, r) => await y('beforeTab', e, r, ue, h),
        })
      return (
        g('reset', ue.reset),
        mr({
          type: 'group',
          id: f,
          model: B,
          pager: ue,
          available: o,
          visible: l,
          disabled: m,
          dataPath: $,
          path: u,
          children: v,
          container: a,
        }),
        {
          ...n,
          ...t,
          aria: ie,
          pager: ue,
          resolvedSchema: b,
          value: k,
          model: B,
          initialModel: w,
          payload: x,
          dataPath: $,
          nullValue: C,
          invalid: S,
          required: E,
          dirty: _,
          pending: O,
          debouncing: A,
          busy: V,
          validated: P,
          completed: D,
          success: F,
          empty: j,
          numeric: R,
          hoisted: T,
          errors: M,
          hasError: N,
          displayErrors: I,
          ownErrors: L,
          formErrors: q,
          messages: H,
          messageBag: z,
          ruleMessages: W,
          isContainer: U,
          update: G,
          reset: K,
          clear: Y,
          validate: Z,
          validateSelf: X,
          validateChildren: J,
          unvalidate: Q,
          invalidate: ee,
          clean: re,
          clearErrors: ne,
          clearMessages: ae,
          clearMessageBag: oe,
          filled: le,
          reinit: se,
        }
      )
    }),
    Wr = r.defineComponent({
      name: 'VfGroup',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfGroup',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        schema: {},
        nested: { type: Boolean },
        inline: { type: Boolean },
        stacked: { type: Boolean },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        wrap: { type: Boolean },
        innerWrap: { type: Boolean },
        aria: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        tabbed: { type: Boolean },
        heading: {},
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
      },
      emits: [
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
        'tab',
        'beforeTab',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Hr),
          l = be(o),
          s = zr(o, a),
          i = he('VfGroup', () => ({
            root: { 'vf-group': !0, 'vf-wrapped': o.wrap },
            wrapper: {
              'vf-group-elements': !0,
              'vf-stacked': o.stacked,
              'vf-wrapped': o.innerWrap,
            },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { resolvedSchema: d, template: c, label: p, slots: f } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.renderSlot(
              e.$slots,
              'template',
              { context: r.unref(u) },
              () => [
                r.unref(c)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(c)),
                      { key: 0, context: r.unref(u) },
                      null,
                      8,
                      ['context']
                    ))
                  : (r.openBlock(),
                    r.createBlock(
                      n,
                      { key: 1 },
                      {
                        default: r.withCtx(() => [
                          r.renderSlot(
                            e.$slots,
                            'wrapper',
                            r.mergeProps(
                              {
                                resolvedSchema: r.unref(d),
                                label: r.unref(p),
                                class: r.unref(i).wrapper,
                              },
                              r.unref(l).wrapper
                            ),
                            () => {
                              var t
                              return [
                                (null == (t = r.unref(f)) ? void 0 : t.wrapper)
                                  ? (r.openBlock(),
                                    r.createBlock(
                                      r.resolveDynamicComponent(
                                        r.unref(f).wrapper
                                      ),
                                      r.mergeProps(
                                        {
                                          key: 0,
                                          'resolved-schema': r.unref(d),
                                          parts: r.unref(l),
                                          classes: r.unref(i),
                                          class: r.unref(i).wrapper,
                                        },
                                        r.unref(l).wrapper
                                      ),
                                      null,
                                      16,
                                      [
                                        'resolved-schema',
                                        'parts',
                                        'classes',
                                        'class',
                                      ]
                                    ))
                                  : (r.openBlock(),
                                    r.createElementBlock(
                                      'div',
                                      r.mergeProps(
                                        { key: 1, class: r.unref(i).wrapper },
                                        r.unref(l).wrapper
                                      ),
                                      [
                                        r.renderSlot(
                                          e.$slots,
                                          'default',
                                          { resolvedSchema: r.unref(d) },
                                          () => {
                                            var e
                                            return [
                                              (
                                                null == (e = r.unref(f))
                                                  ? void 0
                                                  : e.default
                                              )
                                                ? (r.openBlock(),
                                                  r.createBlock(
                                                    r.resolveDynamicComponent(
                                                      r.unref(f).default
                                                    ),
                                                    {
                                                      key: 0,
                                                      'resolved-schema':
                                                        r.unref(d),
                                                    },
                                                    null,
                                                    8,
                                                    ['resolved-schema']
                                                  ))
                                                : (r.openBlock(!0),
                                                  r.createElementBlock(
                                                    r.Fragment,
                                                    { key: 1 },
                                                    r.renderList(
                                                      r.unref(d),
                                                      (e) => (
                                                        r.openBlock(),
                                                        r.createBlock(
                                                          r.resolveDynamicComponent(
                                                            e.component
                                                          ),
                                                          r.mergeProps(
                                                            { ref_for: !0 },
                                                            e.props,
                                                            {
                                                              key: e.props.name,
                                                            }
                                                          ),
                                                          null,
                                                          16
                                                        )
                                                      )
                                                    ),
                                                    128
                                                  )),
                                            ]
                                          }
                                        ),
                                      ],
                                      16
                                    )),
                              ]
                            }
                          ),
                        ]),
                        _: 3,
                      }
                    )),
              ]
            )
          }
        )
      },
    }),
    Ur = { label: void 0, addons: void 0 },
    Gr = ve((e, t) => {
      const n = oe(),
        a = Re('showRequired'),
        o = Re('errorLevel'),
        { defaultBreakpoint: l } = Qe(),
        s = m()
      if (!n)
        throw new Error(
          '`useBlueprint()` can only be used inside an element component'
        )
      const {
          resolvedColumns: i,
          help: u,
          hint: d,
          errors: c,
          hoisted: p,
        } = _e(n, ['resolvedColumns', 'help', 'hint', 'errors', 'hoisted']),
        { template: f } = fe(e),
        g = r.computed(() => {
          const e = n.props.layout
          return e ? ('string' != typeof e ? r.markRaw(e) : e) : f.value
        }),
        y = dr(r.toRef(null == n ? void 0 : n.props, 'tokens')),
        h = r.toRef(() => s.nonce),
        k = `vf-t-${r.useId().replace(/:/g, '-')}`,
        B = r.computed(() => {
          const e = Object.entries(y.value)
          return e.length
            ? `.${k}{${e.map(([e, r]) => `${e}:${r}`).join(';')}}`
            : ''
        }),
        w = r.toRef(() => !!n.isContainer),
        x = r.toRef(() => w.value && void 0 !== n.label),
        $ = r.toRef(() => {
          var e
          return null == (e = r.unref(n.container.pager)) ? void 0 : e.active
        }),
        C = r.toRef(() => !1 !== e.label && !w.value),
        S = r.toRef(() =>
          w.value && n.props.heading ? `h${n.props.heading}` : void 0
        ),
        E = r.toRef(() => {
          var e
          return (
            void 0 !== n.label &&
            !(null == (e = n.props) ? void 0 : e.hideLabel)
          )
        }),
        _ = r.toRef(() => !E.value && !1 !== e.label && C.value),
        O = r.toRef(() => !E.value && F.value),
        A = r.toRef(() => n.required && a.value && a.value.includes('label')),
        V = r.toRef(() => !!u.value),
        P = r.toRef(() => !!d.value),
        D = r.toRef(() => {
          var r
          return !(
            n.props.hideErrors ||
            (void 0 !== o.value &&
              'element' !== o.value &&
              'all' !== o.value) ||
            p.value ||
            !(null == (r = c.value) ? void 0 : r.length) ||
            e.hideErrors
          )
        }),
        F = r.computed(() => {
          for (const e in n.resolvedColumns) {
            const r = n.resolvedColumns[e].label
            if (void 0 !== r && r > 0 && r < 12) return !0
          }
          return !1
        }),
        j = r.computed(() => {
          let e = { container: null, label: null, group: null, wrapper: null }
          for (const r in i.value)
            for (const t in i.value[r]) {
              const n = Number(i.value[r][t] || 0),
                a = r === l.value ? void 0 : r
              ;((e[t] = b(e[t], s.cols(n, a))),
                'label' === t && (e[t] = b(e[t], s.label(n, a))))
            }
          return e
        })
      return {
        el$: n,
        template: g,
        tokens: y,
        tokenClass: k,
        tokenCss: B,
        nonce: h,
        isContainer: w,
        isFieldset: x,
        hasPager: $,
        showLabel: E,
        showSrLabel: _,
        showPhLabel: O,
        showRequired: A,
        columnClasses: j,
        useLabelTag: C,
        headingTag: S,
        showHelp: V,
        showHint: P,
        showErrors: D,
        withDefaultProps: (e, r) =>
          (function (e, r, t) {
            const n = e[`props:${r}`]
            if (!n) return t || {}
            if (!t) return n
            const a = n.class
            if (!a) return t
            const o = t.class,
              l = Object.assign({}, t, n)
            return (o && (l.class = v(o, a)), l)
          })(n, e, r),
        helperClasses: (e) => (s.classHelpers ? s.classHelper(e) : null),
      }
    }),
    Kr = ['id'],
    Yr = ['for'],
    Zr = ['id'],
    Xr = ['id'],
    Jr = r.defineComponent({
      name: 'VfLayout',
      type: 'element-component',
      inheritAttrs: !1,
      __name: 'VfLayout',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        label: { type: Boolean },
        addons: { type: Boolean },
        hideErrors: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      setup(e, { expose: t }) {
        const n = r.useSlots(),
          a = e,
          o = Pe(),
          l = Se(a, Ur),
          s = Gr(l, o),
          i = he('VfLayout', s.el$.classes, () => ({
            root: s.tokenCss.value ? s.tokenClass : null,
          })),
          u = s.el$.parts,
          d = Ee(s, { parts: u, classes: i, props: l }),
          { tags: c } = W(),
          {
            el$: p,
            isFieldset: f,
            isContainer: m,
            hasPager: v,
            showRequired: g,
            showLabel: y,
            showSrLabel: h,
            showPhLabel: k,
            template: B,
            showHelp: w,
            showHint: x,
            showErrors: $,
            useLabelTag: C,
            headingTag: S,
            columnClasses: E,
            tokenCss: _,
            nonce: O,
            helperClasses: A,
          } = s,
          V = p.slots,
          P = () => {
            var e, t, a
            const o = p.addonable && !(!V.before && !p.beforeAddons.length),
              d = p.addonable && !(!V.after && !p.afterAddons.length),
              f = (!!p.props.translate && p.translatable) || !!V.language
            if (!(!1 !== l.addons && (o || d || f))) {
              const t = null == (e = n.default) ? void 0 : e.call(n)
              return p.props.inline && s.tokenCss.value
                ? r.h('div', { class: ['vf-passthrough', s.tokenClass] }, t)
                : [t]
            }
            const m = []
            p.addonable &&
              (V.before
                ? m.push(r.h(V.before))
                : p.beforeAddons.forEach((e, t) => {
                    var n
                    m.push(
                      r.h(r.resolveComponent('VfAddon'), {
                        key: `before-${t}`,
                        addon: e,
                        ...('function' == typeof u.beforeAddon
                          ? null == (n = u.beforeAddon)
                            ? void 0
                            : n.call(u, e, t)
                          : u.beforeAddon),
                      })
                    )
                  }))
            const v = null == (t = n.default) ? void 0 : t.call(n)
            ;(v && m.push(...v),
              p.addonable &&
                (V.after
                  ? m.push(r.h(V.after))
                  : p.afterAddons.forEach((e, t) => {
                      var n
                      m.push(
                        r.h(r.resolveComponent('VfAddon'), {
                          key: `after-${t}`,
                          addon: e,
                          ...('function' == typeof u.afterAddon
                            ? null == (n = u.afterAddon)
                              ? void 0
                              : n.call(u, e, t)
                            : u.afterAddon),
                        })
                      )
                    })),
              f &&
                (V.language
                  ? m.push(r.h(V.language, u.language))
                  : m.push(
                      r.h(r.resolveComponent('VfAddon'), {
                        addon: p.translateAddon,
                        ...u.language,
                      })
                    )))
            const g = r.h(
              'div',
              {
                ...u.inputGroup,
                class: b(
                  b(
                    i.inputGroup,
                    p.props.inline && s.tokenCss.value ? s.tokenClass : null
                  ),
                  null == (a = u.inputGroup) ? void 0 : a.class
                ),
              },
              m
            )
            return f && p.props.translate && p.translatable
              ? [
                  g,
                  r.h(
                    'span',
                    {
                      id: p.languageId,
                      class: 'sr-only',
                      'aria-live': 'polite',
                    },
                    `${c.sr_editing_language}: ${p.languages[p.language]}`
                  ),
                ]
              : g
          }
        return (
          t({ props: l, parts: u, classes: i, ...s }),
          (e, t) => (
            r.openBlock(),
            r.createElementBlock(
              r.Fragment,
              null,
              [
                r.unref(B)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(B)),
                      { key: 0, context: r.unref(d) },
                      null,
                      8,
                      ['context']
                    ))
                  : r.unref(m) || r.unref(p).viewLoaded
                    ? (r.openBlock(),
                      r.createElementBlock(
                        r.Fragment,
                        { key: 1 },
                        [
                          r.unref(p).props.inline
                            ? (r.openBlock(), r.createBlock(P, { key: 0 }))
                            : (r.openBlock(),
                              r.createBlock(
                                r.resolveDynamicComponent(
                                  r.unref(v) ? 'div' : r.unref(Oe)
                                ),
                                r.mergeProps(
                                  {
                                    key: 1,
                                    class: r.unref(i).panel,
                                    id: `${r.unref(p).name}__panel`,
                                    role: 'tabpanel',
                                    'aria-labelledby': `${r.unref(p).name}__tab`,
                                    hidden: !r.unref(p).visible || void 0,
                                    tabindex: 0,
                                  },
                                  r.unref(u).panel
                                ),
                                {
                                  default: r.withCtx(() => {
                                    var e, t, n
                                    return [
                                      r.withDirectives(
                                        (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(f) ? 'fieldset' : 'div'
                                          ),
                                          r.mergeProps(
                                            {
                                              class: [
                                                null ==
                                                (t = (e = r.unref(i)).root)
                                                  ? void 0
                                                  : t.call(e, r.unref(p).props),
                                                r.unref(A)('columns.container'),
                                                r.unref(E).container,
                                              ],
                                              'aria-labelledby':
                                                r.unref(f) && r.unref(y)
                                                  ? r.unref(p).labelId
                                                  : void 0,
                                              'aria-label':
                                                r.unref(f) && !r.unref(y)
                                                  ? r.unref(p).genericName
                                                  : void 0,
                                              'aria-describedby': r.unref(f)
                                                ? null == (n = r.unref(p).aria)
                                                  ? void 0
                                                  : n.describedby
                                                : void 0,
                                              hidden:
                                                (!r.unref(v) &&
                                                  !r.unref(p).visible) ||
                                                void 0,
                                            },
                                            r.unref(u).root
                                          ),
                                          {
                                            default: r.withCtx(() => {
                                              var e, t
                                              return [
                                                r.unref(y)
                                                  ? (r.openBlock(),
                                                    r.createElementBlock(
                                                      'div',
                                                      r.mergeProps(
                                                        {
                                                          key: 0,
                                                          class: [
                                                            null ==
                                                            (t = (e =
                                                              r.unref(i))
                                                              .labelGroup)
                                                              ? void 0
                                                              : t.call(
                                                                  e,
                                                                  r.unref(p)
                                                                    .props
                                                                    .heading
                                                                ),
                                                            r.unref(A)(
                                                              'columns.label'
                                                            ),
                                                            r.unref(E).label,
                                                          ],
                                                        },
                                                        r.unref(u).labelGroup
                                                      ),
                                                      [
                                                        r.unref(V).label
                                                          ? (r.openBlock(),
                                                            r.createBlock(
                                                              r.resolveDynamicComponent(
                                                                r.unref(V).label
                                                              ),
                                                              r.mergeProps(
                                                                {
                                                                  key: 0,
                                                                  for: r.unref(
                                                                    C
                                                                  )
                                                                    ? r.unref(p)
                                                                        .id
                                                                    : void 0,
                                                                  id: r.unref(p)
                                                                    .labelId,
                                                                  class:
                                                                    r.unref(i)
                                                                      .label,
                                                                  tag:
                                                                    r.unref(
                                                                      S
                                                                    ) ||
                                                                    (r.unref(C)
                                                                      ? 'label'
                                                                      : 'span'),
                                                                  label:
                                                                    r.unref(p)
                                                                      .label,
                                                                },
                                                                r.unref(u).label
                                                              ),
                                                              null,
                                                              16,
                                                              [
                                                                'for',
                                                                'id',
                                                                'class',
                                                                'tag',
                                                                'label',
                                                              ]
                                                            ))
                                                          : (r.openBlock(),
                                                            r.createBlock(
                                                              r.resolveDynamicComponent(
                                                                r.unref(S) ||
                                                                  (r.unref(C)
                                                                    ? 'label'
                                                                    : 'span')
                                                              ),
                                                              r.mergeProps(
                                                                {
                                                                  key: 1,
                                                                  for: r.unref(
                                                                    C
                                                                  )
                                                                    ? r.unref(p)
                                                                        .id
                                                                    : void 0,
                                                                  id: r.unref(p)
                                                                    .labelId,
                                                                  class:
                                                                    r.unref(i)
                                                                      .label,
                                                                },
                                                                r.unref(u).label
                                                              ),
                                                              {
                                                                default:
                                                                  r.withCtx(
                                                                    () => [
                                                                      r.createTextVNode(
                                                                        r.toDisplayString(
                                                                          r.unref(
                                                                            p
                                                                          )
                                                                            .label
                                                                        ),
                                                                        1
                                                                      ),
                                                                    ]
                                                                  ),
                                                                _: 1,
                                                              },
                                                              16,
                                                              [
                                                                'for',
                                                                'id',
                                                                'class',
                                                              ]
                                                            )),
                                                        r.unref(g)
                                                          ? (r.openBlock(),
                                                            r.createElementBlock(
                                                              'span',
                                                              r.mergeProps(
                                                                {
                                                                  key: 2,
                                                                  'aria-hidden':
                                                                    'true',
                                                                  class:
                                                                    r.unref(i)
                                                                      .required,
                                                                },
                                                                r.unref(u)
                                                                  .required
                                                              ),
                                                              [
                                                                r.unref(V)
                                                                  .required
                                                                  ? (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          V
                                                                        )
                                                                          .required
                                                                      ),
                                                                      { key: 0 }
                                                                    ))
                                                                  : r.createCommentVNode(
                                                                      '',
                                                                      !0
                                                                    ),
                                                              ],
                                                              16
                                                            ))
                                                          : r.createCommentVNode(
                                                              '',
                                                              !0
                                                            ),
                                                        r.unref(w) &&
                                                        r.unref(V).help
                                                          ? (r.openBlock(),
                                                            r.createBlock(
                                                              r.resolveDynamicComponent(
                                                                r.unref(V).help
                                                              ),
                                                              r.mergeProps(
                                                                {
                                                                  key: 3,
                                                                  help: r.unref(
                                                                    p
                                                                  ).help,
                                                                  id: r.unref(p)
                                                                    .helpId,
                                                                },
                                                                r.unref(u).help
                                                              ),
                                                              null,
                                                              16,
                                                              ['help', 'id']
                                                            ))
                                                          : r.unref(w)
                                                            ? (r.openBlock(),
                                                              r.createElementBlock(
                                                                'div',
                                                                r.mergeProps(
                                                                  {
                                                                    key: 4,
                                                                    id: r.unref(
                                                                      p
                                                                    ).helpId,
                                                                    class:
                                                                      r.unref(i)
                                                                        .help,
                                                                  },
                                                                  r.unref(u)
                                                                    .help
                                                                ),
                                                                r.toDisplayString(
                                                                  r.unref(p)
                                                                    .help
                                                                ),
                                                                17,
                                                                Kr
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                      ],
                                                      16
                                                    ))
                                                  : (r.openBlock(),
                                                    r.createElementBlock(
                                                      r.Fragment,
                                                      { key: 1 },
                                                      [
                                                        r.unref(h)
                                                          ? (r.openBlock(),
                                                            r.createElementBlock(
                                                              'label',
                                                              {
                                                                key: 0,
                                                                for: r.unref(p)
                                                                  .id,
                                                                class:
                                                                  'sr-only',
                                                              },
                                                              r.toDisplayString(
                                                                r.unref(p)
                                                                  .genericName
                                                              ),
                                                              9,
                                                              Yr
                                                            ))
                                                          : r.createCommentVNode(
                                                              '',
                                                              !0
                                                            ),
                                                        r.unref(k)
                                                          ? (r.openBlock(),
                                                            r.createElementBlock(
                                                              'div',
                                                              {
                                                                key: 1,
                                                                class:
                                                                  r.normalizeClass(
                                                                    r.unref(E)
                                                                      .label
                                                                  ),
                                                                'aria-hidden':
                                                                  'true',
                                                              },
                                                              null,
                                                              2
                                                            ))
                                                          : r.createCommentVNode(
                                                              '',
                                                              !0
                                                            ),
                                                      ],
                                                      64
                                                    )),
                                                r.createElementVNode(
                                                  'div',
                                                  r.mergeProps(
                                                    {
                                                      class: [
                                                        r.unref(i).elementGroup,
                                                        r.unref(A)(
                                                          'columns.12-wrapper'
                                                        ),
                                                        r.unref(E).group,
                                                      ],
                                                    },
                                                    r.unref(u).elementGroup
                                                  ),
                                                  [
                                                    r.unref(p).props.tabbed
                                                      ? (r.openBlock(),
                                                        r.createBlock(
                                                          r.resolveDynamicComponent(
                                                            r.unref(V).tabs ||
                                                              'VfTabs'
                                                          ),
                                                          r.mergeProps(
                                                            {
                                                              key: 0,
                                                              pager:
                                                                r.unref(p)
                                                                  .pager,
                                                            },
                                                            r.unref(u).tabs
                                                          ),
                                                          {
                                                            tab: r.withCtx(
                                                              (e) => [
                                                                r.unref(V).tab
                                                                  ? (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          V
                                                                        ).tab
                                                                      ),
                                                                      r.normalizeProps(
                                                                        r.mergeProps(
                                                                          {
                                                                            key: 0,
                                                                          },
                                                                          e
                                                                        )
                                                                      ),
                                                                      null,
                                                                      16
                                                                    ))
                                                                  : r.createCommentVNode(
                                                                      '',
                                                                      !0
                                                                    ),
                                                              ]
                                                            ),
                                                            _: 1,
                                                          },
                                                          16,
                                                          ['pager']
                                                        ))
                                                      : r.createCommentVNode(
                                                          '',
                                                          !0
                                                        ),
                                                    r.createElementVNode(
                                                      'div',
                                                      r.mergeProps(
                                                        {
                                                          class: [
                                                            r.unref(i)
                                                              .elementWrapper,
                                                            r.unref(A)(
                                                              'columns.wrapper'
                                                            ),
                                                            r.unref(E).wrapper,
                                                          ],
                                                        },
                                                        r.unref(u)
                                                          .elementWrapper
                                                      ),
                                                      [r.createVNode(P)],
                                                      16
                                                    ),
                                                    r.unref(x) &&
                                                    r.unref(V).hint
                                                      ? (r.openBlock(),
                                                        r.createBlock(
                                                          r.resolveDynamicComponent(
                                                            r.unref(V).hint
                                                          ),
                                                          r.mergeProps(
                                                            {
                                                              key: 1,
                                                              hint: r.unref(p)
                                                                .hint,
                                                              id: r.unref(p)
                                                                .hintId,
                                                              class:
                                                                r.unref(E).full,
                                                            },
                                                            r.unref(u).hint
                                                          ),
                                                          null,
                                                          16,
                                                          [
                                                            'hint',
                                                            'id',
                                                            'class',
                                                          ]
                                                        ))
                                                      : r.unref(x)
                                                        ? (r.openBlock(),
                                                          r.createElementBlock(
                                                            'div',
                                                            r.mergeProps(
                                                              {
                                                                key: 2,
                                                                id: r.unref(p)
                                                                  .hintId,
                                                                class: [
                                                                  r.unref(i)
                                                                    .hint,
                                                                  r.unref(E)
                                                                    .full,
                                                                ],
                                                              },
                                                              r.unref(u).hint
                                                            ),
                                                            r.toDisplayString(
                                                              r.unref(p).hint
                                                            ),
                                                            17,
                                                            Zr
                                                          ))
                                                        : r.createCommentVNode(
                                                            '',
                                                            !0
                                                          ),
                                                    r.unref($) &&
                                                    r.unref(V).errors
                                                      ? (r.openBlock(),
                                                        r.createBlock(
                                                          r.resolveDynamicComponent(
                                                            r.unref(V).errors
                                                          ),
                                                          {
                                                            key: 3,
                                                            errors:
                                                              r.unref(p)
                                                                .displayErrors,
                                                          },
                                                          null,
                                                          8,
                                                          ['errors']
                                                        ))
                                                      : r.unref($)
                                                        ? (r.openBlock(),
                                                          r.createElementBlock(
                                                            'div',
                                                            r.mergeProps(
                                                              {
                                                                key: 4,
                                                                class:
                                                                  r.unref(i)
                                                                    .errors,
                                                                id: r.unref(p)
                                                                  .errorId,
                                                                role: 'alert',
                                                              },
                                                              r.unref(u).errors
                                                            ),
                                                            [
                                                              (r.openBlock(!0),
                                                              r.createElementBlock(
                                                                r.Fragment,
                                                                null,
                                                                r.renderList(
                                                                  r.unref(p)
                                                                    .displayErrors,
                                                                  (e) => (
                                                                    r.openBlock(),
                                                                    r.createElementBlock(
                                                                      'div',
                                                                      r.mergeProps(
                                                                        {
                                                                          key: e,
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .error,
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          u
                                                                        ).error
                                                                      ),
                                                                      r.toDisplayString(
                                                                        e
                                                                      ),
                                                                      17
                                                                    )
                                                                  )
                                                                ),
                                                                128
                                                              )),
                                                            ],
                                                            16,
                                                            Xr
                                                          ))
                                                        : r.createCommentVNode(
                                                            '',
                                                            !0
                                                          ),
                                                    r.unref(p).messages
                                                      .length &&
                                                    r.unref(V).messages
                                                      ? (r.openBlock(),
                                                        r.createBlock(
                                                          r.resolveDynamicComponent(
                                                            r.unref(V).messages
                                                          ),
                                                          {
                                                            key: 5,
                                                            messages:
                                                              r.unref(p)
                                                                .messages,
                                                          },
                                                          null,
                                                          8,
                                                          ['messages']
                                                        ))
                                                      : r.unref(p).messages
                                                            .length
                                                        ? (r.openBlock(),
                                                          r.createElementBlock(
                                                            'div',
                                                            r.mergeProps(
                                                              {
                                                                key: 6,
                                                                class:
                                                                  r.unref(i)
                                                                    .messages,
                                                              },
                                                              r.unref(u)
                                                                .messages
                                                            ),
                                                            [
                                                              (r.openBlock(!0),
                                                              r.createElementBlock(
                                                                r.Fragment,
                                                                null,
                                                                r.renderList(
                                                                  r.unref(p)
                                                                    .messages,
                                                                  (e) => (
                                                                    r.openBlock(),
                                                                    r.createElementBlock(
                                                                      'div',
                                                                      r.mergeProps(
                                                                        {
                                                                          key: e,
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .message,
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          u
                                                                        )
                                                                          .message
                                                                      ),
                                                                      r.toDisplayString(
                                                                        e
                                                                      ),
                                                                      17
                                                                    )
                                                                  )
                                                                ),
                                                                128
                                                              )),
                                                            ],
                                                            16
                                                          ))
                                                        : r.createCommentVNode(
                                                            '',
                                                            !0
                                                          ),
                                                  ],
                                                  16
                                                ),
                                              ]
                                            }),
                                            _: 1,
                                          },
                                          16,
                                          [
                                            'class',
                                            'aria-labelledby',
                                            'aria-label',
                                            'aria-describedby',
                                            'hidden',
                                          ]
                                        )),
                                        [[r.vShow, r.unref(p).visible]]
                                      ),
                                    ]
                                  }),
                                  _: 1,
                                },
                                16,
                                ['class', 'id', 'aria-labelledby', 'hidden']
                              )),
                        ],
                        64
                      ))
                    : r.createCommentVNode('', !0),
                r.unref(_)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent('style'),
                      { key: 2, '^nonce': r.unref(O) },
                      {
                        default: r.withCtx(() => [
                          r.createTextVNode(r.toDisplayString(r.unref(_)), 1),
                        ]),
                        _: 1,
                      },
                      8,
                      ['^nonce']
                    ))
                  : r.createCommentVNode('', !0),
              ],
              64
            )
          )
        )
      },
    }),
    Qr = {},
    et = ve((e, r) => {
      const { template: t, slots: n } = fe(e)
      return { template: t, slots: n }
    }),
    rt = r.defineComponent({
      name: 'VfElements',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfElements',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Qr),
          l = be(o),
          s = et(o, a),
          i = he('VfElements', () => ({ root: 'vf-elements' })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { template: d, slots: c } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(d)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(d)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'div',
                    r.mergeProps(
                      { key: 1, class: r.unref(i).root },
                      r.unref(l).root
                    ),
                    [
                      r.renderSlot(e.$slots, 'default', {}, () => {
                        var e
                        return [
                          (null == (e = r.unref(c)) ? void 0 : e.default)
                            ? (r.openBlock(),
                              r.createBlock(
                                r.resolveDynamicComponent(r.unref(c).default),
                                { key: 0 }
                              ))
                            : r.createCommentVNode('', !0),
                        ]
                      }),
                    ],
                    16
                  )),
            ])
        )
      },
    })
  function tt({ props: e, deps: t }) {
    const n = J(),
      a = m(),
      { localizeObject: o } = W(),
      l = r.computed(() =>
        o(e.languages ?? (null == n ? void 0 : n.languages) ?? a.languages)
      ),
      s = r.computed(() => !!e.translate && !!Object.keys(l.value).length),
      i = r.ref((null == n ? void 0 : n.language) || 'default'),
      u = r.computed(() => (t.id ? `${t.id.value}__language` : void 0)),
      d = r.toRef(() => Object.keys(l.value)[0])
    r.watchEffect(
      () => (i.value = (null == n ? void 0 : n.language) || d.value)
    )
    return {
      translateAddon: r.computed(() => ({
        type: 'select',
        name: 'language',
        detached: !0,
        modelValue: i.value,
        items: l.value,
        'onUpdate:modelValue': (e) => (i.value = e),
      })),
      language: i,
      languageId: u,
      languages: l,
      translatable: s,
    }
  }
  function nt({ props: e, deps: t }) {
    const { path: n } = t,
      { check: a, isNegated: o } = q(),
      l = te(),
      s = J()
    return {
      readonly: r.computed(() => {
        const t = r.unref(e.readonly)
        return (
          !!(null == s ? void 0 : s.readonly) ||
          '' === t ||
          ('function' == typeof t
            ? t(l)
            : ((i = t),
              Array.isArray(i) || 'string' == typeof i || o(i)
                ? a(t, l, n.value)
                : !!t))
        )
        var i
      }),
    }
  }
  const at = {
      type: 'field',
      disabled: !1,
      readonly: !1,
      translate: !1,
      debounce: 0,
      submit: !0,
      bail: !0,
      maxErrors: 1,
      default: null,
      conditions: void 0,
      showRequired: void 0,
      untrackOn: () => ['input'],
    },
    ot = ve((e, t) => {
      const n = je(e, t, [nr, lr, vr, tt, ar, nt]),
        { container: a, children: o } = n,
        { fire: l } = t,
        i = te(),
        u = r.ref(),
        {
          value: d,
          model: c,
          initialModel: p,
          payload: f,
          dataPath: m,
          nullValue: v,
          invalid: g,
          required: y,
          dirty: h,
          pending: b,
          debouncing: k,
          busy: B,
          validated: w,
          completed: x,
          success: $,
          empty: C,
          numeric: S,
          hoisted: E,
          errors: _,
          hasError: O,
          displayErrors: A,
          ownErrors: V,
          formErrors: P,
          messages: D,
          messageBag: F,
          ruleMessages: j,
          invalidLanguages: R,
          update: T,
          reset: M,
          clear: N,
          validate: I,
          validateSelf: L,
          validateChildren: q,
          validateCurrent: H,
          unvalidate: z,
          invalidate: W,
          clean: U,
          clearErrors: G,
          clearMessages: K,
          clearMessageBag: Y,
          filled: Z,
          handleInput: X,
          reinit: J,
        } = wr({ props: e, deps: n, events: t }),
        {
          tracking: Q,
          track: ee,
          untrack: re,
        } = hr({ props: e, deps: { ...n, model: c, update: T }, events: t }),
        { aria: ne } = Vr({
          props: e,
          deps: { ...n, hasError: O, busy: B, required: y },
        }),
        ae = s(r.computed(() => e.options || {}))
      return (
        mr({ container: a, children: o }),
        {
          ...n,
          ...t,
          input: u,
          aria: ne,
          options: ae,
          value: d,
          model: c,
          initialModel: p,
          payload: f,
          dataPath: m,
          nullValue: v,
          invalid: g,
          required: y,
          dirty: h,
          pending: b,
          debouncing: k,
          busy: B,
          validated: w,
          completed: x,
          success: $,
          empty: C,
          numeric: S,
          hoisted: E,
          errors: _,
          hasError: O,
          displayErrors: A,
          ownErrors: V,
          formErrors: P,
          messages: D,
          messageBag: F,
          ruleMessages: j,
          invalidLanguages: R,
          update: T,
          reset: M,
          clear: N,
          validate: I,
          validateSelf: L,
          validateChildren: q,
          validateCurrent: H,
          unvalidate: z,
          invalidate: W,
          clean: U,
          clearErrors: G,
          clearMessages: K,
          clearMessageBag: Y,
          filled: Z,
          handleInput: X,
          handleKeydown: (e) => l('keydown', e, i),
          handleKeyup: (e) => l('keyup', e, i),
          handleKeypress: (e) => l('keypress', e, i),
          reinit: J,
          tracking: Q,
          track: ee,
          untrack: re,
        }
      )
    }),
    lt = r.defineComponent({
      name: 'VfField',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfField',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        default: {},
        rules: {},
        aria: {},
        readonly: { type: [String, Boolean, Object, Function, Array] },
        nullValue: {},
        options: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        untrackOn: {},
        detached: { type: Boolean },
        transformPayload: { type: Function },
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        translate: { type: Boolean },
        languages: {},
        before: { type: [String, Object, Array, Function] },
        after: { type: [String, Object, Array, Function] },
      },
      emits: [
        'input',
        'focus',
        'blur',
        'keydown',
        'keyup',
        'keypress',
        'change',
        'event',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, at),
          l = be(o),
          s = ot(o, a),
          i = he('VfField', () => ({
            root: { 'vf-field': !0, 'vf-align-label': !s.help.value },
            inputGroup: 'vf-input-group',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { viewLoaded: d, template: c, slots: p } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(d)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(c)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(c)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.renderSlot(
                                e.$slots,
                                'default',
                                { context: r.unref(u) },
                                () => {
                                  var e
                                  return [
                                    (
                                      null == (e = r.unref(p))
                                        ? void 0
                                        : e.default
                                    )
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(p).default
                                          ),
                                          { key: 0, context: r.unref(u) },
                                          null,
                                          8,
                                          ['context']
                                        ))
                                      : r.createCommentVNode('', !0),
                                  ]
                                }
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    })
  function st(e, r) {
    return e instanceof File
      ? { name: e.name, removable: !0, type: 'file', raw: e }
      : 'string' == typeof e
        ? { name: e, removable: r, type: 'string', raw: e }
        : {
            name: e.name ?? '',
            url: e.url,
            removable: void 0 !== e.remove ? !1 !== e.remove : r,
            type: 'object',
            raw: e,
          }
  }
  const it = {
      type: 'file',
      multiple: !1,
      disabled: !1,
      debounce: 0,
      submit: !0,
      bail: !0,
      maxErrors: 1,
      conditions: void 0,
      showRequired: void 0,
      remove: !0,
      add: !0,
    },
    ut = ve((e, t) => {
      const n = je(e, t, [nr, ar, vr]),
        { container: a, children: o } = n,
        { fire: l } = t,
        s = te(),
        i = Te(),
        { tags: u } = W(),
        d = r.ref(),
        {
          value: c,
          model: p,
          initialModel: f,
          payload: m,
          dataPath: v,
          nullValue: g,
          invalid: y,
          required: h,
          dirty: b,
          pending: k,
          debouncing: B,
          busy: w,
          validated: x,
          completed: $,
          success: C,
          empty: S,
          numeric: E,
          hoisted: _,
          errors: O,
          hasError: A,
          displayErrors: V,
          ownErrors: P,
          formErrors: D,
          messages: F,
          messageBag: j,
          ruleMessages: R,
          shouldValidate: T,
          update: M,
          reset: N,
          clear: I,
          validate: L,
          validateSelf: q,
          validateChildren: H,
          unvalidate: z,
          invalidate: U,
          clean: G,
          clearErrors: K,
          clearMessages: Y,
          clearMessageBag: Z,
          filled: X,
          reinit: J,
        } = wr({ props: e, deps: n, events: t }),
        { aria: Q } = Vr({
          props: e,
          deps: { ...n, hasError: A, busy: w, required: h },
        }),
        ee = i(
          'file',
          r.toRef(
            () =>
              e.text ??
              (e.multiple ? u.file_button_text_multiple : u.file_button_text)
          ),
          s
        ),
        re = r.computed(() => {
          const r = p.value,
            t = !1 !== e.remove
          return null == r
            ? []
            : Array.isArray(r)
              ? r.map((e) => st(e, t))
              : r instanceof File ||
                  'string' == typeof r ||
                  ('object' == typeof (n = r) &&
                    null !== n &&
                    !(n instanceof File))
                ? [st(r, t)]
                : []
          var n
        }),
        ne = r.computed(() => re.value.length > 0)
      return (
        mr({ container: a, children: o }),
        {
          ...n,
          ...t,
          input: d,
          aria: Q,
          fileList: re,
          hasFiles: ne,
          text: ee,
          value: c,
          model: p,
          initialModel: f,
          payload: m,
          dataPath: v,
          nullValue: g,
          invalid: y,
          required: h,
          dirty: b,
          pending: k,
          debouncing: B,
          busy: w,
          validated: x,
          completed: $,
          success: C,
          empty: S,
          numeric: E,
          hoisted: _,
          errors: O,
          hasError: A,
          displayErrors: V,
          ownErrors: P,
          formErrors: D,
          messages: F,
          messageBag: j,
          ruleMessages: R,
          update: M,
          reset: N,
          clear: I,
          validate: L,
          validateSelf: q,
          validateChildren: H,
          unvalidate: z,
          invalidate: U,
          clean: G,
          clearErrors: K,
          clearMessages: Y,
          clearMessageBag: Z,
          filled: X,
          handleInput: (r) => {
            const t = r.target,
              n = t.files
            if (!n) return
            const a = Array.from(n),
              o = p.value,
              i = e.multiple
                ? [...(Array.isArray(o) ? o : null != o ? [o] : []), ...a]
                : (a[0] ?? null)
            for (const e of a) l('add', e, s)
            ;(M(i), T.value && L(), (t.value = ''))
          },
          handleRemove: (r) => {
            const t = re.value[r]
            if (!t || !t.removable) return
            const n = p.value,
              a = Array.isArray(n) ? n[r] : n
            if ((l('remove', a, s), Array.isArray(n))) {
              const t = [...n]
              t.splice(r, 1)
              const a = e.multiple ? t : (t[0] ?? null)
              M(a)
            } else M(null)
            T.value && L()
          },
          reinit: J,
          triggerFileInput: () => {
            var e
            null == (e = d.value) || e.click()
          },
        }
      )
    }),
    dt = ['href'],
    ct = [
      'name',
      'id',
      'multiple',
      'accept',
      'capture',
      'aria-labelledby',
      'aria-describedby',
      'aria-invalid',
      'aria-required',
      'aria-busy',
    ],
    pt = r.defineComponent({
      name: 'VfFile',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfFile',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        default: {},
        multiple: { type: Boolean },
        remove: { type: Boolean },
        add: { type: Boolean },
        accept: {},
        capture: { type: [String, Boolean] },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        text: { type: [String, Object, Function] },
        aria: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
      },
      emits: [
        'input',
        'focus',
        'blur',
        'add',
        'change',
        'remove',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, it),
          l = be(o),
          s = ut(o, a),
          i = he('VfFile', () => ({
            root: { 'vf-file': !0, 'vf-align-label': !s.help.value },
            input: 'sr-only',
            list: 'vf-file-list',
            item: 'vf-file-item',
            name: 'vf-file-name',
            remove: 'vf-file-remove vf-btn-icon-remove',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            accept: d,
            multiple: c,
            capture: p,
            add: f,
          } = _e(o, ['accept', 'multiple', 'capture', 'add']),
          {
            id: m,
            viewLoaded: v,
            disabled: g,
            aria: y,
            input: h,
            template: b,
            name: k,
            fileList: B,
            hasFiles: w,
            text: x,
            slots: $,
            handleInput: C,
            handleRemove: S,
            triggerFileInput: E,
            handleFocus: _,
            handleBlur: O,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfBtn'),
              a = r.resolveComponent('VfButton'),
              o = r.resolveComponent('VfLayout')
            return r.unref(v)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(b)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(b)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          o,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.unref(w)
                                ? (r.openBlock(),
                                  r.createElementBlock(
                                    'div',
                                    r.mergeProps(
                                      { key: 0, class: r.unref(i).list },
                                      r.unref(l).list
                                    ),
                                    [
                                      (r.openBlock(!0),
                                      r.createElementBlock(
                                        r.Fragment,
                                        null,
                                        r.renderList(r.unref(B), (t, a) =>
                                          r.renderSlot(
                                            e.$slots,
                                            'file',
                                            {
                                              key: a,
                                              value: t.raw,
                                              fileName: t.name,
                                              type: t.type,
                                              url: t.url,
                                              index: a,
                                              disabled: r.unref(g),
                                              removable: t.removable,
                                              remove: r.unref(S),
                                            },
                                            () => {
                                              var o
                                              return [
                                                (
                                                  null == (o = r.unref($))
                                                    ? void 0
                                                    : o.file
                                                )
                                                  ? (r.openBlock(),
                                                    r.createBlock(
                                                      r.resolveDynamicComponent(
                                                        r.unref($).file
                                                      ),
                                                      {
                                                        key: 0,
                                                        value: t.raw,
                                                        fileName: t.name,
                                                        type: t.type,
                                                        url: t.url,
                                                        index: a,
                                                        disabled: r.unref(g),
                                                        removable: t.removable,
                                                        remove: r.unref(S),
                                                      },
                                                      null,
                                                      8,
                                                      [
                                                        'value',
                                                        'fileName',
                                                        'type',
                                                        'url',
                                                        'index',
                                                        'disabled',
                                                        'removable',
                                                        'remove',
                                                      ]
                                                    ))
                                                  : (r.openBlock(),
                                                    r.createElementBlock(
                                                      'div',
                                                      r.mergeProps(
                                                        {
                                                          key: 1,
                                                          class:
                                                            r.unref(i).item,
                                                        },
                                                        { ref_for: !0 },
                                                        r.unref(l).item
                                                      ),
                                                      [
                                                        t.removable
                                                          ? r.renderSlot(
                                                              e.$slots,
                                                              'remove',
                                                              {
                                                                key: 0,
                                                                index: a,
                                                                disabled:
                                                                  r.unref(g),
                                                                remove:
                                                                  r.unref(S),
                                                              },
                                                              () => {
                                                                var e
                                                                return [
                                                                  (
                                                                    null ==
                                                                    (e =
                                                                      r.unref(
                                                                        $
                                                                      ))
                                                                      ? void 0
                                                                      : e.remove
                                                                  )
                                                                    ? (r.openBlock(),
                                                                      r.createBlock(
                                                                        r.resolveDynamicComponent(
                                                                          r.unref(
                                                                            $
                                                                          )
                                                                            .remove
                                                                        ),
                                                                        {
                                                                          key: 0,
                                                                          index:
                                                                            a,
                                                                          disabled:
                                                                            r.unref(
                                                                              g
                                                                            ),
                                                                          remove:
                                                                            r.unref(
                                                                              S
                                                                            ),
                                                                        },
                                                                        null,
                                                                        8,
                                                                        [
                                                                          'index',
                                                                          'disabled',
                                                                          'remove',
                                                                        ]
                                                                      ))
                                                                    : (r.openBlock(),
                                                                      r.createBlock(
                                                                        n,
                                                                        r.mergeProps(
                                                                          {
                                                                            key: 1,
                                                                            class:
                                                                              r.unref(
                                                                                i
                                                                              )
                                                                                .remove,
                                                                            disabled:
                                                                              r.unref(
                                                                                g
                                                                              ),
                                                                            size: 'small',
                                                                          },
                                                                          {
                                                                            ref_for:
                                                                              !0,
                                                                          },
                                                                          r.unref(
                                                                            l
                                                                          )
                                                                            .remove,
                                                                          {
                                                                            onClick:
                                                                              (
                                                                                e
                                                                              ) =>
                                                                                r.unref(
                                                                                  S
                                                                                )(
                                                                                  a
                                                                                ),
                                                                          }
                                                                        ),
                                                                        null,
                                                                        16,
                                                                        [
                                                                          'class',
                                                                          'disabled',
                                                                          'onClick',
                                                                        ]
                                                                      )),
                                                                ]
                                                              }
                                                            )
                                                          : r.createCommentVNode(
                                                              '',
                                                              !0
                                                            ),
                                                        r.renderSlot(
                                                          e.$slots,
                                                          'name',
                                                          {
                                                            value: t.raw,
                                                            fileName: t.name,
                                                            url: t.url,
                                                            type: t.type,
                                                          },
                                                          () => {
                                                            var e
                                                            return [
                                                              (
                                                                null ==
                                                                (e = r.unref($))
                                                                  ? void 0
                                                                  : e.name
                                                              )
                                                                ? (r.openBlock(),
                                                                  r.createBlock(
                                                                    r.resolveDynamicComponent(
                                                                      r.unref($)
                                                                        .name
                                                                    ),
                                                                    {
                                                                      key: 0,
                                                                      value:
                                                                        t.raw,
                                                                      fileName:
                                                                        t.name,
                                                                      url: t.url,
                                                                      type: t.type,
                                                                    },
                                                                    null,
                                                                    8,
                                                                    [
                                                                      'value',
                                                                      'fileName',
                                                                      'url',
                                                                      'type',
                                                                    ]
                                                                  ))
                                                                : t.url
                                                                  ? (r.openBlock(),
                                                                    r.createElementBlock(
                                                                      'a',
                                                                      r.mergeProps(
                                                                        {
                                                                          key: 1,
                                                                          href: t.url,
                                                                          target:
                                                                            '_blank',
                                                                          rel: 'noopener noreferrer',
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .name,
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          l
                                                                        ).name
                                                                      ),
                                                                      r.toDisplayString(
                                                                        t.name
                                                                      ),
                                                                      17,
                                                                      dt
                                                                    ))
                                                                  : (r.openBlock(),
                                                                    r.createElementBlock(
                                                                      'span',
                                                                      r.mergeProps(
                                                                        {
                                                                          key: 2,
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .name,
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          l
                                                                        ).name
                                                                      ),
                                                                      r.toDisplayString(
                                                                        t.name
                                                                      ),
                                                                      17
                                                                    )),
                                                            ]
                                                          }
                                                        ),
                                                      ],
                                                      16
                                                    )),
                                              ]
                                            }
                                          )
                                        ),
                                        128
                                      )),
                                    ],
                                    16
                                  ))
                                : r.createCommentVNode('', !0),
                              r.unref(f)
                                ? (r.openBlock(),
                                  r.createElementBlock(
                                    r.Fragment,
                                    { key: 1 },
                                    [
                                      r.renderSlot(
                                        e.$slots,
                                        'add',
                                        {
                                          triggerFileInput: r.unref(E),
                                          disabled: r.unref(g),
                                          text: r.unref(x),
                                        },
                                        () => {
                                          var e
                                          return [
                                            (
                                              null == (e = r.unref($))
                                                ? void 0
                                                : e.add
                                            )
                                              ? (r.openBlock(),
                                                r.createBlock(
                                                  r.resolveDynamicComponent(
                                                    r.unref($).add
                                                  ),
                                                  {
                                                    key: 0,
                                                    triggerFileInput:
                                                      r.unref(E),
                                                    disabled: r.unref(g),
                                                    text: r.unref(x),
                                                  },
                                                  null,
                                                  8,
                                                  [
                                                    'triggerFileInput',
                                                    'disabled',
                                                    'text',
                                                  ]
                                                ))
                                              : (r.openBlock(),
                                                r.createBlock(
                                                  a,
                                                  {
                                                    key: 1,
                                                    name: `${r.unref(k)}__button`,
                                                    text: r.unref(x),
                                                    disabled: r.unref(g),
                                                    onClick: r.unref(E),
                                                  },
                                                  null,
                                                  8,
                                                  [
                                                    'name',
                                                    'text',
                                                    'disabled',
                                                    'onClick',
                                                  ]
                                                )),
                                          ]
                                        }
                                      ),
                                      r.createElementVNode(
                                        'input',
                                        r.mergeProps(
                                          {
                                            type: 'file',
                                            name: r.unref(k),
                                            id: r.unref(m),
                                            class: 'sr-only',
                                            multiple: r.unref(c),
                                            accept: r.unref(d),
                                            capture: r.unref(p),
                                            'aria-labelledby':
                                              r.unref(y).labelledby,
                                            'aria-describedby':
                                              r.unref(y).describedby,
                                            'aria-invalid': r.unref(y).invalid,
                                            'aria-required':
                                              r.unref(y).required,
                                            'aria-busy': r.unref(y).busy,
                                          },
                                          r.unref(l).input,
                                          {
                                            ref: (e) => (h.value = e),
                                            onChange:
                                              t[0] ||
                                              (t[0] = (...e) =>
                                                r.unref(C) && r.unref(C)(...e)),
                                            onBlur:
                                              t[1] ||
                                              (t[1] = (...e) =>
                                                r.unref(O) && r.unref(O)(...e)),
                                            onFocus:
                                              t[2] ||
                                              (t[2] = (...e) =>
                                                r.unref(_) && r.unref(_)(...e)),
                                          }
                                        ),
                                        null,
                                        16,
                                        ct
                                      ),
                                    ],
                                    64
                                  ))
                                : r.createCommentVNode('', !0),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    [ft, mt] = c('vueform-grid')
  const vt = {
      type: 'grid',
      minWidth: 0,
      maxWidth: -1,
      align: 'left',
      valign: 'middle',
      rows: 2,
      cols: 2,
      disabled: !1,
      conditions: void 0,
    },
    gt = ve((e, t) => {
      const n = je(e, t, [nr, ar]),
        {
          container: a,
          available: o,
          visible: l,
          help: s,
          hint: i,
          path: u,
          helpId: d,
          hintId: c,
          errorId: p,
          id: f,
          disabled: v,
          children: g,
        } = n,
        y = m(),
        h = Ue(),
        { sanitize: b } = G(),
        k = r.toRef(() => y.nonce),
        B = r.ref(new Map()),
        w = r.toRef(() => e.align || 'left'),
        x = r.toRef(() => e.valign || 'middle'),
        {
          value: $,
          model: C,
          initialModel: S,
          payload: E,
          dataPath: _,
          nullValue: O,
          invalid: A,
          required: V,
          dirty: P,
          pending: D,
          debouncing: F,
          busy: j,
          validated: R,
          completed: T,
          success: M,
          empty: N,
          numeric: I,
          hoisted: L,
          errors: q,
          hasError: H,
          displayErrors: z,
          ownErrors: W,
          formErrors: U,
          messages: K,
          messageBag: Y,
          ruleMessages: Z,
          isContainer: X,
          update: J,
          reset: Q,
          clear: ee,
          validate: re,
          validateSelf: te,
          validateChildren: ne,
          unvalidate: ae,
          invalidate: oe,
          clean: le,
          clearErrors: se,
          clearMessages: ie,
          clearMessageBag: ue,
          filled: de,
          reinit: ce,
        } = wr({ props: e, deps: n, events: t }),
        { aria: pe } = Vr({
          props: e,
          deps: {
            help: s,
            hint: i,
            helpId: d,
            hintId: c,
            errorId: p,
            hasError: H,
            busy: j,
            required: V,
          },
        }),
        fe = r.computed(
          () =>
            e.grid ||
            (B.value.size
              ? [...B.value.values()].map((e) =>
                  Object.values(e).map((e) => ({
                    colspan: e[1][0],
                    rowspan: e[1][1],
                  }))
                )
              : [...Array(e.rows || 2)].map(() =>
                  [...Array(e.cols || 2)].map(() => null)
                ))
        ),
        me = r.computed(() => {
          let e = 0
          for (const r of fe.value)
            for (let t = 0; t < r.length; t++) {
              e < t + 1 && (e = t + 1)
              const n = r[t],
                a = (n && 'object' == typeof n && n.colspan) || 1
              t + a > e && (e = t + a)
            }
          return e
        }),
        ve = r.computed(() => {
          let e = 0
          for (let r = 0; r < fe.value.length; r++) {
            e < r + 1 && (e = r + 1)
            for (const t of fe.value[r]) {
              const n = (t && 'object' == typeof t && t.rowspan) || 1
              r + n > e && (e = r + n)
            }
          }
          return e
        }),
        ge = r.computed(() => {
          const e = []
          for (let r = 0; r < fe.value.length; r++) {
            const t = []
            for (let e = 0; e < fe.value[r].length; e++)
              t.push(xe(fe.value[r][e], r, e))
            e.push(t)
          }
          return e
        }),
        ye = r.computed(() => !!e.colHeaders),
        he = r.computed(() => !!e.rowHeaders),
        be = r.computed(() => {
          const e = []
          return (
            ((e, r) => {
              const t = []
              e.forEach((e, n) => {
                t[n] = t[n] || []
                let a = 0
                e.forEach((e, o) => {
                  for (; t[n][a];) a++
                  let l = null,
                    s = 1,
                    i = 1
                  Array.isArray(e) &&
                    ((l = void 0 === e[0] ? null : e[0]),
                    (s = e[1] || 1),
                    (i = e[2] || 1))
                  const u = n + i - 1,
                    d = a + s - 1
                  r({
                    cell: e,
                    field: l,
                    rowspan: i,
                    colspan: s,
                    rowIndex: n,
                    colIndex: o,
                    paddedColIndex: a,
                    rowStart: n,
                    colStart: a,
                    rowEnd: u,
                    colEnd: d,
                  })
                  for (let r = n; r <= u; r++) {
                    t[r] = t[r] || []
                    for (let e = a; e <= d; e++) t[r][e] = !0
                  }
                  a += s
                })
              })
            })(
              ge.value,
              ({
                field: r,
                colIndex: t,
                rowIndex: n,
                rowStart: a,
                colStart: o,
                rowEnd: l,
                colEnd: s,
              }) => {
                e.push({
                  ...(r || {}),
                  col: t,
                  row: n,
                  colStart: o,
                  rowStart: a,
                  colEnd: s,
                  rowEnd: l,
                  colHeader: ye.value && 0 === n,
                  rowHeader: he.value && 0 === t,
                  lastRow: l === ve.value - 1 || void 0,
                  lastCol: s === me.value - 1 || void 0,
                })
              }
            ),
            e
          )
        }),
        ke = r.computed(() => `vf-grid-${f.value}`),
        Be = r.computed(() => {
          var r
          const t = []
          for (let s = 0; s < Number(me.value); s++) {
            const n = null == (r = e.widths) ? void 0 : r[s],
              a = 0 === s && he.value ? 'min-content' : '1fr'
            t.push(
              'number' == typeof n || (null != n && /\d$/.test(n))
                ? `${n}px`
                : n || a
            )
          }
          const n =
              'number' == typeof e.minWidth ? `${e.minWidth}px` : e.minWidth,
            a =
              'number' == typeof e.maxWidth
                ? e.maxWidth > 0
                  ? `${e.maxWidth}px`
                  : void 0
                : e.maxWidth,
            o = ke.value,
            l = [
              `.${o}{grid-template-columns:${t.join(' ')};grid-template-rows:repeat(${ve.value},auto)${n ? `;min-width:${n}` : ''}${a ? `;max-width:${a}` : ''}}`,
            ]
          for (const e of be.value) {
            const {
              colspan: r,
              rowspan: t,
              colStart: n,
              rowStart: a,
              colEnd: s,
              rowEnd: i,
              row: u,
              col: d,
            } = e
            ;(r > 1 || t > 1) &&
              l.push(
                `.${o}>[data-row="${u}"][data-col="${d}"]{grid-area:${a + 1}/${n + 1}/${i + 2}/${s + 2}}`
              )
          }
          return l.join('')
        }),
        we = r.computed(
          () =>
            !((e.widths || []).length < (me.value || 0)) &&
            (e.widths || [])
              .slice(0, me.value)
              .every(
                (e) =>
                  'number' == typeof e ||
                  (e &&
                    [
                      'cm',
                      'mm',
                      'in',
                      'px',
                      'pt',
                      'pc',
                      'em',
                      'ex',
                      'ch',
                      'rem',
                      'vw',
                      'vh',
                      'vmin',
                      'vmax',
                    ].some((r) => e.endsWith(r))) ||
                  (e && /\d$/.test(e))
              )
        ),
        xe = (r, t, n) => {
          let a, o, l, s, i, u
          if (null === r || 'string' == typeof r)
            ((a = 'string' == typeof r ? b(r) : null),
              (o = 1),
              (l = 1),
              (s = null),
              (i = null),
              (u = {}))
          else {
            const {
              colspan: e,
              rowspan: t,
              align: n,
              valign: d,
              attrs: c,
              content: p,
              ...f
            } = r
            ;((o = e || 1),
              (l = t || 1),
              (s = n || null),
              (i = d || null),
              (u = c || {}),
              (a = 'type' in r ? f : p ? b(p) : null))
          }
          const d = {
            content: a,
            colspan: o,
            rowspan: l,
            align: s || e.align || 'left',
            valign: i || e.valign || 'baseline',
            attrs: u,
            row: t,
            col: n,
            slot: `cell_${t}_${n}`,
          }
          var c
          return (
            a &&
              'object' == typeof a &&
              ((d.component = `Vf${(function (e) {
                return String(e).charAt(0).toUpperCase() + String(e).slice(1)
              })(
                ((c = a.type),
                c
                  .replace(/[-_\s]+(.)?/g, (e, r) => (r ? r.toUpperCase() : ''))
                  .replace(/^(.)/, (e) => e.toLowerCase()))
              )}`),
              (d.name = a.name || $e(t, n)),
              (d.schema = a)),
            [d, d.colspan, d.rowspan, d.align]
          )
        },
        $e = (r, t) => `${e.name}_${r}_${t}`
      return (
        mr({
          type: 'grid',
          id: f,
          model: C,
          available: o,
          visible: l,
          disabled: v,
          path: u,
          dataPath: _,
          children: g,
          container: a,
        }),
        mt({
          cells: be,
          inlineGrid: B,
          colHeaders: ye,
          rowHeaders: he,
          align: w,
          valign: x,
          refreshInlineGrid: () => {
            ;(B.value.clear(),
              h.value &&
                h.value.querySelectorAll('[data-row-id]').forEach((e) => {
                  const r = []
                  for (const t of e.querySelectorAll('[data-col-id]'))
                    r.push([
                      Number(t.getAttribute('data-col-id')),
                      [
                        Number(t.getAttribute('data-colspan') || 1),
                        Number(t.getAttribute('data-rowspan') || 1),
                      ],
                    ])
                  B.value.set(Number(e.getAttribute('data-row-id')), r)
                }))
          },
        }),
        {
          ...n,
          ...t,
          aria: pe,
          cells: be,
          colHeaders: ye,
          rowHeaders: he,
          fitWidth: we,
          gridClass: ke,
          gridCss: Be,
          nonce: k,
          resolvedGrid: ge,
          grid: fe,
          value: $,
          model: C,
          initialModel: S,
          payload: E,
          dataPath: _,
          nullValue: O,
          invalid: A,
          required: V,
          dirty: P,
          pending: D,
          debouncing: F,
          busy: j,
          validated: R,
          completed: T,
          success: M,
          empty: N,
          numeric: I,
          hoisted: L,
          errors: q,
          hasError: H,
          displayErrors: z,
          ownErrors: W,
          formErrors: U,
          messages: K,
          messageBag: Y,
          ruleMessages: Z,
          isContainer: X,
          update: J,
          reset: Q,
          clear: ee,
          validate: re,
          validateSelf: te,
          validateChildren: ne,
          unvalidate: ae,
          invalidate: oe,
          clean: le,
          clearErrors: se,
          clearMessages: ie,
          clearMessageBag: ue,
          filled: de,
          reinit: ce,
        }
      )
    }),
    yt = [
      'data-col',
      'data-row',
      'data-col-start',
      'data-col-end',
      'data-row-start',
      'data-row-end',
      'data-last-col',
      'data-last-row',
    ],
    ht = r.defineComponent({
      name: 'VfGrid',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfGrid',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        grid: {},
        modelValue: {},
        nested: { type: Boolean },
        cols: {},
        rows: {},
        align: {},
        valign: {},
        widths: {},
        minWidth: {},
        maxWidth: {},
        scrollable: { type: Boolean },
        colHeaders: { type: Boolean },
        rowHeaders: { type: Boolean },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        tabular: { type: Boolean },
        wrapColHeaders: { type: Boolean },
        wrapRowHeaders: { type: Boolean },
        aria: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        heading: {},
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
      },
      emits: [
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, vt),
          l = be(o),
          s = gt(o, a),
          i = he('VfGrid', () => ({
            root: {
              'vf-grid': !0,
              'vf-tabular': !!o.tabular,
              'vf-wrap-col-headers': !!o.wrapColHeaders,
              'vf-wrap-row-headers': !!o.wrapRowHeaders,
            },
            wrapper: { 'vf-grid-wrapper': !0, 'vf-scrollable': !!o.scrollable },
            grid: {
              'vf-grid-grid': !0,
              'vf-fit': !!s.fitWidth.value,
              [s.gridClass.value]: !0,
            },
            cell: ({ align: e, valign: r, colHeader: t, rowHeader: n }) => ({
              'vf-grid-cell': !0,
              [`vf-${e}`]: !0,
              [`vf-${r}`]: !0,
              'vf-grid-col-header': !!t,
              'vf-grid-row-header': !!n,
            }),
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { tabular: d } = _e(o, ['tabular']),
          {
            template: c,
            gridClass: p,
            gridCss: f,
            nonce: m,
            cells: v,
            slots: g,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.renderSlot(
              e.$slots,
              'template',
              { context: r.unref(u) },
              () => [
                r.unref(c)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(c)),
                      { key: 0, context: r.unref(u) },
                      null,
                      8,
                      ['context']
                    ))
                  : (r.openBlock(),
                    r.createBlock(
                      n,
                      { key: 1 },
                      {
                        default: r.withCtx(() => [
                          r.createElementVNode(
                            'div',
                            { class: r.normalizeClass(r.unref(i).wrapper) },
                            [
                              r.createElementVNode(
                                'div',
                                r.mergeProps(
                                  { class: r.unref(i).grid },
                                  r.unref(l).grid
                                ),
                                [
                                  r.renderSlot(
                                    e.$slots,
                                    'default',
                                    { cells: r.unref(v) },
                                    () => {
                                      var t
                                      return [
                                        (
                                          null == (t = r.unref(g))
                                            ? void 0
                                            : t.default
                                        )
                                          ? (r.openBlock(),
                                            r.createBlock(
                                              r.resolveDynamicComponent(
                                                r.unref(g).default
                                              ),
                                              { key: 0, cells: r.unref(v) },
                                              null,
                                              8,
                                              ['cells']
                                            ))
                                          : (r.openBlock(!0),
                                            r.createElementBlock(
                                              r.Fragment,
                                              { key: 1 },
                                              r.renderList(r.unref(v), (t) => {
                                                var n, a
                                                return (
                                                  r.openBlock(),
                                                  r.createElementBlock(
                                                    'div',
                                                    r.mergeProps(
                                                      {
                                                        class: r
                                                          .unref(i)
                                                          .cell(t),
                                                        'data-col': t.col,
                                                        'data-row': t.row,
                                                        'data-col-start':
                                                          t.colStart,
                                                        'data-col-end':
                                                          t.colEnd,
                                                        'data-row-start':
                                                          t.rowStart,
                                                        'data-row-end':
                                                          t.rowEnd,
                                                        'data-last-col':
                                                          t.lastCol,
                                                        'data-last-row':
                                                          t.lastRow,
                                                      },
                                                      { ref_for: !0 },
                                                      {
                                                        ...t.attrs,
                                                        ...(null ==
                                                        (a = (n = r.unref(l))
                                                          .cell)
                                                          ? void 0
                                                          : a.call(n, t)),
                                                      }
                                                    ),
                                                    [
                                                      r.renderSlot(
                                                        e.$slots,
                                                        'cell',
                                                        { cell: t },
                                                        () => {
                                                          var e
                                                          return [
                                                            (
                                                              null ==
                                                              (e = r.unref(g))
                                                                ? void 0
                                                                : e.cell
                                                            )
                                                              ? (r.openBlock(),
                                                                r.createBlock(
                                                                  r.resolveDynamicComponent(
                                                                    r.unref(g)
                                                                      .cell
                                                                  ),
                                                                  {
                                                                    key: 0,
                                                                    cell: t,
                                                                  },
                                                                  null,
                                                                  8,
                                                                  ['cell']
                                                                ))
                                                              : t.schema
                                                                ? (r.openBlock(),
                                                                  r.createBlock(
                                                                    r.resolveDynamicComponent(
                                                                      t.component
                                                                    ),
                                                                    r.mergeProps(
                                                                      {
                                                                        key: t.name,
                                                                      },
                                                                      {
                                                                        ref_for:
                                                                          !0,
                                                                      },
                                                                      t.schema,
                                                                      {
                                                                        inline:
                                                                          r.unref(
                                                                            d
                                                                          ),
                                                                      }
                                                                    ),
                                                                    null,
                                                                    16,
                                                                    ['inline']
                                                                  ))
                                                                : t.content
                                                                  ? (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        () =>
                                                                          t.content
                                                                      ),
                                                                      { key: 2 }
                                                                    ))
                                                                  : r.createCommentVNode(
                                                                      '',
                                                                      !0
                                                                    ),
                                                          ]
                                                        }
                                                      ),
                                                    ],
                                                    16,
                                                    yt
                                                  )
                                                )
                                              }),
                                              256
                                            )),
                                      ]
                                    }
                                  ),
                                ],
                                16
                              ),
                            ],
                            2
                          ),
                          (r.openBlock(),
                          r.createBlock(
                            r.resolveDynamicComponent('style'),
                            { '^nonce': r.unref(m) },
                            {
                              default: r.withCtx(() => [
                                r.createTextVNode(
                                  r.toDisplayString(r.unref(f)),
                                  1
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ['^nonce']
                          )),
                        ]),
                        _: 3,
                      }
                    )),
              ]
            )
          }
        )
      },
    }),
    bt = {
      type: 'hidden',
      submit: !0,
      bail: !0,
      maxErrors: 1,
      meta: !1,
      default: null,
      conditions: void 0,
      expressions: void 0,
      showRequired: void 0,
    },
    kt = ve((e, t) => {
      const n = je(e, t, [nr]),
        { container: a, children: o } = n,
        l = r.ref(),
        {
          value: s,
          model: i,
          initialModel: u,
          payload: d,
          dataPath: c,
          nullValue: p,
          invalid: f,
          required: m,
          dirty: v,
          pending: g,
          debouncing: y,
          busy: h,
          validated: b,
          completed: k,
          success: B,
          empty: w,
          numeric: x,
          hoisted: $,
          errors: C,
          hasError: S,
          displayErrors: E,
          ownErrors: _,
          formErrors: O,
          messages: A,
          messageBag: V,
          ruleMessages: P,
          update: D,
          reset: F,
          clear: j,
          validate: R,
          validateSelf: T,
          validateChildren: M,
          unvalidate: N,
          invalidate: I,
          clean: L,
          clearErrors: q,
          clearMessages: H,
          clearMessageBag: z,
          filled: W,
          handleInput: U,
          reinit: G,
        } = wr({ props: e, deps: n, events: t }),
        K = r.computed(() => {
          const e = s.value
          return 'string' == typeof e || 'number' == typeof e ? e : void 0
        })
      return (
        mr({ container: a, children: o }),
        {
          ...n,
          ...t,
          input: l,
          inputValue: K,
          value: s,
          model: i,
          initialModel: u,
          payload: d,
          dataPath: c,
          nullValue: p,
          invalid: f,
          required: m,
          dirty: v,
          pending: g,
          debouncing: y,
          busy: h,
          validated: b,
          completed: k,
          success: B,
          empty: w,
          numeric: x,
          hoisted: $,
          errors: C,
          hasError: S,
          displayErrors: E,
          ownErrors: _,
          formErrors: O,
          messages: A,
          messageBag: V,
          ruleMessages: P,
          update: D,
          reset: F,
          clear: j,
          validate: R,
          validateSelf: T,
          validateChildren: M,
          unvalidate: N,
          invalidate: I,
          clean: L,
          clearErrors: q,
          clearMessages: H,
          clearMessageBag: z,
          filled: W,
          handleInput: U,
          reinit: G,
        }
      )
    }),
    Bt = ['name', 'id', 'value'],
    wt = r.defineComponent({
      name: 'VfHidden',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfHidden',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        default: {},
        meta: { type: Boolean },
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hoist: { type: Boolean },
      },
      emits: [
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, bt),
          l = kt(o, a),
          s = Ee(l, { props: o }),
          { meta: i } = _e(o, ['meta']),
          { viewLoaded: u, template: d, name: c, id: p, inputValue: f } = l
        return (
          t({ props: o, ...l }),
          (e, t) =>
            r.unref(u)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(s) },
                  () => [
                    r.unref(d)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(d)),
                          { key: 0, context: r.unref(s) },
                          null,
                          8,
                          ['context']
                        ))
                      : r.unref(i)
                        ? r.createCommentVNode('', !0)
                        : (r.openBlock(),
                          r.createElementBlock(
                            'input',
                            {
                              key: 1,
                              type: 'hidden',
                              name: r.unref(c),
                              id: r.unref(p),
                              value: r.unref(f),
                            },
                            null,
                            8,
                            Bt
                          )),
                  ]
                )
              : r.createCommentVNode('', !0)
        )
      },
    }),
    xt = {},
    $t = ve((e, { fire: r }) => {
      const { template: t, slots: n } = fe(e)
      return { template: t, slots: n, handleSelect: (e) => r('select', e) }
    }),
    Ct = ['aria-selected', 'aria-current', 'aria-invalid', 'onClick'],
    St = r.defineComponent({
      name: 'VfLanguages',
      type: 'form-component',
      __name: 'VfLanguages',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        language: {},
        languages: {},
        invalidLanguages: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'select',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, xt),
          l = be(o),
          s = $t(o, a),
          i = he('VfLanguages', () => ({
            root: 'vf-languages',
            list: 'vf-languages-wrapper',
            wrapper: (e, r) => [
              'vf-language-wrapper',
              { 'vf-selected': e, 'vf-invalid': r },
            ],
            language: 'vf-language',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            languages: d,
            language: c,
            invalidLanguages: p,
          } = _e(o, ['languages', 'language', 'invalidLanguages']),
          { template: f, slots: m, handleSelect: v } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(f)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(f)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'div',
                    r.mergeProps(
                      { key: 1, class: r.unref(i).root },
                      r.unref(l).root
                    ),
                    [
                      r.createElementVNode(
                        'ul',
                        r.mergeProps(
                          { class: r.unref(i).list, role: 'tablist' },
                          r.unref(l).list
                        ),
                        [
                          (r.openBlock(!0),
                          r.createElementBlock(
                            r.Fragment,
                            null,
                            r.renderList(r.unref(d), (t, n) => {
                              var a, o, s, u, f
                              return (
                                r.openBlock(),
                                r.createElementBlock(
                                  'li',
                                  r.mergeProps(
                                    {
                                      class: r
                                        .unref(i)
                                        .wrapper(
                                          r.unref(c) === n,
                                          !!(null == (a = r.unref(p))
                                            ? void 0
                                            : a.has(n))
                                        ),
                                      role: 'none',
                                    },
                                    { ref_for: !0 },
                                    null == (u = (s = r.unref(l)).wrapper)
                                      ? void 0
                                      : u.call(
                                          s,
                                          r.unref(c) === n,
                                          !!(null == (o = r.unref(p))
                                            ? void 0
                                            : o.has(n))
                                        )
                                  ),
                                  [
                                    r.createElementVNode(
                                      'button',
                                      r.mergeProps(
                                        {
                                          type: 'button',
                                          class: r.unref(i).language,
                                          role: 'tab',
                                          'aria-selected': r.unref(c) === n,
                                          'aria-current': r.unref(c) === n,
                                          'aria-invalid':
                                            (null == (f = r.unref(p))
                                              ? void 0
                                              : f.has(n)) || void 0,
                                        },
                                        { ref_for: !0 },
                                        r.unref(l).language,
                                        { onClick: (e) => r.unref(v)(n) }
                                      ),
                                      [
                                        r.renderSlot(
                                          e.$slots,
                                          'default',
                                          r.mergeProps(
                                            { ref_for: !0 },
                                            {
                                              language: r.unref(c),
                                              languages: r.unref(d),
                                              value: n,
                                              label: t,
                                              parts: r.unref(l),
                                              classes: r.unref(i),
                                            }
                                          ),
                                          () => {
                                            var e
                                            return [
                                              (
                                                null == (e = r.unref(m))
                                                  ? void 0
                                                  : e.default
                                              )
                                                ? (r.openBlock(),
                                                  r.createBlock(
                                                    r.resolveDynamicComponent(
                                                      r.unref(m).default
                                                    ),
                                                    r.mergeProps(
                                                      { key: 0, ref_for: !0 },
                                                      {
                                                        language: r.unref(c),
                                                        languages: r.unref(d),
                                                        value: n,
                                                        label: t,
                                                        parts: r.unref(l),
                                                        classes: r.unref(i),
                                                      }
                                                    ),
                                                    null,
                                                    16
                                                  ))
                                                : (r.openBlock(),
                                                  r.createElementBlock(
                                                    r.Fragment,
                                                    { key: 1 },
                                                    [
                                                      r.createTextVNode(
                                                        r.toDisplayString(t),
                                                        1
                                                      ),
                                                    ],
                                                    64
                                                  )),
                                            ]
                                          }
                                        ),
                                      ],
                                      16,
                                      Ct
                                    ),
                                  ],
                                  16
                                )
                              )
                            }),
                            256
                          )),
                        ],
                        16
                      ),
                    ],
                    16
                  )),
            ])
        )
      },
    })
  function Et({ props: e, deps: t }) {
    const {
        items: n,
        sort: a,
        dragIndex: o,
        dropIndex: l,
        disabled: s,
        sortable: i,
      } = t,
      u = r.ref()
    let d = {}
    const c = r.computed(() => !(i && !i.value) && !s.value && !!e.sort),
      p = r.computed(() => {
        var e
        return null != l.value
          ? null == (e = n.value[l.value])
            ? void 0
            : e.id
          : void 0
      }),
      f = (e) => {
        const { pageX: r, pageY: t } = e,
          { x: n, y: a, width: o, height: s } = d
        if (void 0 === n || void 0 === a || void 0 === o || void 0 === s) return
        ;(r >= n && r <= n + o && t >= a && t <= a + s) || (l.value = void 0)
      }
    return {
      list: u,
      canSort: c,
      dropTarget: p,
      handleDragStart: (e, r) => {
        ;((e.dataTransfer.effectAllowed = 'move'),
          (o.value = r),
          u.value &&
            ((d = u.value.getBoundingClientRect()),
            document.addEventListener('dragover', f)))
      },
      handleDragEnter: (e, r) => {
        l.value = r
      },
      handleDrop: (e) => {
        void 0 !== o.value && void 0 !== l.value && a(o.value, l.value)
      },
      handleDragEnd: () => {
        ;((o.value = void 0),
          (l.value = void 0),
          (d = {}),
          document.removeEventListener('dragover', f))
      },
      handleWrapperDragOver: (e) => e.preventDefault(),
    }
  }
  const _t = {
      type: 'list',
      initial: 1,
      flat: !1,
      add: !0,
      remove: !0,
      sort: !1,
      disabled: !1,
      submit: !0,
      bail: !0,
      maxErrors: 1,
      conditions: void 0,
      showRequired: void 0,
    },
    Ot = ve((e, t) => {
      const n = je(e, t, [nr, ar]),
        {
          container: a,
          path: o,
          available: l,
          visible: s,
          help: i,
          hint: u,
          helpId: d,
          hintId: c,
          errorId: p,
          id: f,
          disabled: m,
          children: v,
        } = n,
        g = te(),
        y = Te(),
        h = r.ref(!0),
        b = r.toRef(() => Number(e.initial ?? 0)),
        {
          value: k,
          model: B,
          initialModel: x,
          payload: $,
          dataPath: C,
          nullValue: S,
          invalid: E,
          required: _,
          dirty: O,
          pending: A,
          debouncing: V,
          busy: P,
          validated: D,
          completed: F,
          success: j,
          empty: R,
          numeric: T,
          hoisted: M,
          errors: N,
          hasError: I,
          displayErrors: L,
          ownErrors: q,
          formErrors: H,
          messages: z,
          messageBag: W,
          ruleMessages: U,
          items: G,
          dragIndex: K,
          dropIndex: Y,
          isContainer: Z,
          update: X,
          reset: J,
          clear: Q,
          validate: ee,
          validateSelf: re,
          validateChildren: ne,
          unvalidate: ae,
          invalidate: oe,
          clean: le,
          clearErrors: se,
          clearMessages: ie,
          clearMessageBag: ue,
          add: de,
          remove: ce,
          sort: pe,
          reinit: fe,
        } = wr({ props: e, deps: n, events: t, items: b }),
        { aria: me } = Vr({
          props: {},
          deps: {
            help: i,
            hint: u,
            helpId: d,
            hintId: c,
            errorId: p,
            hasError: I,
            busy: P,
            required: _,
          },
        }),
        ve = y(
          'list-add',
          r.toRef(() => e.addLabel),
          g
        ),
        ge = y(
          'list-remove',
          r.toRef(() => e.removeLabel),
          g
        ),
        ye = y(
          'list-placeholder',
          r.toRef(() => e.placeholder),
          g
        ),
        he = r.computed(() => `${f.value}__placeholder`),
        be = r.computed(
          () =>
            !m.value &&
            !1 !== e.add &&
            !(void 0 !== e.max && G.value.length >= e.max)
        ),
        ke = r.computed(
          () =>
            !m.value &&
            !1 !== e.remove &&
            !(void 0 !== e.min && G.value.length <= e.min)
        ),
        {
          list: Be,
          canSort: we,
          dropTarget: xe,
          handleDragStart: $e,
          handleDragEnter: Ce,
          handleDrop: Se,
          handleDragEnd: Ee,
          handleWrapperDragOver: _e,
        } = Et({
          props: e,
          deps: { items: G, sort: pe, dragIndex: K, dropIndex: Y, disabled: m },
        }),
        Oe = r.computed(() => {
          if (!e.schema) return {}
          if (e.flat) {
            const r = Array.isArray(e.schema)
              ? e.schema
              : Object.values(e.schema)
            if (1 !== r.length)
              return (
                console.warn(
                  `[Vueform warn]: \`flat\` requires a single element in the schema at \`${o.value}\``
                ),
                {
                  type: 'group',
                  nested: !0,
                  wrap: e.wrap,
                  innerWrap: e.innerWrap,
                  schema: e.schema,
                }
              )
            const t = r[0]
            return 'group' === t.type
              ? { ...t, nested: !0, wrap: e.wrap, innerWrap: e.innerWrap }
              : t
          }
          return {
            type: 'group',
            nested: !0,
            wrap: e.wrap,
            innerWrap: e.innerWrap,
            schema: e.schema,
          }
        }),
        Ae = r.computed(() => {
          if (Oe.value && Object.keys(Oe.value).length)
            return Oe.value.type
              ? `Vf${w(Oe.value.type)}`
              : (console.warn(
                  `[Vueform warn]: \`type\` is not defined for prototype at \`${o.value}\``
                ),
                'div')
        })
      return (
        mr({
          type: 'list',
          id: f,
          model: B,
          available: l,
          visible: s,
          disabled: m,
          dataPath: C,
          path: o,
          children: v,
          container: a,
        }),
        {
          ...n,
          ...t,
          aria: me,
          addLabel: ve,
          removeLabel: ge,
          placeholder: ye,
          placeholderId: he,
          canAdd: be,
          canRemove: ke,
          canSort: we,
          isArrayType: h,
          list: Be,
          prototype: Oe,
          prototypeComponent: Ae,
          dropTarget: xe,
          value: k,
          model: B,
          initialModel: x,
          payload: $,
          dataPath: C,
          nullValue: S,
          invalid: E,
          required: _,
          dirty: O,
          pending: A,
          debouncing: V,
          busy: P,
          validated: D,
          completed: F,
          success: j,
          empty: R,
          numeric: T,
          hoisted: M,
          errors: N,
          hasError: I,
          displayErrors: L,
          ownErrors: q,
          formErrors: H,
          messages: z,
          messageBag: W,
          ruleMessages: U,
          items: G,
          dragIndex: K,
          dropIndex: Y,
          isContainer: Z,
          update: X,
          reset: J,
          clear: Q,
          validate: ee,
          validateSelf: re,
          validateChildren: ne,
          unvalidate: ae,
          invalidate: oe,
          clean: le,
          clearErrors: se,
          clearMessages: ie,
          clearMessageBag: ue,
          add: de,
          remove: ce,
          sort: pe,
          handleAdd: () => de(),
          handleRemove: (e) => ce(e),
          handleDragStart: $e,
          handleDragEnter: Ce,
          handleDrop: Se,
          handleDragEnd: Ee,
          handleWrapperDragOver: _e,
          filled: (e) =>
            Array.isArray(e) && (null == e ? void 0 : e.length) > 0,
          reinit: fe,
        }
      )
    }),
    At = ['id'],
    Vt = ['onDragenter'],
    Pt = ['aria-label', 'onDragstart'],
    Dt = ['aria-label', 'onClick'],
    Ft = r.defineComponent({
      name: 'VfList',
      element: !0,
      heritAttrs: !1,
      __name: 'VfList',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        initial: {},
        schema: {},
        flat: { type: Boolean },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        validateOn: {},
        add: { type: Boolean },
        remove: { type: Boolean },
        min: {},
        max: {},
        sort: { type: Boolean },
        addLabel: { type: [String, Object, Function] },
        removeLabel: { type: [String, Object, Function] },
        placeholder: { type: [String, Object, Function] },
        wrap: { type: Boolean },
        innerWrap: { type: Boolean },
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        heading: {},
      },
      emits: [
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, _t),
          l = be(o),
          s = Ot(o, a),
          i = he('VfList', () => ({
            container: 'vf-list',
            items: 'vf-list-items',
            item: (e, r) => ({
              'vf-list-item': !0,
              'vf-wrapped': o.wrap || o.innerWrap,
              'vf-dragging': e,
              'vf-drop-target': r,
            }),
            element: 'vf-list-element',
            sort: { 'vf-list-sort': !0, 'vf-wrapped': o.wrap || o.innerWrap },
            remove: {
              'vf-list-remove': !0,
              'vf-wrapped': o.wrap || o.innerWrap,
              'vf-icon': !s.removeLabel.value || o.wrap || o.innerWrap,
            },
            placeholder: 'vf-list-placeholder',
            add: { 'vf-list-add': !0, 'vf-btn-icon-add': !s.addLabel.value },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { t: d, tags: c } = W(),
          { wrap: p } = _e(o, ['wrap']),
          {
            template: f,
            items: m,
            dragIndex: v,
            dropTarget: g,
            prototypeComponent: y,
            prototype: h,
            addLabel: b,
            removeLabel: k,
            placeholder: B,
            placeholderId: w,
            canAdd: x,
            canRemove: $,
            canSort: C,
            slots: S,
            handleRemove: E,
            handleAdd: _,
            handleDragEnter: O,
            handleDragStart: A,
            handleDragEnd: V,
            handleDrop: P,
            handleWrapperDragOver: D,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfBtn'),
              a = r.resolveComponent('VfLayout')
            return r.renderSlot(
              e.$slots,
              'template',
              { context: r.unref(u) },
              () => [
                r.unref(f)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(f)),
                      { key: 0, context: r.unref(u) },
                      null,
                      8,
                      ['context']
                    ))
                  : (r.openBlock(),
                    r.createBlock(
                      a,
                      { key: 1 },
                      {
                        default: r.withCtx(() => [
                          0 === r.unref(m).length
                            ? r.renderSlot(
                                e.$slots,
                                'placeholder',
                                r.mergeProps(
                                  { key: 0, class: r.unref(i).placeholder },
                                  r.unref(l).placeholder
                                ),
                                () => {
                                  var e
                                  return [
                                    (
                                      null == (e = r.unref(S))
                                        ? void 0
                                        : e.placeholder
                                    )
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(S).placeholder
                                          ),
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              class: r.unref(i).placeholder,
                                            },
                                            r.unref(l).placeholder
                                          ),
                                          null,
                                          16,
                                          ['class']
                                        ))
                                      : r.unref(B)
                                        ? (r.openBlock(),
                                          r.createElementBlock(
                                            'div',
                                            r.mergeProps(
                                              {
                                                key: 1,
                                                id: r.unref(w),
                                                class: r.unref(i).placeholder,
                                                role: 'status',
                                              },
                                              r.unref(l).placeholder
                                            ),
                                            r.toDisplayString(r.unref(B)),
                                            17,
                                            At
                                          ))
                                        : r.createCommentVNode('', !0),
                                  ]
                                }
                              )
                            : (r.openBlock(),
                              r.createElementBlock(
                                'div',
                                r.mergeProps(
                                  {
                                    key: 1,
                                    ref: 'list',
                                    class: r.unref(i).items,
                                  },
                                  r.unref(l).items,
                                  {
                                    onDragover:
                                      t[1] ||
                                      (t[1] = (...e) =>
                                        r.unref(D) && r.unref(D)(...e)),
                                    onDrop:
                                      t[2] ||
                                      (t[2] = (...e) =>
                                        r.unref(P) && r.unref(P)(...e)),
                                  }
                                ),
                                [
                                  (r.openBlock(!0),
                                  r.createElementBlock(
                                    r.Fragment,
                                    null,
                                    r.renderList(
                                      r.unref(m),
                                      ({ id: a, index: o }, s) => {
                                        var u, c
                                        return r.renderSlot(
                                          e.$slots,
                                          'item',
                                          r.mergeProps(
                                            {
                                              key: a,
                                              index: o,
                                              beingDragged: r.unref(v) === o,
                                              isDropTarget: r.unref(g) === a,
                                              handleDragEnter: (e) =>
                                                r.unref(O)(e, s),
                                              handleDragStart: (e) =>
                                                r.unref(A)(e, o),
                                              handleDragEnd: r.unref(V),
                                              handleRemove: () => r.unref(E)(o),
                                              class: r
                                                .unref(i)
                                                .item(
                                                  r.unref(v) === o,
                                                  r.unref(g) === a
                                                ),
                                            },
                                            { ref_for: !0 },
                                            null == (c = (u = r.unref(l)).item)
                                              ? void 0
                                              : c.call(
                                                  u,
                                                  r.unref(v) === o,
                                                  r.unref(g) === a
                                                )
                                          ),
                                          () => {
                                            var u, c, f, m, b
                                            return [
                                              (
                                                null == (u = r.unref(S))
                                                  ? void 0
                                                  : u.item
                                              )
                                                ? (r.openBlock(),
                                                  r.createBlock(
                                                    r.resolveDynamicComponent(
                                                      r.unref(S).item
                                                    ),
                                                    r.mergeProps(
                                                      {
                                                        key: 0,
                                                        index: o,
                                                        'being-dragged':
                                                          r.unref(v) === o,
                                                        'is-drop-target':
                                                          r.unref(g) === a,
                                                        'handle-drag-enter': (
                                                          e
                                                        ) => r.unref(O)(e, s),
                                                        'handle-drag-start': (
                                                          e
                                                        ) => r.unref(A)(e, o),
                                                        'handle-drag-end':
                                                          r.unref(V),
                                                        'handle-remove': () =>
                                                          r.unref(E)(o),
                                                        class: r
                                                          .unref(i)
                                                          .item(
                                                            r.unref(v) === o,
                                                            r.unref(g) === a
                                                          ),
                                                      },
                                                      { ref_for: !0 },
                                                      null ==
                                                        (f = (c = r.unref(l))
                                                          .item)
                                                        ? void 0
                                                        : f.call(
                                                            c,
                                                            r.unref(v) === o,
                                                            r.unref(g) === a
                                                          )
                                                    ),
                                                    null,
                                                    16,
                                                    [
                                                      'index',
                                                      'being-dragged',
                                                      'is-drop-target',
                                                      'handle-drag-enter',
                                                      'handle-drag-start',
                                                      'handle-drag-end',
                                                      'handle-remove',
                                                      'class',
                                                    ]
                                                  ))
                                                : (r.openBlock(),
                                                  r.createElementBlock(
                                                    'div',
                                                    r.mergeProps(
                                                      {
                                                        key: 1,
                                                        class: r
                                                          .unref(i)
                                                          .item(
                                                            r.unref(v) === o,
                                                            r.unref(g) === a
                                                          ),
                                                      },
                                                      { ref_for: !0 },
                                                      null ==
                                                        (b = (m = r.unref(l))
                                                          .item)
                                                        ? void 0
                                                        : b.call(
                                                            m,
                                                            r.unref(v) === o,
                                                            r.unref(g) === a
                                                          ),
                                                      {
                                                        onDragenter: (e) =>
                                                          r.unref(O)(e, s),
                                                      }
                                                    ),
                                                    [
                                                      r.unref(C)
                                                        ? r.renderSlot(
                                                            e.$slots,
                                                            'sort',
                                                            r.mergeProps(
                                                              {
                                                                key: 0,
                                                                handleDragStart:
                                                                  (e) =>
                                                                    r.unref(A)(
                                                                      e,
                                                                      o
                                                                    ),
                                                                handleDragEnd:
                                                                  r.unref(V),
                                                                class:
                                                                  r.unref(i)
                                                                    .sort,
                                                              },
                                                              { ref_for: !0 },
                                                              r.unref(l).sort
                                                            ),
                                                            () => {
                                                              var e
                                                              return [
                                                                (
                                                                  null ==
                                                                  (e =
                                                                    r.unref(S))
                                                                    ? void 0
                                                                    : e.sort
                                                                )
                                                                  ? (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          S
                                                                        ).sort
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          key: 0,
                                                                          'handle-drag-start':
                                                                            (
                                                                              e
                                                                            ) =>
                                                                              r.unref(
                                                                                A
                                                                              )(
                                                                                e,
                                                                                o
                                                                              ),
                                                                          'handle-drag-end':
                                                                            r.unref(
                                                                              V
                                                                            ),
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .sort,
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          l
                                                                        ).sort
                                                                      ),
                                                                      null,
                                                                      16,
                                                                      [
                                                                        'handle-drag-start',
                                                                        'handle-drag-end',
                                                                        'class',
                                                                      ]
                                                                    ))
                                                                  : (r.openBlock(),
                                                                    r.createElementBlock(
                                                                      'button',
                                                                      r.mergeProps(
                                                                        {
                                                                          key: 1,
                                                                          type: 'button',
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .sort,
                                                                          'aria-label':
                                                                            r.unref(
                                                                              d
                                                                            )(
                                                                              'sr_list_sort',
                                                                              {
                                                                                index:
                                                                                  o +
                                                                                  1,
                                                                              }
                                                                            ),
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          l
                                                                        ).sort,
                                                                        {
                                                                          draggable:
                                                                            !0,
                                                                          onDragstart:
                                                                            (
                                                                              e
                                                                            ) =>
                                                                              r.unref(
                                                                                A
                                                                              )(
                                                                                e,
                                                                                o
                                                                              ),
                                                                          onDragend:
                                                                            t[0] ||
                                                                            (t[0] =
                                                                              (
                                                                                ...e
                                                                              ) =>
                                                                                r.unref(
                                                                                  V
                                                                                ) &&
                                                                                r.unref(
                                                                                  V
                                                                                )(
                                                                                  ...e
                                                                                )),
                                                                        }
                                                                      ),
                                                                      null,
                                                                      16,
                                                                      Pt
                                                                    )),
                                                              ]
                                                            }
                                                          )
                                                        : r.createCommentVNode(
                                                            '',
                                                            !0
                                                          ),
                                                      r.createElementVNode(
                                                        'div',
                                                        r.mergeProps(
                                                          {
                                                            class:
                                                              r.unref(i)
                                                                .element,
                                                          },
                                                          { ref_for: !0 },
                                                          r.unref(l).element
                                                        ),
                                                        [
                                                          r.renderSlot(
                                                            e.$slots,
                                                            'default',
                                                            {
                                                              component:
                                                                r.unref(y),
                                                              props: r.unref(h),
                                                              index: o,
                                                            },
                                                            () => {
                                                              var e
                                                              return [
                                                                (
                                                                  null ==
                                                                  (e =
                                                                    r.unref(S))
                                                                    ? void 0
                                                                    : e.default
                                                                )
                                                                  ? (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          S
                                                                        )
                                                                          .default
                                                                      ),
                                                                      {
                                                                        key: 0,
                                                                        component:
                                                                          r.unref(
                                                                            y
                                                                          ),
                                                                        props:
                                                                          r.unref(
                                                                            h
                                                                          ),
                                                                        index:
                                                                          o,
                                                                      },
                                                                      null,
                                                                      8,
                                                                      [
                                                                        'component',
                                                                        'props',
                                                                        'index',
                                                                      ]
                                                                    ))
                                                                  : (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          y
                                                                        )
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          key: 1,
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          h
                                                                        ),
                                                                        {
                                                                          name: o,
                                                                        }
                                                                      ),
                                                                      null,
                                                                      16,
                                                                      ['name']
                                                                    )),
                                                              ]
                                                            }
                                                          ),
                                                        ],
                                                        16
                                                      ),
                                                      r.unref($)
                                                        ? r.renderSlot(
                                                            e.$slots,
                                                            'remove',
                                                            r.mergeProps(
                                                              {
                                                                key: 1,
                                                                handleRemove:
                                                                  () =>
                                                                    r.unref(E)(
                                                                      o
                                                                    ),
                                                                class:
                                                                  r.unref(i)
                                                                    .remove,
                                                              },
                                                              { ref_for: !0 },
                                                              r.unref(l).remove
                                                            ),
                                                            () => {
                                                              var e
                                                              return [
                                                                (
                                                                  null ==
                                                                  (e =
                                                                    r.unref(S))
                                                                    ? void 0
                                                                    : e.remove
                                                                )
                                                                  ? (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          S
                                                                        ).remove
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          key: 0,
                                                                          'handle-remove':
                                                                            () =>
                                                                              r.unref(
                                                                                E
                                                                              )(
                                                                                o
                                                                              ),
                                                                          class:
                                                                            r.unref(
                                                                              i
                                                                            )
                                                                              .remove,
                                                                        },
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        r.unref(
                                                                          l
                                                                        ).remove
                                                                      ),
                                                                      null,
                                                                      16,
                                                                      [
                                                                        'handle-remove',
                                                                        'class',
                                                                      ]
                                                                    ))
                                                                  : !r.unref(
                                                                        k
                                                                      ) ||
                                                                      r.unref(p)
                                                                    ? (r.openBlock(),
                                                                      r.createElementBlock(
                                                                        'button',
                                                                        r.mergeProps(
                                                                          {
                                                                            key: 1,
                                                                            type: 'button',
                                                                            class:
                                                                              r.unref(
                                                                                i
                                                                              )
                                                                                .remove,
                                                                            'aria-label':
                                                                              r.unref(
                                                                                d
                                                                              )(
                                                                                'sr_list_remove',
                                                                                {
                                                                                  index:
                                                                                    o +
                                                                                    1,
                                                                                }
                                                                              ),
                                                                          },
                                                                          {
                                                                            ref_for:
                                                                              !0,
                                                                          },
                                                                          r.unref(
                                                                            l
                                                                          )
                                                                            .remove,
                                                                          {
                                                                            onClick:
                                                                              r.withModifiers(
                                                                                (
                                                                                  e
                                                                                ) =>
                                                                                  r.unref(
                                                                                    E
                                                                                  )(
                                                                                    o
                                                                                  ),
                                                                                [
                                                                                  'prevent',
                                                                                ]
                                                                              ),
                                                                          }
                                                                        ),
                                                                        null,
                                                                        16,
                                                                        Dt
                                                                      ))
                                                                    : (r.openBlock(),
                                                                      r.createBlock(
                                                                        n,
                                                                        r.mergeProps(
                                                                          {
                                                                            key: 2,
                                                                            class:
                                                                              r.unref(
                                                                                i
                                                                              )
                                                                                .remove,
                                                                          },
                                                                          {
                                                                            ref_for:
                                                                              !0,
                                                                          },
                                                                          r.unref(
                                                                            l
                                                                          )
                                                                            .remove,
                                                                          {
                                                                            onClick:
                                                                              r.withModifiers(
                                                                                (
                                                                                  e
                                                                                ) =>
                                                                                  r.unref(
                                                                                    E
                                                                                  )(
                                                                                    o
                                                                                  ),
                                                                                [
                                                                                  'prevent',
                                                                                ]
                                                                              ),
                                                                          }
                                                                        ),
                                                                        {
                                                                          default:
                                                                            r.withCtx(
                                                                              () => [
                                                                                r.createTextVNode(
                                                                                  r.toDisplayString(
                                                                                    r.unref(
                                                                                      k
                                                                                    )
                                                                                  ),
                                                                                  1
                                                                                ),
                                                                              ]
                                                                            ),
                                                                          _: 1,
                                                                        },
                                                                        16,
                                                                        [
                                                                          'class',
                                                                          'onClick',
                                                                        ]
                                                                      )),
                                                              ]
                                                            }
                                                          )
                                                        : r.createCommentVNode(
                                                            '',
                                                            !0
                                                          ),
                                                    ],
                                                    16,
                                                    Vt
                                                  )),
                                            ]
                                          }
                                        )
                                      }
                                    ),
                                    128
                                  )),
                                ],
                                16
                              )),
                          r.unref(x)
                            ? r.renderSlot(
                                e.$slots,
                                'add',
                                r.mergeProps(
                                  {
                                    key: 2,
                                    handleAdd: r.unref(_),
                                    label: r.unref(b),
                                    class: r.unref(i).add,
                                  },
                                  r.unref(l).add
                                ),
                                () => {
                                  var e
                                  return [
                                    (null == (e = r.unref(S)) ? void 0 : e.add)
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(S).add
                                          ),
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              'handle-add': r.unref(_),
                                              label: r.unref(b),
                                              class: r.unref(i).add,
                                            },
                                            r.unref(l).add
                                          ),
                                          null,
                                          16,
                                          ['handle-add', 'label', 'class']
                                        ))
                                      : (r.openBlock(),
                                        r.createBlock(
                                          n,
                                          r.mergeProps(
                                            {
                                              key: 1,
                                              type: 'button',
                                              class: r.unref(i).add,
                                              'aria-label': r.unref(b)
                                                ? void 0
                                                : r.unref(c).sr_list_add,
                                              'aria-describedby':
                                                0 === r.unref(m).length &&
                                                r.unref(B)
                                                  ? r.unref(w)
                                                  : void 0,
                                            },
                                            r.unref(l).add,
                                            {
                                              onClick: r.withModifiers(
                                                r.unref(_),
                                                ['prevent']
                                              ),
                                            }
                                          ),
                                          {
                                            default: r.withCtx(() => [
                                              r.createTextVNode(
                                                r.toDisplayString(r.unref(b)),
                                                1
                                              ),
                                            ]),
                                            _: 1,
                                          },
                                          16,
                                          [
                                            'class',
                                            'aria-label',
                                            'aria-describedby',
                                            'onClick',
                                          ]
                                        )),
                                  ]
                                }
                              )
                            : r.createCommentVNode('', !0),
                        ]),
                        _: 3,
                      }
                    )),
              ]
            )
          }
        )
      },
    }),
    jt = {
      type: 'matrix',
      submit: !0,
      bail: !0,
      maxErrors: 1,
      min: -1,
      max: -1,
      add: !0,
      remove: !0,
      sort: !1,
      minWidth: 'min-content',
      maxWidth: '1fr',
      rowHeaders: !0,
      colHeaders: !0,
      conditions: void 0,
      mode: 'auto',
      showRequired: void 0,
    },
    Rt = ve((e, t) => {
      const n = je(e, t, [nr, ar]),
        {
          container: a,
          available: o,
          visible: l,
          help: s,
          hint: i,
          path: u,
          disabled: d,
          helpId: c,
          hintId: p,
          errorId: f,
          id: v,
          children: g,
        } = n,
        { availableStatefulChildren$: h } = g,
        b = te(),
        k = m(),
        { make: B } = He(),
        x = Te(),
        $ = r.toRef(() =>
          'number' == typeof e.rows ? e.rows : e.rows ? y(e.rows) : 1
        ),
        C = r.toRef(() => e.mode || 'auto'),
        S = r.toRef(() => void 0 === e.rows || 'number' == typeof e.rows),
        E = r.toRef(() =>
          S.value
            ? [...Array($.value || 1).keys()].map(() =>
                'single' === C.value ? null : 'multiple' === C.value ? [] : {}
              )
            : {}
        ),
        {
          value: _,
          model: O,
          initialModel: A,
          payload: V,
          dataPath: P,
          invalid: D,
          required: F,
          dirty: j,
          pending: R,
          debouncing: T,
          busy: M,
          validated: N,
          completed: I,
          success: L,
          empty: q,
          numeric: H,
          hoisted: z,
          errors: W,
          hasError: U,
          displayErrors: G,
          ownErrors: K,
          formErrors: Y,
          messages: Z,
          messageBag: X,
          ruleMessages: J,
          items: Q,
          dragIndex: ee,
          dropIndex: re,
          isContainer: ne,
          update: ae,
          reset: oe,
          clear: le,
          validate: se,
          validateSelf: ie,
          validateChildren: ue,
          unvalidate: de,
          invalidate: ce,
          clean: pe,
          clearErrors: fe,
          clearMessages: me,
          clearMessageBag: ve,
          add: ge,
          remove: ye,
          sort: he,
          reinit: be,
        } = wr({ props: e, deps: n, events: t, nullValue: E, items: $ }),
        { aria: ke } = Vr({
          props: e,
          deps: {
            help: s,
            hint: i,
            helpId: c,
            hintId: p,
            errorId: f,
            hasError: U,
            busy: M,
            required: F,
          },
        }),
        {
          list: Be,
          canSort: we,
          dropTarget: xe,
          handleDragStart: $e,
          handleDragEnter: Ce,
          handleDrop: Se,
          handleDragEnd: Ee,
          handleWrapperDragOver: _e,
        } = Et({
          props: e,
          deps: {
            items: Q,
            sort: he,
            dragIndex: ee,
            dropIndex: re,
            disabled: d,
            sortable: S,
          },
        }),
        Oe = r.computed(() =>
          Q.value.map((r, t) => {
            const n = S.value ? r.index : t,
              a = S.value
                ? { value: n }
                : 'number' == typeof r
                  ? { value: r }
                  : r,
              o = S.value ? r.id : String(a.value),
              l = String(a.label || t + 1),
              s = `${v.value}_row-${o}`
            return {
              component: `Vf${w('single' === C.value ? 'radios' : 'multiple' === C.value ? 'checkboxes' : 'group')}`,
              props: {
                name: a.value,
                label: l,
                conditions: a.conditions,
                rules: e.rules,
                inline: !0,
                hoist: !0,
                nested: 'auto' === C.value,
              },
              cols: Ae.value.map((e) => ({
                ...e,
                props: {
                  ...e.props,
                  aria: { labelledby: `${s} ${e.id}` },
                  displayName: `${l} / ${e.label}`,
                },
              })),
              id: s,
              key: o,
              dataIndex: n,
              slot: 'auto' === C.value ? 'wrapper' : 'default',
              remove: () => ye(n),
            }
          })
        ),
        Ae = r.computed(() =>
          y(e.cols).map((e, r) => {
            var t
            return {
              component: `Vf${w((null == (t = e.schema) ? void 0 : t.type) || ('single' === C.value ? 'radio' : 'multiple' === C.value ? 'checkbox' : 'text'))}`,
              props: {
                name: e.value,
                conditions: e.conditions,
                disabled: d,
                inline: !0,
                ...e.schema,
              },
              value: e.value,
              label: String(e.label ?? Number(e.value) + 1),
              conditions: e.conditions,
              available: B(e.conditions),
              id: `${v.value}_col-${r}`,
              minWidth: Ue(e.minWidth, Me.value),
              maxWidth: Ue(e.maxWidth, Ne.value),
            }
          })
        ),
        Ve = r.computed(() => [
          ...(we.value ? [{}] : []),
          ...(Ie.value ? [{}] : []),
          ...Ae.value,
          ...(Re.value ? [{}] : []),
        ]),
        Pe = x(
          'matrix-add',
          r.toRef(() => e.addLabel),
          b
        ),
        De = x(
          'matrix-remove',
          r.toRef(() => e.removeLabel),
          b
        ),
        Fe = r.computed(
          () =>
            !1 !== e.add &&
            S.value &&
            !d.value &&
            (void 0 === e.max || -1 === e.max || Number(e.max) > Q.value.length)
        ),
        Re = r.computed(
          () =>
            !1 !== e.remove &&
            S.value &&
            !d.value &&
            (void 0 === e.min || -1 === e.min || Number(e.min) < Q.value.length)
        ),
        Me = r.computed(() => Ue(e.minWidth, 'min-content')),
        Ne = r.computed(() => Ue(e.maxWidth, '1fr')),
        Ie = r.computed(() => !S.value && !1 !== e.rowHeaders),
        Le = r.computed(() => !1 !== e.colHeaders),
        qe = r.toRef(() => k.nonce),
        ze = r.computed(() => `vf-grid-${v.value}`),
        We = r.computed(() => {
          if ('function' == typeof e.gridTemplateColumns)
            return e.gridTemplateColumns(b)
          if (e.gridTemplateColumns) return e.gridTemplateColumns
          const r = [
            ...(we.value ? ['max-content'] : []),
            ...(Ie.value ? ['minmax(min-content, auto)'] : []),
          ]
          return (
            Ae.value.length
              ? r.push(
                  ...Ae.value
                    .filter(({ available: e }) => e.value)
                    .map(({ minWidth: e, maxWidth: r }) => `minmax(${e}, ${r})`)
                )
              : r.push('minmax(min-content, 1fr)'),
            r.push(...(Re.value ? ['max-content'] : [])),
            r.join(' ')
          )
        }),
        Ue = (e, r) => ('number' == typeof e ? `${e}px` : void 0 !== e ? e : r)
      return (
        mr({
          type: 'matrix',
          id: v,
          model: O,
          available: o,
          visible: l,
          disabled: d,
          dataPath: P,
          path: u,
          container: a,
          children: g,
        }),
        r.watch(C, async () => {
          if (!S.value) return
          const e = O.value.length
          ;(le(), ge(e))
        }),
        {
          ...n,
          ...t,
          aria: ke,
          resolvedRows: Oe,
          resolvedCols: Ae,
          headers: Ve,
          canAdd: Fe,
          canRemove: Re,
          canSort: we,
          showRowHeaders: Ie,
          showColHeaders: Le,
          gridClass: ze,
          gridColumns: We,
          nonce: qe,
          addLabel: Pe,
          removeLabel: De,
          list: Be,
          dropTarget: xe,
          value: _,
          model: O,
          initialModel: A,
          payload: V,
          dataPath: P,
          nullValue: E,
          invalid: D,
          required: F,
          dirty: j,
          pending: R,
          debouncing: T,
          busy: M,
          validated: N,
          completed: I,
          success: L,
          empty: q,
          numeric: H,
          hoisted: z,
          errors: W,
          hasError: U,
          displayErrors: G,
          ownErrors: K,
          formErrors: Y,
          messages: Z,
          messageBag: X,
          ruleMessages: J,
          items: Q,
          dragIndex: ee,
          dropIndex: re,
          isContainer: ne,
          filled: (e) =>
            !(S.value && (!Array.isArray(e) || 0 === e.length)) &&
            h.value.every(({ filled: r, name: t }) =>
              r(null == e ? void 0 : e[t])
            ),
          update: ae,
          reset: oe,
          clear: le,
          validate: se,
          validateSelf: ie,
          validateChildren: ue,
          unvalidate: de,
          invalidate: ce,
          clean: pe,
          clearErrors: fe,
          clearMessages: me,
          clearMessageBag: ve,
          add: ge,
          remove: ye,
          sort: he,
          handleAdd: () => ge(),
          handleRemove: (e) => ye(e),
          handleDragStart: $e,
          handleDragEnter: Ce,
          handleDrop: Se,
          handleDragEnd: Ee,
          handleWrapperDragOver: _e,
          reinit: be,
        }
      )
    }),
    Tt = ['id'],
    Mt = ['aria-label', 'onDragstart', 'onDragenter'],
    Nt = ['id'],
    It = ['id'],
    Lt = ['onDragenter'],
    qt = ['aria-label', 'onClick'],
    Ht = ['id'],
    zt = r.defineComponent({
      name: 'VfMatrix',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfMatrix',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        gridTemplateColumns: { type: [String, Function] },
        scrollable: { type: Boolean },
        stickyCols: { type: Boolean },
        stickyRows: { type: Boolean },
        wrapColHeaders: { type: Boolean },
        wrapRowHeaders: { type: Boolean },
        addLabel: { type: [String, Object, Function] },
        removeLabel: { type: [String, Object, Function] },
        colHeaders: { type: Boolean },
        rowHeaders: { type: Boolean },
        minWidth: {},
        maxWidth: {},
        min: {},
        max: {},
        add: { type: Boolean },
        remove: { type: Boolean },
        cols: {},
        rows: {},
        mode: {},
        sort: { type: Boolean },
        tabular: { type: Boolean },
        aria: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        heading: {},
      },
      emits: [
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, jt),
          l = be(o),
          s = Rt(o, a),
          i = he('VfMatrix', () => ({
            root: {
              'vf-matrix': !0,
              'vf-tabular': !!o.tabular,
              'vf-wrap-col-headers': !!o.wrapColHeaders,
              'vf-wrap-row-headers': !!o.wrapRowHeaders,
            },
            grid: {
              'vf-matrix-grid': !0,
              'vf-scrollable': !!o.scrollable,
              [s.gridClass.value]: !0,
            },
            header: 'vf-matrix-header',
            colHeader: {
              'vf-matrix-col-header': !0,
              'vf-sticky': !!o.stickyCols,
            },
            row: (e, r) => ({
              'vf-matrix-row': !0,
              'vf-dragging': e,
              'vf-drop-target': r,
            }),
            rowHeader: {
              'vf-matrix-row-header': !0,
              'vf-sticky': !!o.stickyRows,
            },
            cell: 'vf-matrix-cell',
            sortWrapper: 'vf-matrix-row-sort',
            sort: 'vf-matrix-sort',
            removeWrapper: 'vf-matrix-row-remove',
            remove: { 'vf-matrix-remove': !0, 'vf-icon': !s.removeLabel.value },
            add: { 'vf-matrix-add': !0, 'vf-btn-icon-add': !s.addLabel.value },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { t: d, tags: c } = W(),
          {
            template: p,
            canAdd: f,
            canRemove: m,
            canSort: v,
            showRowHeaders: g,
            showColHeaders: y,
            gridClass: h,
            gridColumns: b,
            nonce: k,
            addLabel: B,
            removeLabel: w,
            resolvedRows: x,
            dragIndex: $,
            dropTarget: C,
            headers: S,
            slots: E,
            handleAdd: _,
            handleDragStart: O,
            handleDragEnter: A,
            handleDragEnd: V,
            handleDrop: P,
            handleWrapperDragOver: D,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfBtn'),
              a = r.resolveComponent('VfLayout')
            return r.renderSlot(
              e.$slots,
              'template',
              { context: r.unref(u) },
              () => [
                r.unref(p)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(p)),
                      { key: 0, context: r.unref(u) },
                      null,
                      8,
                      ['context']
                    ))
                  : (r.openBlock(),
                    r.createBlock(
                      a,
                      { key: 1 },
                      {
                        default: r.withCtx(() => [
                          r.createElementVNode(
                            'div',
                            r.mergeProps(
                              { ref: 'list', class: r.unref(i).grid },
                              r.unref(l).grid,
                              {
                                onDragover:
                                  t[1] ||
                                  (t[1] = (...e) =>
                                    r.unref(D) && r.unref(D)(...e)),
                                onDrop:
                                  t[2] ||
                                  (t[2] = (...e) =>
                                    r.unref(P) && r.unref(P)(...e)),
                              }
                            ),
                            [
                              r.unref(y)
                                ? r.renderSlot(
                                    e.$slots,
                                    'header',
                                    r.mergeProps(
                                      {
                                        key: 0,
                                        headers: r.unref(S),
                                        class: r.unref(i).header,
                                      },
                                      r.unref(l).header
                                    ),
                                    () => {
                                      var t
                                      return [
                                        (
                                          null == (t = r.unref(E))
                                            ? void 0
                                            : t.header
                                        )
                                          ? (r.openBlock(),
                                            r.createBlock(
                                              r.resolveDynamicComponent(
                                                r.unref(E).header
                                              ),
                                              r.mergeProps(
                                                {
                                                  key: 0,
                                                  headers: r.unref(S),
                                                  class: r.unref(i).header,
                                                },
                                                r.unref(l).header
                                              ),
                                              null,
                                              16,
                                              ['headers', 'class']
                                            ))
                                          : (r.openBlock(),
                                            r.createElementBlock(
                                              'div',
                                              r.mergeProps(
                                                {
                                                  key: 1,
                                                  class: r.unref(i).header,
                                                },
                                                r.unref(l).header
                                              ),
                                              [
                                                (r.openBlock(!0),
                                                r.createElementBlock(
                                                  r.Fragment,
                                                  null,
                                                  r.renderList(
                                                    r.unref(S),
                                                    ({
                                                      id: t,
                                                      label: n,
                                                      available: a,
                                                    }) => (
                                                      r.openBlock(),
                                                      r.createElementBlock(
                                                        r.Fragment,
                                                        null,
                                                        [
                                                          !t || a.value
                                                            ? r.renderSlot(
                                                                e.$slots,
                                                                'colHeader',
                                                                r.mergeProps(
                                                                  {
                                                                    key: 0,
                                                                    id: t,
                                                                    label: n,
                                                                    class:
                                                                      r.unref(i)
                                                                        .colHeader,
                                                                  },
                                                                  {
                                                                    ref_for: !0,
                                                                  },
                                                                  r.unref(l)
                                                                    .colHeader
                                                                ),
                                                                () => {
                                                                  var e
                                                                  return [
                                                                    (
                                                                      null ==
                                                                      (e =
                                                                        r.unref(
                                                                          E
                                                                        ))
                                                                        ? void 0
                                                                        : e.colHeader
                                                                    )
                                                                      ? (r.openBlock(),
                                                                        r.createBlock(
                                                                          r.resolveDynamicComponent(
                                                                            r.unref(
                                                                              E
                                                                            )
                                                                              .colHeader
                                                                          ),
                                                                          r.mergeProps(
                                                                            {
                                                                              key: 0,
                                                                              id: t,
                                                                              label:
                                                                                n,
                                                                              class:
                                                                                r.unref(
                                                                                  i
                                                                                )
                                                                                  .colHeader,
                                                                            },
                                                                            {
                                                                              ref_for:
                                                                                !0,
                                                                            },
                                                                            r.unref(
                                                                              l
                                                                            )
                                                                              .colHeader
                                                                          ),
                                                                          null,
                                                                          16,
                                                                          [
                                                                            'id',
                                                                            'label',
                                                                            'class',
                                                                          ]
                                                                        ))
                                                                      : (r.openBlock(),
                                                                        r.createElementBlock(
                                                                          'div',
                                                                          r.mergeProps(
                                                                            {
                                                                              key: 1,
                                                                              class:
                                                                                r.unref(
                                                                                  i
                                                                                )
                                                                                  .colHeader,
                                                                              id: t,
                                                                            },
                                                                            {
                                                                              ref_for:
                                                                                !0,
                                                                            },
                                                                            r.unref(
                                                                              l
                                                                            )
                                                                              .colHeader
                                                                          ),
                                                                          r.toDisplayString(
                                                                            n
                                                                          ),
                                                                          17,
                                                                          Tt
                                                                        )),
                                                                  ]
                                                                }
                                                              )
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ],
                                                        64
                                                      )
                                                    )
                                                  ),
                                                  256
                                                )),
                                              ],
                                              16
                                            )),
                                      ]
                                    }
                                  )
                                : r.createCommentVNode('', !0),
                              (r.openBlock(!0),
                              r.createElementBlock(
                                r.Fragment,
                                null,
                                r.renderList(
                                  r.unref(x),
                                  (
                                    {
                                      component: a,
                                      props: o,
                                      slot: s,
                                      cols: u,
                                      id: c,
                                      key: p,
                                      dataIndex: f,
                                      remove: y,
                                    },
                                    h
                                  ) => (
                                    r.openBlock(),
                                    r.createElementBlock(
                                      'div',
                                      {
                                        class: r.normalizeClass(
                                          r
                                            .unref(i)
                                            .row(
                                              r.unref($) === f,
                                              r.unref(C) === p
                                            )
                                        ),
                                        key: p,
                                      },
                                      [
                                        (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(a),
                                          r.mergeProps({ ref_for: !0 }, o),
                                          {
                                            [s]: r.withCtx(({ label: a }) => [
                                              r.renderSlot(
                                                e.$slots,
                                                'row',
                                                {
                                                  index: f,
                                                  rowHeader: r.unref(g),
                                                  beingDragged:
                                                    r.unref($) === f,
                                                  isDropTarget:
                                                    r.unref(C) === p,
                                                  handleDragEnter: (e) =>
                                                    r.unref(A)(e, h),
                                                  handleDragStart: (e) =>
                                                    r.unref(O)(e, f),
                                                  handleDragEnd: r.unref(V),
                                                  label: a,
                                                  cols: u,
                                                  remove: y,
                                                  canRemove: r.unref(m),
                                                  canSort: r.unref(v),
                                                  class: r.normalizeClass(
                                                    r
                                                      .unref(i)
                                                      .row(
                                                        r.unref($) === f,
                                                        r.unref(C) === p
                                                      )
                                                  ),
                                                },
                                                () => {
                                                  var o
                                                  return [
                                                    (
                                                      null == (o = r.unref(E))
                                                        ? void 0
                                                        : o.row
                                                    )
                                                      ? (r.openBlock(),
                                                        r.createBlock(
                                                          r.resolveDynamicComponent(
                                                            r.unref(E).row
                                                          ),
                                                          {
                                                            key: 0,
                                                            index: f,
                                                            'row-header':
                                                              r.unref(g),
                                                            'being-dragged':
                                                              r.unref($) === f,
                                                            'is-drop-target':
                                                              r.unref(C) === p,
                                                            'handle-drag-enter':
                                                              (e) =>
                                                                r.unref(A)(
                                                                  e,
                                                                  h
                                                                ),
                                                            'handle-drag-start':
                                                              (e) =>
                                                                r.unref(O)(
                                                                  e,
                                                                  f
                                                                ),
                                                            'handle-drag-end':
                                                              r.unref(V),
                                                            label: a,
                                                            cols: u,
                                                            remove: y,
                                                            'can-remove':
                                                              r.unref(m),
                                                            'can-sort':
                                                              r.unref(v),
                                                            class:
                                                              r.normalizeClass(
                                                                r
                                                                  .unref(i)
                                                                  .row(
                                                                    r.unref(
                                                                      $
                                                                    ) === f,
                                                                    r.unref(
                                                                      C
                                                                    ) === p
                                                                  )
                                                              ),
                                                          },
                                                          null,
                                                          8,
                                                          [
                                                            'index',
                                                            'row-header',
                                                            'being-dragged',
                                                            'is-drop-target',
                                                            'handle-drag-enter',
                                                            'handle-drag-start',
                                                            'handle-drag-end',
                                                            'label',
                                                            'cols',
                                                            'remove',
                                                            'can-remove',
                                                            'can-sort',
                                                            'class',
                                                          ]
                                                        ))
                                                      : (r.openBlock(),
                                                        r.createElementBlock(
                                                          r.Fragment,
                                                          { key: 1 },
                                                          [
                                                            r.unref(v)
                                                              ? r.renderSlot(
                                                                  e.$slots,
                                                                  'sortWrapper',
                                                                  r.mergeProps(
                                                                    {
                                                                      key: 0,
                                                                      handleDragStart:
                                                                        (e) =>
                                                                          r.unref(
                                                                            O
                                                                          )(
                                                                            e,
                                                                            f
                                                                          ),
                                                                      handleDragEnd:
                                                                        r.unref(
                                                                          V
                                                                        ),
                                                                      handleDragEnter:
                                                                        (e) =>
                                                                          r.unref(
                                                                            A
                                                                          )(
                                                                            e,
                                                                            h
                                                                          ),
                                                                      class:
                                                                        r.unref(
                                                                          i
                                                                        )
                                                                          .sortWrapper,
                                                                    },
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    r.unref(l)
                                                                      .sortWrapper
                                                                  ),
                                                                  () => {
                                                                    var n
                                                                    return [
                                                                      (
                                                                        null ==
                                                                        (n =
                                                                          r.unref(
                                                                            E
                                                                          ))
                                                                          ? void 0
                                                                          : n.sortWrapper
                                                                      )
                                                                        ? (r.openBlock(),
                                                                          r.createBlock(
                                                                            r.resolveDynamicComponent(
                                                                              r.unref(
                                                                                E
                                                                              )
                                                                                .sortWrapper
                                                                            ),
                                                                            r.mergeProps(
                                                                              {
                                                                                key: 0,
                                                                                'handle-drag-start':
                                                                                  (
                                                                                    e
                                                                                  ) =>
                                                                                    r.unref(
                                                                                      O
                                                                                    )(
                                                                                      e,
                                                                                      f
                                                                                    ),
                                                                                'handle-drag-end':
                                                                                  r.unref(
                                                                                    V
                                                                                  ),
                                                                                'handle-drag-enter':
                                                                                  (
                                                                                    e
                                                                                  ) =>
                                                                                    r.unref(
                                                                                      A
                                                                                    )(
                                                                                      e,
                                                                                      h
                                                                                    ),
                                                                                class:
                                                                                  r.unref(
                                                                                    i
                                                                                  )
                                                                                    .sortWrapper,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .sortWrapper
                                                                            ),
                                                                            null,
                                                                            16,
                                                                            [
                                                                              'handle-drag-start',
                                                                              'handle-drag-end',
                                                                              'handle-drag-enter',
                                                                              'class',
                                                                            ]
                                                                          ))
                                                                        : (r.openBlock(),
                                                                          r.createElementBlock(
                                                                            'div',
                                                                            r.mergeProps(
                                                                              {
                                                                                key: 1,
                                                                                class:
                                                                                  r.unref(
                                                                                    i
                                                                                  )
                                                                                    .sortWrapper,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .sortWrapper
                                                                            ),
                                                                            [
                                                                              r.renderSlot(
                                                                                e.$slots,
                                                                                'sort',
                                                                                r.mergeProps(
                                                                                  {
                                                                                    class:
                                                                                      r.unref(
                                                                                        i
                                                                                      )
                                                                                        .sort,
                                                                                    handleDragStart:
                                                                                      (
                                                                                        e
                                                                                      ) =>
                                                                                        r.unref(
                                                                                          O
                                                                                        )(
                                                                                          e,
                                                                                          f
                                                                                        ),
                                                                                    handleDragEnd:
                                                                                      r.unref(
                                                                                        V
                                                                                      ),
                                                                                    handleDragEnter:
                                                                                      (
                                                                                        e
                                                                                      ) =>
                                                                                        r.unref(
                                                                                          A
                                                                                        )(
                                                                                          e,
                                                                                          h
                                                                                        ),
                                                                                  },
                                                                                  {
                                                                                    ref_for:
                                                                                      !0,
                                                                                  },
                                                                                  r.unref(
                                                                                    l
                                                                                  )
                                                                                    .sort
                                                                                ),
                                                                                () => {
                                                                                  var e
                                                                                  return [
                                                                                    (
                                                                                      null ==
                                                                                      (e =
                                                                                        r.unref(
                                                                                          E
                                                                                        ))
                                                                                        ? void 0
                                                                                        : e.sort
                                                                                    )
                                                                                      ? (r.openBlock(),
                                                                                        r.createBlock(
                                                                                          r.resolveDynamicComponent(
                                                                                            r.unref(
                                                                                              E
                                                                                            )
                                                                                              .sort
                                                                                          ),
                                                                                          r.mergeProps(
                                                                                            {
                                                                                              key: 0,
                                                                                              class:
                                                                                                r.unref(
                                                                                                  i
                                                                                                )
                                                                                                  .sort,
                                                                                              'handle-drag-start':
                                                                                                (
                                                                                                  e
                                                                                                ) =>
                                                                                                  r.unref(
                                                                                                    O
                                                                                                  )(
                                                                                                    e,
                                                                                                    f
                                                                                                  ),
                                                                                              'handle-drag-end':
                                                                                                r.unref(
                                                                                                  V
                                                                                                ),
                                                                                              'handle-drag-enter':
                                                                                                (
                                                                                                  e
                                                                                                ) =>
                                                                                                  r.unref(
                                                                                                    A
                                                                                                  )(
                                                                                                    e,
                                                                                                    h
                                                                                                  ),
                                                                                            },
                                                                                            {
                                                                                              ref_for:
                                                                                                !0,
                                                                                            },
                                                                                            r.unref(
                                                                                              l
                                                                                            )
                                                                                              .sort
                                                                                          ),
                                                                                          null,
                                                                                          16,
                                                                                          [
                                                                                            'class',
                                                                                            'handle-drag-start',
                                                                                            'handle-drag-end',
                                                                                            'handle-drag-enter',
                                                                                          ]
                                                                                        ))
                                                                                      : (r.openBlock(),
                                                                                        r.createElementBlock(
                                                                                          'button',
                                                                                          r.mergeProps(
                                                                                            {
                                                                                              key: 1,
                                                                                              type: 'button',
                                                                                              class:
                                                                                                r.unref(
                                                                                                  i
                                                                                                )
                                                                                                  .sort,
                                                                                              'aria-label':
                                                                                                r.unref(
                                                                                                  d
                                                                                                )(
                                                                                                  'sr_list_sort',
                                                                                                  {
                                                                                                    index:
                                                                                                      h +
                                                                                                      1,
                                                                                                  }
                                                                                                ),
                                                                                            },
                                                                                            {
                                                                                              ref_for:
                                                                                                !0,
                                                                                            },
                                                                                            r.unref(
                                                                                              l
                                                                                            )
                                                                                              .sort,
                                                                                            {
                                                                                              draggable:
                                                                                                !0,
                                                                                              onDragstart:
                                                                                                (
                                                                                                  e
                                                                                                ) =>
                                                                                                  r.unref(
                                                                                                    O
                                                                                                  )(
                                                                                                    e,
                                                                                                    f
                                                                                                  ),
                                                                                              onDragend:
                                                                                                t[0] ||
                                                                                                (t[0] =
                                                                                                  (
                                                                                                    ...e
                                                                                                  ) =>
                                                                                                    r.unref(
                                                                                                      V
                                                                                                    ) &&
                                                                                                    r.unref(
                                                                                                      V
                                                                                                    )(
                                                                                                      ...e
                                                                                                    )),
                                                                                              onDragenter:
                                                                                                (
                                                                                                  e
                                                                                                ) =>
                                                                                                  r.unref(
                                                                                                    A
                                                                                                  )(
                                                                                                    e,
                                                                                                    h
                                                                                                  ),
                                                                                            }
                                                                                          ),
                                                                                          null,
                                                                                          16,
                                                                                          Mt
                                                                                        )),
                                                                                  ]
                                                                                }
                                                                              ),
                                                                            ],
                                                                            16
                                                                          )),
                                                                    ]
                                                                  }
                                                                )
                                                              : r.createCommentVNode(
                                                                  '',
                                                                  !0
                                                                ),
                                                            r.unref(g)
                                                              ? r.renderSlot(
                                                                  e.$slots,
                                                                  'rowHeader',
                                                                  r.mergeProps(
                                                                    {
                                                                      key: 1,
                                                                      label: a,
                                                                      class:
                                                                        r.unref(
                                                                          i
                                                                        )
                                                                          .rowHeader,
                                                                    },
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    r.unref(l)
                                                                      .rowHeader
                                                                  ),
                                                                  () => {
                                                                    var e
                                                                    return [
                                                                      (
                                                                        null ==
                                                                        (e =
                                                                          r.unref(
                                                                            E
                                                                          ))
                                                                          ? void 0
                                                                          : e.rowHeader
                                                                      )
                                                                        ? (r.openBlock(),
                                                                          r.createBlock(
                                                                            r.resolveDynamicComponent(
                                                                              r.unref(
                                                                                E
                                                                              )
                                                                                .rowHeader
                                                                            ),
                                                                            r.mergeProps(
                                                                              {
                                                                                key: 0,
                                                                                label:
                                                                                  a,
                                                                                class:
                                                                                  r.unref(
                                                                                    i
                                                                                  )
                                                                                    .rowHeader,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .rowHeader
                                                                            ),
                                                                            null,
                                                                            16,
                                                                            [
                                                                              'label',
                                                                              'class',
                                                                            ]
                                                                          ))
                                                                        : (r.openBlock(),
                                                                          r.createElementBlock(
                                                                            'div',
                                                                            r.mergeProps(
                                                                              {
                                                                                key: 1,
                                                                                class:
                                                                                  r.unref(
                                                                                    i
                                                                                  )
                                                                                    .rowHeader,
                                                                                id: c,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .rowHeader
                                                                            ),
                                                                            r.toDisplayString(
                                                                              a
                                                                            ),
                                                                            17,
                                                                            Nt
                                                                          )),
                                                                    ]
                                                                  }
                                                                )
                                                              : (r.openBlock(),
                                                                r.createElementBlock(
                                                                  'div',
                                                                  {
                                                                    key: 2,
                                                                    class:
                                                                      'sr-only',
                                                                    id: c,
                                                                  },
                                                                  r.toDisplayString(
                                                                    a
                                                                  ),
                                                                  9,
                                                                  It
                                                                )),
                                                            (r.openBlock(!0),
                                                            r.createElementBlock(
                                                              r.Fragment,
                                                              null,
                                                              r.renderList(
                                                                u,
                                                                ({
                                                                  component: t,
                                                                  props: n,
                                                                }) =>
                                                                  r.renderSlot(
                                                                    e.$slots,
                                                                    'cell',
                                                                    {
                                                                      key: n.name,
                                                                      component:
                                                                        t,
                                                                      handleDragEnter:
                                                                        (e) =>
                                                                          r.unref(
                                                                            A
                                                                          )(
                                                                            e,
                                                                            h
                                                                          ),
                                                                      props: n,
                                                                    },
                                                                    () => {
                                                                      var e
                                                                      return [
                                                                        (
                                                                          null ==
                                                                          (e =
                                                                            r.unref(
                                                                              E
                                                                            ))
                                                                            ? void 0
                                                                            : e.cell
                                                                        )
                                                                          ? (r.openBlock(),
                                                                            r.createBlock(
                                                                              r.resolveDynamicComponent(
                                                                                r.unref(
                                                                                  E
                                                                                )
                                                                                  .cell
                                                                              ),
                                                                              {
                                                                                key: 0,
                                                                                component:
                                                                                  t,
                                                                                'handle-drag-enter':
                                                                                  (
                                                                                    e
                                                                                  ) =>
                                                                                    r.unref(
                                                                                      A
                                                                                    )(
                                                                                      e,
                                                                                      h
                                                                                    ),
                                                                                props:
                                                                                  n,
                                                                              },
                                                                              null,
                                                                              8,
                                                                              [
                                                                                'component',
                                                                                'handle-drag-enter',
                                                                                'props',
                                                                              ]
                                                                            ))
                                                                          : (r.openBlock(),
                                                                            r.createElementBlock(
                                                                              'div',
                                                                              {
                                                                                key: 1,
                                                                                class:
                                                                                  r.normalizeClass(
                                                                                    r.unref(
                                                                                      i
                                                                                    )
                                                                                      .cell
                                                                                  ),
                                                                                onDragenter:
                                                                                  (
                                                                                    e
                                                                                  ) =>
                                                                                    r.unref(
                                                                                      A
                                                                                    )(
                                                                                      e,
                                                                                      h
                                                                                    ),
                                                                              },
                                                                              [
                                                                                (r.openBlock(),
                                                                                r.createBlock(
                                                                                  r.resolveDynamicComponent(
                                                                                    t
                                                                                  ),
                                                                                  r.mergeProps(
                                                                                    {
                                                                                      ref_for:
                                                                                        !0,
                                                                                    },
                                                                                    n
                                                                                  ),
                                                                                  null,
                                                                                  16
                                                                                )),
                                                                              ],
                                                                              42,
                                                                              Lt
                                                                            )),
                                                                      ]
                                                                    }
                                                                  )
                                                              ),
                                                              128
                                                            )),
                                                            r.unref(m)
                                                              ? r.renderSlot(
                                                                  e.$slots,
                                                                  'removeWrapper',
                                                                  r.mergeProps(
                                                                    {
                                                                      key: 3,
                                                                      handleRemove:
                                                                        y,
                                                                      class:
                                                                        r.unref(
                                                                          i
                                                                        )
                                                                          .removeWrapper,
                                                                    },
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    r.unref(l)
                                                                      .removeWrapper
                                                                  ),
                                                                  () => {
                                                                    var t
                                                                    return [
                                                                      (
                                                                        null ==
                                                                        (t =
                                                                          r.unref(
                                                                            E
                                                                          ))
                                                                          ? void 0
                                                                          : t.removeWrapper
                                                                      )
                                                                        ? (r.openBlock(),
                                                                          r.createBlock(
                                                                            r.resolveDynamicComponent(
                                                                              r.unref(
                                                                                E
                                                                              )
                                                                                .removeWrapper
                                                                            ),
                                                                            r.mergeProps(
                                                                              {
                                                                                key: 0,
                                                                                'handle-remove':
                                                                                  y,
                                                                                class:
                                                                                  r.unref(
                                                                                    i
                                                                                  )
                                                                                    .removeWrapper,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .removeWrapper
                                                                            ),
                                                                            null,
                                                                            16,
                                                                            [
                                                                              'handle-remove',
                                                                              'class',
                                                                            ]
                                                                          ))
                                                                        : (r.openBlock(),
                                                                          r.createElementBlock(
                                                                            'div',
                                                                            r.mergeProps(
                                                                              {
                                                                                key: 1,
                                                                                class:
                                                                                  r.unref(
                                                                                    i
                                                                                  )
                                                                                    .removeWrapper,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .removeWrapper
                                                                            ),
                                                                            [
                                                                              r.renderSlot(
                                                                                e.$slots,
                                                                                'remove',
                                                                                r.mergeProps(
                                                                                  {
                                                                                    handleRemove:
                                                                                      y,
                                                                                    class:
                                                                                      r.unref(
                                                                                        i
                                                                                      )
                                                                                        .remove,
                                                                                  },
                                                                                  {
                                                                                    ref_for:
                                                                                      !0,
                                                                                  },
                                                                                  r.unref(
                                                                                    l
                                                                                  )
                                                                                    .remove
                                                                                ),
                                                                                () => {
                                                                                  var e
                                                                                  return [
                                                                                    (
                                                                                      null ==
                                                                                      (e =
                                                                                        r.unref(
                                                                                          E
                                                                                        ))
                                                                                        ? void 0
                                                                                        : e.remove
                                                                                    )
                                                                                      ? (r.openBlock(),
                                                                                        r.createBlock(
                                                                                          r.resolveDynamicComponent(
                                                                                            r.unref(
                                                                                              E
                                                                                            )
                                                                                              .remove
                                                                                          ),
                                                                                          r.mergeProps(
                                                                                            {
                                                                                              key: 0,
                                                                                              'handle-remove':
                                                                                                y,
                                                                                              class:
                                                                                                r.unref(
                                                                                                  i
                                                                                                )
                                                                                                  .remove,
                                                                                            },
                                                                                            {
                                                                                              ref_for:
                                                                                                !0,
                                                                                            },
                                                                                            r.unref(
                                                                                              l
                                                                                            )
                                                                                              .remove
                                                                                          ),
                                                                                          null,
                                                                                          16,
                                                                                          [
                                                                                            'handle-remove',
                                                                                            'class',
                                                                                          ]
                                                                                        ))
                                                                                      : r.unref(
                                                                                            w
                                                                                          )
                                                                                        ? (r.openBlock(),
                                                                                          r.createBlock(
                                                                                            n,
                                                                                            r.mergeProps(
                                                                                              {
                                                                                                key: 2,
                                                                                                class:
                                                                                                  r.unref(
                                                                                                    i
                                                                                                  )
                                                                                                    .remove,
                                                                                              },
                                                                                              {
                                                                                                ref_for:
                                                                                                  !0,
                                                                                              },
                                                                                              r.unref(
                                                                                                l
                                                                                              )
                                                                                                .remove,
                                                                                              {
                                                                                                onClick:
                                                                                                  r.withModifiers(
                                                                                                    y,
                                                                                                    [
                                                                                                      'prevent',
                                                                                                    ]
                                                                                                  ),
                                                                                              }
                                                                                            ),
                                                                                            {
                                                                                              default:
                                                                                                r.withCtx(
                                                                                                  () => [
                                                                                                    r.createTextVNode(
                                                                                                      r.toDisplayString(
                                                                                                        r.unref(
                                                                                                          w
                                                                                                        )
                                                                                                      ),
                                                                                                      1
                                                                                                    ),
                                                                                                  ]
                                                                                                ),
                                                                                              _: 1,
                                                                                            },
                                                                                            16,
                                                                                            [
                                                                                              'class',
                                                                                              'onClick',
                                                                                            ]
                                                                                          ))
                                                                                        : (r.openBlock(),
                                                                                          r.createElementBlock(
                                                                                            'button',
                                                                                            r.mergeProps(
                                                                                              {
                                                                                                key: 1,
                                                                                                type: 'button',
                                                                                                class:
                                                                                                  r.unref(
                                                                                                    i
                                                                                                  )
                                                                                                    .remove,
                                                                                                'aria-label':
                                                                                                  r.unref(
                                                                                                    d
                                                                                                  )(
                                                                                                    'sr_matrix_remove',
                                                                                                    {
                                                                                                      index:
                                                                                                        a ||
                                                                                                        '',
                                                                                                    }
                                                                                                  ),
                                                                                              },
                                                                                              {
                                                                                                ref_for:
                                                                                                  !0,
                                                                                              },
                                                                                              r.unref(
                                                                                                l
                                                                                              )
                                                                                                .remove,
                                                                                              {
                                                                                                onClick:
                                                                                                  r.withModifiers(
                                                                                                    y,
                                                                                                    [
                                                                                                      'prevent',
                                                                                                    ]
                                                                                                  ),
                                                                                              }
                                                                                            ),
                                                                                            null,
                                                                                            16,
                                                                                            qt
                                                                                          )),
                                                                                  ]
                                                                                }
                                                                              ),
                                                                            ],
                                                                            16
                                                                          )),
                                                                    ]
                                                                  }
                                                                )
                                                              : r.createCommentVNode(
                                                                  '',
                                                                  !0
                                                                ),
                                                          ],
                                                          64
                                                        )),
                                                  ]
                                                }
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          1040
                                        )),
                                      ],
                                      2
                                    )
                                  )
                                ),
                                128
                              )),
                            ],
                            16
                          ),
                          r.unref(y)
                            ? r.createCommentVNode('', !0)
                            : (r.openBlock(!0),
                              r.createElementBlock(
                                r.Fragment,
                                { key: 0 },
                                r.renderList(
                                  r.unref(S),
                                  (e) => (
                                    r.openBlock(),
                                    r.createElementBlock(
                                      r.Fragment,
                                      null,
                                      [
                                        'label' in e
                                          ? (r.openBlock(),
                                            r.createElementBlock(
                                              'div',
                                              {
                                                key: 0,
                                                class: 'sr-only',
                                                id: e.id,
                                              },
                                              r.toDisplayString(e.label),
                                              9,
                                              Ht
                                            ))
                                          : r.createCommentVNode('', !0),
                                      ],
                                      64
                                    )
                                  )
                                ),
                                256
                              )),
                          r.unref(f)
                            ? r.renderSlot(
                                e.$slots,
                                'add',
                                r.mergeProps(
                                  {
                                    key: 1,
                                    handleAdd: r.unref(_),
                                    label: r.unref(B),
                                    class: r.unref(i).add,
                                  },
                                  r.unref(l).add
                                ),
                                () => {
                                  var e
                                  return [
                                    (null == (e = r.unref(E)) ? void 0 : e.add)
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(E).add
                                          ),
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              'handle-add': r.unref(_),
                                              label: r.unref(B),
                                              class: r.unref(i).add,
                                            },
                                            r.unref(l).add
                                          ),
                                          null,
                                          16,
                                          ['handle-add', 'label', 'class']
                                        ))
                                      : (r.openBlock(),
                                        r.createBlock(
                                          n,
                                          r.mergeProps(
                                            {
                                              key: 1,
                                              type: 'button',
                                              class: r.unref(i).add,
                                              'aria-label': r.unref(B)
                                                ? void 0
                                                : r.unref(c).sr_matrix_add,
                                            },
                                            r.unref(l).add,
                                            {
                                              onClick: r.withModifiers(
                                                r.unref(_),
                                                ['prevent']
                                              ),
                                            }
                                          ),
                                          {
                                            default: r.withCtx(() => [
                                              r.createTextVNode(
                                                r.toDisplayString(r.unref(B)),
                                                1
                                              ),
                                            ]),
                                            _: 1,
                                          },
                                          16,
                                          ['class', 'aria-label', 'onClick']
                                        )),
                                  ]
                                }
                              )
                            : r.createCommentVNode('', !0),
                          (r.openBlock(),
                          r.createBlock(
                            r.resolveDynamicComponent('style'),
                            { '^nonce': r.unref(k) },
                            {
                              default: r.withCtx(() => [
                                r.createTextVNode(
                                  ' .' +
                                    r.toDisplayString(r.unref(h)) +
                                    ' { grid-template-columns: ' +
                                    r.toDisplayString(r.unref(b)) +
                                    '; } ',
                                  1
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ['^nonce']
                          )),
                        ]),
                        _: 3,
                      }
                    )),
              ]
            )
          }
        )
      },
    }),
    Wt = { hideBack: !0 },
    Ut = ve((e, t) => {
      const n = J()
      if (!n)
        throw new Error('<VfNav> must be used inside a <VfForm> component')
      const { tags: a } = z(),
        o = Te(),
        l = r.useId(),
        s = o(
          'step-back',
          r.toRef(() => e.back || a.steps_back),
          n
        ),
        i = o(
          'step-next',
          r.toRef(() => e.next || a.steps_next),
          n
        ),
        u = o(
          'step-finish',
          r.toRef(() => e.finish || a.steps_finish),
          n
        ),
        { template: d, slots: c } = fe(e),
        p = r.computed(() => {
          var r
          return !!(null == (r = e.pager.currentPage) ? void 0 : r.loading)
        }),
        f = r.computed(() => `${l}__status`)
      return {
        template: d,
        slots: c,
        backLabel: s,
        loading: p,
        describedby: r.computed(() => {
          var r
          return (null == (r = e.pager.currentPage) ? void 0 : r.index) ===
            e.pager.lastEnabled &&
            (e.pager.invalid || e.pager.loading)
            ? f.value
            : void 0
        }),
        nextLabel: i,
        finishLabel: u,
        statusId: f,
      }
    }),
    Gt = ['id'],
    Kt = r.defineComponent({
      name: 'VfNav',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfNav',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        pager: {},
        back: { type: [String, Object, Function] },
        next: { type: [String, Object, Function] },
        finish: { type: [String, Object, Function] },
        hideBack: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Wt),
          l = be(o),
          s = Ut(o, a),
          i = he('VfNav', () => ({
            root: {
              'vf-nav': !0,
              'vf-no-back': !o.pager.previousPage && !!o.hideBack,
            },
            back: { 'vf-nav-back': !0 },
            next: { 'vf-nav-next': !0, 'vf-loading': s.loading.value },
            finish: { 'vf-nav-finish': !0, 'vf-loading': s.loading.value },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          d = J(),
          { tags: c } = z(),
          { hideBack: p } = _e(o, ['hideBack']),
          {
            template: f,
            slots: m,
            backLabel: v,
            loading: g,
            describedby: y,
            nextLabel: h,
            finishLabel: b,
            statusId: k,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (t, n) => {
            const a = r.resolveComponent('VfBtn')
            return r.renderSlot(
              t.$slots,
              'template',
              { context: r.unref(u) },
              () => [
                r.unref(f)
                  ? (r.openBlock(),
                    r.createBlock(
                      r.resolveDynamicComponent(r.unref(f)),
                      { key: 0, context: r.unref(u) },
                      null,
                      8,
                      ['context']
                    ))
                  : (r.openBlock(),
                    r.createElementBlock(
                      'div',
                      r.mergeProps(
                        { key: 1, class: r.unref(i).root },
                        r.unref(l).root
                      ),
                      [
                        e.pager.previousPage || !r.unref(p)
                          ? r.renderSlot(
                              t.$slots,
                              'back',
                              r.mergeProps(
                                {
                                  key: 0,
                                  label: r.unref(v),
                                  form$: r.unref(d),
                                  pager: e.pager,
                                  disabled: !e.pager.previousPage,
                                  back: e.pager.back,
                                  class: r.unref(i).back,
                                },
                                r.unref(l).back
                              ),
                              () => {
                                var n
                                return [
                                  (null == (n = r.unref(m)) ? void 0 : n.back)
                                    ? (r.openBlock(),
                                      r.createBlock(
                                        r.resolveDynamicComponent(
                                          r.unref(m).back
                                        ),
                                        r.mergeProps(
                                          {
                                            key: 0,
                                            label: r.unref(v),
                                            form$: r.unref(d),
                                            pager: e.pager,
                                            disabled: !e.pager.previousPage,
                                            back: e.pager.back,
                                            class: r.unref(i).back,
                                          },
                                          r.unref(l).back
                                        ),
                                        null,
                                        16,
                                        [
                                          'label',
                                          'form$',
                                          'pager',
                                          'disabled',
                                          'back',
                                          'class',
                                        ]
                                      ))
                                    : (r.openBlock(),
                                      r.createBlock(
                                        a,
                                        r.mergeProps(
                                          {
                                            key: 1,
                                            fluid: '',
                                            disabled: !e.pager.previousPage,
                                            class: r.unref(i).back,
                                            'aria-disabled':
                                              !e.pager.previousPage,
                                          },
                                          r.unref(l).back,
                                          { onClick: e.pager.back }
                                        ),
                                        {
                                          default: r.withCtx(() => [
                                            r.renderSlot(
                                              t.$slots,
                                              'backText',
                                              {
                                                label: r.unref(v),
                                                pager: e.pager,
                                                form$: r.unref(d),
                                              },
                                              () => {
                                                var t
                                                return [
                                                  (
                                                    null == (t = r.unref(m))
                                                      ? void 0
                                                      : t.backText
                                                  )
                                                    ? (r.openBlock(),
                                                      r.createBlock(
                                                        r.resolveDynamicComponent(
                                                          r.unref(m).backText
                                                        ),
                                                        {
                                                          key: 0,
                                                          label: r.unref(v),
                                                          pager: e.pager,
                                                          form$: r.unref(d),
                                                        },
                                                        null,
                                                        8,
                                                        [
                                                          'label',
                                                          'pager',
                                                          'form$',
                                                        ]
                                                      ))
                                                    : (r.openBlock(),
                                                      r.createElementBlock(
                                                        r.Fragment,
                                                        { key: 1 },
                                                        [
                                                          r.createTextVNode(
                                                            r.toDisplayString(
                                                              r.unref(v)
                                                            ),
                                                            1
                                                          ),
                                                        ],
                                                        64
                                                      )),
                                                ]
                                              }
                                            ),
                                          ]),
                                          _: 3,
                                        },
                                        16,
                                        [
                                          'disabled',
                                          'class',
                                          'aria-disabled',
                                          'onClick',
                                        ]
                                      )),
                                ]
                              }
                            )
                          : r.createCommentVNode('', !0),
                        e.pager.nextPage
                          ? r.renderSlot(
                              t.$slots,
                              'next',
                              r.mergeProps(
                                {
                                  key: 1,
                                  label: r.unref(h),
                                  form$: r.unref(d),
                                  pager: e.pager,
                                  loading: r.unref(g),
                                  ariaBusy: r.unref(g),
                                  ariaDisabled: r.unref(g),
                                  disabled: r.unref(g),
                                  next: e.pager.next,
                                  class: r.unref(i).next,
                                },
                                r.unref(l).next
                              ),
                              () => {
                                var n
                                return [
                                  (null == (n = r.unref(m)) ? void 0 : n.next)
                                    ? (r.openBlock(),
                                      r.createBlock(
                                        r.resolveDynamicComponent(
                                          r.unref(m).next
                                        ),
                                        r.mergeProps(
                                          {
                                            key: 0,
                                            label: r.unref(h),
                                            form$: r.unref(d),
                                            pager: e.pager,
                                            loading: r.unref(g),
                                            disabled: r.unref(g),
                                            next: e.pager.next,
                                            class: r.unref(i).next,
                                          },
                                          r.unref(l).next
                                        ),
                                        null,
                                        16,
                                        [
                                          'label',
                                          'form$',
                                          'pager',
                                          'loading',
                                          'disabled',
                                          'next',
                                          'class',
                                        ]
                                      ))
                                    : (r.openBlock(),
                                      r.createBlock(
                                        a,
                                        r.mergeProps(
                                          {
                                            key: 1,
                                            fluid: '',
                                            severity: 'primary',
                                            disabled: r.unref(g),
                                            class: r.unref(i).next,
                                            'aria-busy': r.unref(g),
                                            'aria-disabled': r.unref(g),
                                            'aria-describedby': r.unref(y),
                                          },
                                          r.unref(l).next,
                                          { onClick: e.pager.next }
                                        ),
                                        {
                                          default: r.withCtx(() => [
                                            r.renderSlot(
                                              t.$slots,
                                              'nextText',
                                              {
                                                label: r.unref(h),
                                                pager: e.pager,
                                                form$: r.unref(d),
                                              },
                                              () => {
                                                var t
                                                return [
                                                  (
                                                    null == (t = r.unref(m))
                                                      ? void 0
                                                      : t.nextText
                                                  )
                                                    ? (r.openBlock(),
                                                      r.createBlock(
                                                        r.resolveDynamicComponent(
                                                          r.unref(m).nextText
                                                        ),
                                                        {
                                                          key: 0,
                                                          label: r.unref(h),
                                                          pager: e.pager,
                                                          form$: r.unref(d),
                                                        },
                                                        null,
                                                        8,
                                                        [
                                                          'label',
                                                          'pager',
                                                          'form$',
                                                        ]
                                                      ))
                                                    : (r.openBlock(),
                                                      r.createElementBlock(
                                                        r.Fragment,
                                                        { key: 1 },
                                                        [
                                                          r.createTextVNode(
                                                            r.toDisplayString(
                                                              r.unref(h)
                                                            ),
                                                            1
                                                          ),
                                                        ],
                                                        64
                                                      )),
                                                ]
                                              }
                                            ),
                                          ]),
                                          _: 3,
                                        },
                                        16,
                                        [
                                          'disabled',
                                          'class',
                                          'aria-busy',
                                          'aria-disabled',
                                          'aria-describedby',
                                          'onClick',
                                        ]
                                      )),
                                ]
                              }
                            )
                          : r.createCommentVNode('', !0),
                        e.pager.nextPage
                          ? r.createCommentVNode('', !0)
                          : r.renderSlot(
                              t.$slots,
                              'finish',
                              r.mergeProps(
                                {
                                  key: 2,
                                  label: r.unref(b),
                                  form$: r.unref(d),
                                  pager: e.pager,
                                  loading: r.unref(g),
                                  ariaBusy: r.unref(g),
                                  ariaDisabled: r.unref(g),
                                  disabled: r.unref(g),
                                  finish: e.pager.finish,
                                  class: r.unref(i).finish,
                                },
                                r.unref(l).finish
                              ),
                              () => {
                                var n
                                return [
                                  (null == (n = r.unref(m)) ? void 0 : n.finish)
                                    ? (r.openBlock(),
                                      r.createBlock(
                                        r.resolveDynamicComponent(
                                          r.unref(m).finish
                                        ),
                                        r.mergeProps(
                                          {
                                            key: 0,
                                            label: r.unref(b),
                                            form$: r.unref(d),
                                            pager: e.pager,
                                            loading: r.unref(g),
                                            disabled: r.unref(g),
                                            finish: e.pager.finish,
                                            class: r.unref(i).finish,
                                          },
                                          r.unref(l).finish
                                        ),
                                        null,
                                        16,
                                        [
                                          'label',
                                          'form$',
                                          'pager',
                                          'loading',
                                          'disabled',
                                          'finish',
                                          'class',
                                        ]
                                      ))
                                    : (r.openBlock(),
                                      r.createBlock(
                                        a,
                                        r.mergeProps(
                                          {
                                            key: 1,
                                            fluid: '',
                                            severity: 'primary',
                                            disabled: r.unref(g),
                                            class: r.unref(i).finish,
                                            'aria-busy': r.unref(g),
                                            'aria-disabled': r.unref(g),
                                            'aria-describedby': r.unref(y),
                                          },
                                          r.unref(l).finish,
                                          { onClick: e.pager.finish }
                                        ),
                                        {
                                          default: r.withCtx(() => [
                                            r.renderSlot(
                                              t.$slots,
                                              'finishText',
                                              {
                                                label: r.unref(b),
                                                pager: e.pager,
                                                form$: r.unref(d),
                                              },
                                              () => {
                                                var t
                                                return [
                                                  (
                                                    null == (t = r.unref(m))
                                                      ? void 0
                                                      : t.finishText
                                                  )
                                                    ? (r.openBlock(),
                                                      r.createBlock(
                                                        r.resolveDynamicComponent(
                                                          r.unref(m).finishText
                                                        ),
                                                        {
                                                          key: 0,
                                                          label: r.unref(b),
                                                          pager: e.pager,
                                                          form$: r.unref(d),
                                                        },
                                                        null,
                                                        8,
                                                        [
                                                          'label',
                                                          'pager',
                                                          'form$',
                                                        ]
                                                      ))
                                                    : (r.openBlock(),
                                                      r.createElementBlock(
                                                        r.Fragment,
                                                        { key: 1 },
                                                        [
                                                          r.createTextVNode(
                                                            r.toDisplayString(
                                                              r.unref(b)
                                                            ),
                                                            1
                                                          ),
                                                        ],
                                                        64
                                                      )),
                                                ]
                                              }
                                            ),
                                          ]),
                                          _: 3,
                                        },
                                        16,
                                        [
                                          'disabled',
                                          'class',
                                          'aria-busy',
                                          'aria-disabled',
                                          'aria-describedby',
                                          'onClick',
                                        ]
                                      )),
                                ]
                              }
                            ),
                        e.pager.invalid || e.pager.loading
                          ? (r.openBlock(),
                            r.createElementBlock(
                              'span',
                              r.mergeProps(
                                {
                                  key: 3,
                                  class: 'sr-only',
                                  role: 'status',
                                  id: r.unref(k),
                                },
                                r.unref(l).srOnlyLoading
                              ),
                              [
                                e.pager.loading
                                  ? (r.openBlock(),
                                    r.createElementBlock(
                                      r.Fragment,
                                      { key: 0 },
                                      [
                                        r.createTextVNode(
                                          r.toDisplayString(
                                            r.unref(c).sr_step_error
                                          ),
                                          1
                                        ),
                                      ],
                                      64
                                    ))
                                  : e.pager.invalid
                                    ? (r.openBlock(),
                                      r.createElementBlock(
                                        r.Fragment,
                                        { key: 1 },
                                        [
                                          r.createTextVNode(
                                            r.toDisplayString(
                                              r.unref(c).sr_step_error
                                            ),
                                            1
                                          ),
                                        ],
                                        64
                                      ))
                                    : r.createCommentVNode('', !0),
                              ],
                              16,
                              Gt
                            ))
                          : r.createCommentVNode('', !0),
                      ],
                      16
                    )),
              ]
            )
          }
        )
      },
    }),
    Yt = {
      type: 'radio',
      submit: !0,
      bail: !0,
      maxErrors: 1,
      radioValue: !0,
      modelValue: null,
      conditions: void 0,
      showRequired: void 0,
      untrackOn: () => ['input'],
    },
    Zt = ve((e, t) => {
      const n = je(e, t, [nr, vr, gr, ar]),
        {
          path: a,
          container: o,
          helpId: l,
          hintId: s,
          errorId: i,
          labelId: u,
          text: d,
          children: c,
        } = n,
        p = Te(),
        f = te(),
        m = r.ref(),
        {
          value: v,
          model: g,
          initialModel: y,
          payload: h,
          dataPath: b,
          nullValue: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          update: L,
          reset: q,
          clear: H,
          validate: z,
          validateSelf: W,
          validateChildren: U,
          unvalidate: G,
          invalidate: K,
          clean: Y,
          clearErrors: Z,
          clearMessages: X,
          clearMessageBag: J,
          filled: Q,
          handleInput: ee,
          reinit: re,
        } = wr({ props: e, deps: n, events: t }),
        {
          tracking: ne,
          track: ae,
          untrack: oe,
        } = hr({ props: e, deps: { ...n, model: g, update: L }, events: t }),
        le = r.computed(() => {
          var r, t, n, a
          return {
            describedby:
              (null == (r = e.aria) ? void 0 : r.describedby) ||
              [
                (null == d ? void 0 : d.value) && e.label ? u.value : null,
                e.help ? l.value : null,
                e.hint ? s.value : null,
                F.value ? i.value : null,
              ]
                .filter((e) => !!e)
                .join(' ') ||
              void 0,
            invalid:
              (null == (t = e.aria) ? void 0 : t.invalid) ??
              (F.value || void 0),
            required:
              (null == (n = e.aria) ? void 0 : n.required) ??
              (w.value || void 0),
            busy:
              (null == (a = e.aria) ? void 0 : a.busy) ?? (S.value || void 0),
          }
        }),
        se = p('radio-name', r.toRef(e, 'radioName'), f),
        ie = r.computed(
          () => se.value || ('radios' === o.type ? o.path.value : a.value)
        )
      return (
        mr({ container: o, children: c }),
        {
          ...n,
          ...t,
          input: m,
          inputName: ie,
          aria: le,
          value: v,
          model: g,
          initialModel: y,
          payload: h,
          dataPath: b,
          nullValue: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          update: L,
          reset: q,
          clear: H,
          validate: z,
          validateSelf: W,
          validateChildren: U,
          unvalidate: G,
          invalidate: K,
          clean: Y,
          clearErrors: Z,
          clearMessages: X,
          clearMessageBag: J,
          filled: Q,
          handleInput: ee,
          reinit: re,
          tracking: ne,
          track: ae,
          untrack: oe,
        }
      )
    }),
    Xt = [
      'name',
      'value',
      'id',
      'disabled',
      'aria-describedby',
      'aria-invalid',
      'aria-required',
    ],
    Jt = ['for'],
    Qt = ['for'],
    en = r.defineComponent({
      name: 'VfRadio',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfRadio',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: { type: [String, Number, Boolean, null] },
        default: { type: [String, Number, Boolean, null] },
        radioValue: { type: [String, Number, Boolean, null] },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        text: { type: [String, Object, Function] },
        radioName: { type: [String, Object, Function] },
        align: {},
        inline: { type: Boolean },
        aria: {},
        as: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        untrackOn: {},
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
      },
      emits: [
        'input',
        'blur',
        'focus',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Yt),
          l = be(o),
          s = Zt(o, a),
          i = he('VfRadio', () => ({
            root: 'vf-radio',
            wrapper: {
              'vf-choice-wrapper': !0,
              'vf-left': 'left' === o.align,
              'vf-right': 'right' === o.align,
              'vf-success': s.success.value,
              'vf-danger': s.hasError.value,
              'vf-disabled': s.disabled.value,
              'vf-focused': s.focused.value,
            },
            input: 'vf-choice-input',
            text: 'vf-choice-text',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { radioValue: d } = _e(o, ['radioValue']),
          {
            value: c,
            id: p,
            disabled: f,
            viewLoaded: m,
            template: v,
            aria: g,
            inputName: y,
            text: h,
            input: b,
            genericName: k,
            slots: B,
            handleBlur: w,
            handleFocus: x,
            handleInput: $,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(m)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(v)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(v)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1, label: !1 },
                          {
                            default: r.withCtx(() => [
                              r.renderSlot(
                                e.$slots,
                                'default',
                                r.mergeProps(
                                  {
                                    model: r.unref(c),
                                    value: r.unref(d),
                                    aria: r.unref(g),
                                    inputName: r.unref(y),
                                    id: r.unref(p),
                                    disabled: r.unref(f),
                                    input: r.unref(b),
                                    text: r.unref(h),
                                    handleBlur: r.unref(w),
                                    handleFocus: r.unref(x),
                                    handleInput: r.unref($),
                                    class: r.unref(i).wrapper,
                                  },
                                  r.unref(l).wrapper
                                ),
                                () => {
                                  var n
                                  return [
                                    (
                                      null == (n = r.unref(B))
                                        ? void 0
                                        : n.default
                                    )
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(B).default
                                          ),
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              model: r.unref(c),
                                              value: r.unref(d),
                                              aria: r.unref(g),
                                              'input-name': r.unref(y),
                                              id: r.unref(p),
                                              disabled: r.unref(f),
                                              input: r.unref(b),
                                              text: r.unref(h),
                                              'handle-blur': r.unref(w),
                                              'handle-focus': r.unref(x),
                                              'handle-input': r.unref($),
                                              class: r.unref(i).wrapper,
                                            },
                                            r.unref(l).wrapper
                                          ),
                                          null,
                                          16,
                                          [
                                            'model',
                                            'value',
                                            'aria',
                                            'input-name',
                                            'id',
                                            'disabled',
                                            'input',
                                            'text',
                                            'handle-blur',
                                            'handle-focus',
                                            'handle-input',
                                            'class',
                                          ]
                                        ))
                                      : (r.openBlock(),
                                        r.createElementBlock(
                                          'div',
                                          r.mergeProps(
                                            {
                                              key: 1,
                                              class: r.unref(i).wrapper,
                                            },
                                            r.unref(l).wrapper
                                          ),
                                          [
                                            r.withDirectives(
                                              r.createElementVNode(
                                                'input',
                                                r.mergeProps(
                                                  {
                                                    'onUpdate:modelValue':
                                                      t[0] ||
                                                      (t[0] = (e) =>
                                                        r.isRef(c)
                                                          ? (c.value = e)
                                                          : null),
                                                    type: 'radio',
                                                    class: r.unref(i).input,
                                                    name: r.unref(y),
                                                    value: r.unref(d),
                                                    id: r.unref(p),
                                                    disabled: r.unref(f),
                                                    'aria-describedby':
                                                      r.unref(g).describedby,
                                                    'aria-invalid':
                                                      r.unref(g).invalid,
                                                    'aria-required':
                                                      r.unref(g).required,
                                                  },
                                                  r.unref(l).input,
                                                  {
                                                    ref_key: 'input',
                                                    ref: b,
                                                    onBlur:
                                                      t[1] ||
                                                      (t[1] = (...e) =>
                                                        r.unref(w) &&
                                                        r.unref(w)(...e)),
                                                    onFocus:
                                                      t[2] ||
                                                      (t[2] = (...e) =>
                                                        r.unref(x) &&
                                                        r.unref(x)(...e)),
                                                  }
                                                ),
                                                null,
                                                16,
                                                Xt
                                              ),
                                              [[r.vModelRadio, r.unref(c)]]
                                            ),
                                            r.renderSlot(
                                              e.$slots,
                                              'text',
                                              r.mergeProps(
                                                {
                                                  text: r.unref(h),
                                                  id: r.unref(p),
                                                  genericName: r.unref(k),
                                                  class: r.unref(i).text,
                                                },
                                                r.unref(l).text
                                              ),
                                              () => {
                                                var e
                                                return [
                                                  (
                                                    null == (e = r.unref(B))
                                                      ? void 0
                                                      : e.text
                                                  )
                                                    ? (r.openBlock(),
                                                      r.createBlock(
                                                        r.resolveDynamicComponent(
                                                          r.unref(B).text
                                                        ),
                                                        r.mergeProps(
                                                          {
                                                            key: 0,
                                                            text: r.unref(h),
                                                            id: r.unref(p),
                                                            'generic-name':
                                                              r.unref(k),
                                                            class:
                                                              r.unref(i).text,
                                                          },
                                                          r.unref(l).text
                                                        ),
                                                        null,
                                                        16,
                                                        [
                                                          'text',
                                                          'id',
                                                          'generic-name',
                                                          'class',
                                                        ]
                                                      ))
                                                    : r.unref(h)
                                                      ? (r.openBlock(),
                                                        r.createElementBlock(
                                                          'label',
                                                          r.mergeProps(
                                                            {
                                                              key: 1,
                                                              class:
                                                                r.unref(i).text,
                                                              for: r.unref(p),
                                                            },
                                                            r.unref(l).text
                                                          ),
                                                          r.toDisplayString(
                                                            r.unref(h)
                                                          ),
                                                          17,
                                                          Jt
                                                        ))
                                                      : (r.openBlock(),
                                                        r.createElementBlock(
                                                          'label',
                                                          {
                                                            key: 2,
                                                            class: 'sr-only',
                                                            for: r.unref(p),
                                                          },
                                                          r.toDisplayString(
                                                            r.unref(k)
                                                          ),
                                                          9,
                                                          Qt
                                                        )),
                                                ]
                                              }
                                            ),
                                          ],
                                          16
                                        )),
                                  ]
                                }
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    rn = {
      type: 'radios',
      submit: !0,
      bail: !0,
      maxErrors: 1,
      conditions: void 0,
      showRequired: void 0,
    },
    tn = ve((e, t) => {
      const n = je(e, t, [nr, vr, ar]),
        {
          available: a,
          path: o,
          container: l,
          children: s,
          visible: i,
          help: u,
          hint: d,
          helpId: c,
          hintId: p,
          errorId: f,
          id: m,
        } = n,
        {
          value: v,
          model: g,
          initialModel: y,
          payload: h,
          dataPath: b,
          nullValue: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          shouldValidate: L,
          update: q,
          reset: H,
          clear: z,
          validate: W,
          validateSelf: U,
          validateChildren: G,
          unvalidate: K,
          invalidate: Y,
          clean: Z,
          clearErrors: X,
          clearMessages: J,
          clearMessageBag: Q,
          filled: ee,
          handleInput: re,
          reinit: te,
        } = wr({ props: e, deps: n, events: t }),
        { items: ne } = Ar({
          props: e,
          deps: { path: o, container: l, model: g, dataPath: b },
        }),
        { aria: ae } = Vr({
          props: e,
          deps: {
            help: u,
            hint: d,
            helpId: c,
            hintId: p,
            errorId: f,
            hasError: F,
            busy: S,
            required: w,
          },
        }),
        oe = r.computed(() => ({
          invalid: B.value,
          required: w.value,
          describedby: F.value ? f.value : void 0,
        }))
      return (
        mr({
          type: 'radios',
          id: m,
          available: a,
          visible: i,
          path: o,
          dataPath: b,
          children: s,
          container: l,
          model: r.computed(() =>
            null === g.value || void 0 === g.value ? {} : { [g.value]: !0 }
          ),
          register(e, r) {
            ;(s.register(r, e), l.register(e, r))
          },
          unregister(e) {
            ;(s.unregister(e), l.unregister(e))
          },
          update(e, r) {
            ;(l.update(b.value, yr(r ? e.split('.').slice(-1)[0] : r)),
              L.value && W())
          },
        }),
        {
          ...n,
          ...t,
          items: ne,
          radioAria: oe,
          aria: ae,
          value: v,
          model: g,
          initialModel: y,
          payload: h,
          dataPath: b,
          nullValue: k,
          invalid: B,
          required: w,
          dirty: x,
          pending: $,
          debouncing: C,
          busy: S,
          validated: E,
          completed: _,
          success: O,
          empty: A,
          numeric: V,
          hoisted: P,
          errors: D,
          hasError: F,
          displayErrors: j,
          ownErrors: R,
          formErrors: T,
          messages: M,
          messageBag: N,
          ruleMessages: I,
          update: q,
          reset: H,
          clear: z,
          validate: W,
          validateSelf: U,
          validateChildren: G,
          unvalidate: K,
          invalidate: Y,
          clean: Z,
          clearErrors: X,
          clearMessages: J,
          clearMessageBag: Q,
          filled: ee,
          handleInput: re,
          reinit: te,
        }
      )
    }),
    nn = r.defineComponent({
      name: 'VfRadios',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfRadios',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        default: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        items: {},
        stacked: { type: Boolean },
        aria: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        heading: {},
      },
      emits: [
        'blur',
        'focus',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, rn),
          l = be(o),
          s = tn(o, a),
          i = he('VfRadios', () => ({
            root: 'vf-radios vf-choices',
            group: { 'vf-choices-group': !0, 'vf-stacked': o.stacked },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          {
            items: d,
            viewLoaded: c,
            template: p,
            path: f,
            radioAria: m,
            disabled: v,
            label: g,
            slots: y,
            handleFocus: h,
            handleBlur: b,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfRadio'),
              a = r.resolveComponent('VfLayout')
            return r.unref(c)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(p)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(p)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          a,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.createElementVNode(
                                'div',
                                r.mergeProps(
                                  {
                                    class: r.unref(i).group,
                                    onFocusin:
                                      t[0] ||
                                      (t[0] = (...e) =>
                                        r.unref(h) && r.unref(h)(...e)),
                                    onFocusout:
                                      t[1] ||
                                      (t[1] = (...e) =>
                                        r.unref(b) && r.unref(b)(...e)),
                                  },
                                  r.unref(l).group
                                ),
                                [
                                  r.renderSlot(
                                    e.$slots,
                                    'default',
                                    {
                                      items: r.unref(d),
                                      radioName: r.unref(f),
                                      disabled: r.unref(v),
                                      label: r.unref(g),
                                    },
                                    () => {
                                      var t
                                      return [
                                        (
                                          null == (t = r.unref(y))
                                            ? void 0
                                            : t.default
                                        )
                                          ? (r.openBlock(),
                                            r.createBlock(
                                              r.resolveDynamicComponent(
                                                r.unref(y).default
                                              ),
                                              {
                                                key: 0,
                                                items: r.unref(d),
                                                'radio-name': r.unref(f),
                                                disabled: r.unref(v),
                                                label: r.unref(g),
                                              },
                                              null,
                                              8,
                                              [
                                                'items',
                                                'radio-name',
                                                'disabled',
                                                'label',
                                              ]
                                            ))
                                          : (r.openBlock(!0),
                                            r.createElementBlock(
                                              r.Fragment,
                                              { key: 1 },
                                              r.renderList(r.unref(d), (t) => {
                                                var a, o, s, i
                                                return (
                                                  r.openBlock(),
                                                  r.createBlock(
                                                    n,
                                                    r.mergeProps(
                                                      {
                                                        name: t.value,
                                                        text: t.label,
                                                        'radio-name':
                                                          r.unref(f),
                                                        disabled:
                                                          r.unref(v) ||
                                                          t.disabled,
                                                        conditions:
                                                          t.conditions,
                                                        aria: r.unref(m),
                                                        inline: '',
                                                      },
                                                      { ref_for: !0 },
                                                      null ==
                                                        (o = (a = r.unref(l))
                                                          .VfRadio)
                                                        ? void 0
                                                        : o.call(a, t)
                                                    ),
                                                    r.createSlots({ _: 2 }, [
                                                      (
                                                        null == (s = r.unref(y))
                                                          ? void 0
                                                          : s.radio
                                                      )
                                                        ? {
                                                            name: 'default',
                                                            fn: r.withCtx(
                                                              (t) => [
                                                                r.renderSlot(
                                                                  e.$slots,
                                                                  'radio',
                                                                  r.mergeProps(
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    t
                                                                  ),
                                                                  () => [
                                                                    (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          y
                                                                        ).radio
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        t
                                                                      ),
                                                                      null,
                                                                      16
                                                                    )),
                                                                  ]
                                                                ),
                                                              ]
                                                            ),
                                                            key: '0',
                                                          }
                                                        : void 0,
                                                      (
                                                        null == (i = r.unref(y))
                                                          ? void 0
                                                          : i.text
                                                      )
                                                        ? {
                                                            name: 'text',
                                                            fn: r.withCtx(
                                                              (t) => [
                                                                r.renderSlot(
                                                                  e.$slots,
                                                                  'text',
                                                                  r.mergeProps(
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    t
                                                                  ),
                                                                  () => [
                                                                    (r.openBlock(),
                                                                    r.createBlock(
                                                                      r.resolveDynamicComponent(
                                                                        r.unref(
                                                                          y
                                                                        ).text
                                                                      ),
                                                                      r.mergeProps(
                                                                        {
                                                                          ref_for:
                                                                            !0,
                                                                        },
                                                                        t
                                                                      ),
                                                                      null,
                                                                      16
                                                                    )),
                                                                  ]
                                                                ),
                                                              ]
                                                            ),
                                                            key: '1',
                                                          }
                                                        : void 0,
                                                    ]),
                                                    1040,
                                                    [
                                                      'name',
                                                      'text',
                                                      'radio-name',
                                                      'disabled',
                                                      'conditions',
                                                      'aria',
                                                    ]
                                                  )
                                                )
                                              }),
                                              256
                                            )),
                                      ]
                                    }
                                  ),
                                ],
                                16
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    an = { align: 'left', valign: 'baseline' },
    on = ve((e, t) => {
      const n = ft(),
        a = Y().uid
      if (!n)
        throw new Error('<VfRow> must be used inside a <VfGrid> component')
      const { template: o, slots: l } = fe(e),
        s = r.computed(() => [...n.inlineGrid.value.keys()].indexOf(a)),
        i = r.computed(() => {
          var e
          return (
            (null == (e = n.inlineGrid.value.get(a))
              ? void 0
              : e.map((e) => e[0])) || []
          )
        })
      var u
      return (
        (u = { ...n, row: s, cols: i }),
        Rr(u),
        { uid: a, row: s, cols: i, template: o, slots: l }
      )
    }),
    ln = ['data-row-id'],
    sn = r.defineComponent({
      name: 'VfRow',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfRow',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        colspan: {},
        rowspan: {},
        align: {},
        valign: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, an),
          l = be(o),
          s = on(o, a),
          i = he('VfRow', () => ({ root: 'vf-grid-row' })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { template: d, slots: c, uid: p } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(d)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(d)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'div',
                    r.mergeProps(
                      {
                        key: 1,
                        class: r.unref(i).root,
                        'data-row-id': r.unref(p),
                      },
                      r.unref(l).root
                    ),
                    [
                      r.renderSlot(e.$slots, 'default', {}, () => {
                        var e
                        return [
                          (null == (e = r.unref(c)) ? void 0 : e.default)
                            ? (r.openBlock(),
                              r.createBlock(
                                r.resolveDynamicComponent(r.unref(c).default),
                                { key: 0 }
                              ))
                            : r.createCommentVNode('', !0),
                        ]
                      }),
                    ],
                    16,
                    ln
                  )),
            ])
        )
      },
    })
  function un({ props: e }) {
    const t = te()
    return {
      placeholder: Te()(
        'placeholder',
        r.toRef(() => e.placeholder),
        t,
        !0
      ),
    }
  }
  const dn = {
      type: 'select',
      multiple: !1,
      labelProp: 'label',
      valueProp: 'value',
      disabled: !1,
      debounce: 0,
      submit: !0,
      bail: !0,
      maxErrors: 1,
      default: null,
      conditions: void 0,
      showRequired: void 0,
      untrackOn: () => ['input'],
    },
    cn = ve((e, t) => {
      const n = je(e, t, [nr, lr, ar, vr, un]),
        { fire: a } = t,
        { container: o, children: l } = n,
        s = te(),
        i = r.ref(),
        {
          value: u,
          model: d,
          initialModel: c,
          payload: p,
          dataPath: f,
          nullValue: m,
          invalid: v,
          required: g,
          dirty: y,
          pending: h,
          debouncing: b,
          busy: k,
          validated: B,
          completed: w,
          success: x,
          empty: $,
          numeric: C,
          hoisted: S,
          errors: E,
          hasError: _,
          displayErrors: O,
          ownErrors: A,
          formErrors: V,
          messages: P,
          messageBag: D,
          ruleMessages: F,
          shouldValidate: j,
          update: R,
          reset: T,
          clear: M,
          validate: N,
          validateSelf: I,
          validateChildren: L,
          unvalidate: q,
          invalidate: H,
          clean: z,
          clearErrors: W,
          clearMessages: U,
          clearMessageBag: G,
          filled: K,
          reinit: Y,
        } = wr({
          props: e,
          deps: n,
          events: t,
          handleInput: r.toRef(() => ee),
        }),
        {
          tracking: Z,
          track: X,
          untrack: J,
        } = hr({ props: e, deps: { ...n, model: d, update: R }, events: t }),
        { items: Q } = Ar({
          props: e,
          deps: { path: n.path, container: o, model: d, dataPath: f },
          multiple: r.toRef(() => e.multiple),
        })
      function ee(r) {
        if (r instanceof Event) {
          const t = r.target,
            n = e.multiple
              ? Array.from(t.selectedOptions, (e) => e.value)
              : t.value
          ;(a('input', r, s), R(n))
        } else (a('input', r, s), R(r))
        j.value && N()
      }
      const { aria: re } = Vr({
        props: e,
        deps: { ...n, hasError: _, busy: k, required: g },
      })
      return (
        mr({ container: o, children: l }),
        {
          ...n,
          ...t,
          items: Q,
          input: i,
          aria: re,
          value: u,
          model: d,
          initialModel: c,
          payload: p,
          dataPath: f,
          nullValue: m,
          invalid: v,
          required: g,
          dirty: y,
          pending: h,
          debouncing: b,
          busy: k,
          validated: B,
          completed: w,
          success: x,
          empty: $,
          numeric: C,
          hoisted: S,
          errors: E,
          hasError: _,
          displayErrors: O,
          ownErrors: A,
          formErrors: V,
          messages: P,
          messageBag: D,
          ruleMessages: F,
          update: R,
          reset: T,
          clear: M,
          validate: N,
          validateSelf: I,
          validateChildren: L,
          unvalidate: q,
          invalidate: H,
          clean: z,
          clearErrors: W,
          clearMessages: U,
          clearMessageBag: G,
          filled: K,
          handleInput: ee,
          reinit: Y,
          tracking: Z,
          track: X,
          untrack: J,
        }
      )
    }),
    pn = [
      'name',
      'id',
      'disabled',
      'multiple',
      'aria-labelledby',
      'aria-describedby',
      'aria-invalid',
      'aria-required',
      'aria-busy',
    ],
    fn = ['value'],
    mn = ['value', 'disabled'],
    vn = r.defineComponent({
      name: 'VfSelect',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfSelect',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        modelValue: {},
        default: {},
        items: {},
        multiple: { type: Boolean },
        labelProp: {},
        valueProp: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        placeholder: { type: [String, Object, Function] },
        aria: {},
        as: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        untrackOn: {},
        detached: { type: Boolean },
        transformPayload: { type: Function },
        rules: {},
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        before: { type: [String, Object, Array, Function] },
        after: { type: [String, Object, Array, Function] },
      },
      emits: [
        'input',
        'focus',
        'blur',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, dn),
          l = be(o),
          s = cn(o, a),
          i = he('VfSelect', () => ({
            root: { 'vf-select': !0, 'vf-align-label': !s.help.value },
            inputGroup: 'vf-input-group',
            input: {
              'vf-input': !0,
              'vf-select-input': !0,
              'vf-placeholder': s.empty.value && !!o.placeholder,
              'vf-disabled': s.disabled.value,
              'vf-focused': s.focused.value,
              'vf-success': s.success.value,
              'vf-danger': s.hasError.value,
            },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { multiple: d } = _e(o, ['multiple']),
          {
            value: c,
            id: p,
            placeholder: f,
            viewLoaded: m,
            disabled: v,
            aria: g,
            input: y,
            template: h,
            name: b,
            items: k,
            nullValue: B,
            handleInput: w,
            handleFocus: x,
            handleBlur: $,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(m)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(h)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(h)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.withDirectives(
                                r.createElementVNode(
                                  'select',
                                  r.mergeProps(
                                    {
                                      'onUpdate:modelValue':
                                        t[0] ||
                                        (t[0] = (e) =>
                                          r.isRef(c) ? (c.value = e) : null),
                                      name: r.unref(b),
                                      id: r.unref(p),
                                      class: r.unref(i).input,
                                      disabled: r.unref(v),
                                      multiple: r.unref(d),
                                      'aria-labelledby': r.unref(g).labelledby,
                                      'aria-describedby':
                                        r.unref(g).describedby,
                                      'aria-invalid': r.unref(g).invalid,
                                      'aria-required': r.unref(g).required,
                                      'aria-busy': r.unref(g).busy,
                                    },
                                    r.unref(l).input,
                                    {
                                      ref_key: 'input',
                                      ref: y,
                                      onChange:
                                        t[1] ||
                                        (t[1] = (...e) =>
                                          r.unref(w) && r.unref(w)(...e)),
                                      onBlur:
                                        t[2] ||
                                        (t[2] = (...e) =>
                                          r.unref($) && r.unref($)(...e)),
                                      onFocus:
                                        t[3] ||
                                        (t[3] = (...e) =>
                                          r.unref(x) && r.unref(x)(...e)),
                                    }
                                  ),
                                  [
                                    r.unref(f) && !r.unref(d)
                                      ? (r.openBlock(),
                                        r.createElementBlock(
                                          'option',
                                          {
                                            key: 0,
                                            value: r.unref(B),
                                            disabled: '',
                                          },
                                          r.toDisplayString(r.unref(f)),
                                          9,
                                          fn
                                        ))
                                      : r.createCommentVNode('', !0),
                                    (r.openBlock(!0),
                                    r.createElementBlock(
                                      r.Fragment,
                                      null,
                                      r.renderList(
                                        r.unref(k),
                                        (e) => (
                                          r.openBlock(),
                                          r.createElementBlock(
                                            'option',
                                            {
                                              key: e.value,
                                              value: e.value,
                                              disabled: !!e.disabled,
                                            },
                                            r.toDisplayString(
                                              e.label ?? e.value
                                            ),
                                            9,
                                            mn
                                          )
                                        )
                                      ),
                                      128
                                    )),
                                  ],
                                  16,
                                  pn
                                ),
                                [[r.vModelSelect, r.unref(c)]]
                              ),
                            ]),
                            _: 1,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    gn = { type: 'content', html: !1, conditions: void 0 },
    yn = ve((e, t) => {
      const n = je(e, t, [nr]),
        a = te(),
        o = Te(),
        { make: l } = U(),
        s = l(),
        i = s.errors,
        u = s.messages,
        d = o(
          'content-content',
          r.toRef(() => e.content),
          a
        ),
        c = r.computed(() => 'div')
      return { ...n, ...t, content: d, errors: i, messages: u, tag: c }
    }),
    hn = r.defineComponent({
      name: 'VfContent',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfContent',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        content: { type: [String, Object, Function] },
        html: { type: Boolean },
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, gn),
          l = be(o),
          s = yn(o, a),
          i = he('VfContent', () => ({ root: 'vf-content' })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { viewLoaded: d, template: c, content: p, tag: f, slots: m } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(d)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(c)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(c)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1, label: !1 },
                          {
                            default: r.withCtx(() => [
                              r.renderSlot(
                                e.$slots,
                                'default',
                                { context: r.unref(u) },
                                () => {
                                  var e
                                  return [
                                    (
                                      null == (e = r.unref(m))
                                        ? void 0
                                        : e.default
                                    )
                                      ? (r.openBlock(),
                                        r.createBlock(
                                          r.resolveDynamicComponent(
                                            r.unref(m).default
                                          ),
                                          { key: 0, context: r.unref(u) },
                                          null,
                                          8,
                                          ['context']
                                        ))
                                      : r.unref(o).html
                                        ? (r.openBlock(),
                                          r.createBlock(
                                            r.resolveDynamicComponent(
                                              r.unref(f)
                                            ),
                                            { key: 1, innerHTML: r.unref(p) },
                                            null,
                                            8,
                                            ['innerHTML']
                                          ))
                                        : (r.openBlock(),
                                          r.createBlock(
                                            r.resolveDynamicComponent(() =>
                                              r.unref(p)
                                            ),
                                            { key: 2 }
                                          )),
                                  ]
                                }
                              ),
                            ]),
                            _: 3,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    bn = {},
    kn = ve((e, r) => {
      const { template: t, slots: n } = fe(e)
      return { template: t, slots: n }
    }),
    Bn = [
      'id',
      'aria-disabled',
      'aria-selected',
      'aria-current',
      'aria-controls',
      'tabindex',
      'onClick',
      'onKeydown',
      'onFocus',
      'onBlur',
    ],
    wn = r.defineComponent({
      name: 'VfSteps',
      type: 'form-component',
      inheritAttrs: !1,
      __name: 'VfSteps',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        pager: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, bn),
          l = be(o),
          s = kn(o, a),
          i = he('VfSteps', () => ({
            root: 'vf-steps',
            list: 'vf-steps-wrapper',
            wrapper: ({
              selected: e,
              enabled: r,
              completed: t,
              invalid: n,
              loading: a,
            }) => [
              'vf-step-wrapper',
              {
                'vf-selected': e,
                'vf-enabled': r,
                'vf-completed': t,
                'vf-invalid': n,
                'vf-loading': a,
              },
            ],
            step: 'vf-step',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { template: d, slots: c } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (t, n) =>
            r.renderSlot(t.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(d)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(d)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'div',
                    { key: 1, class: r.normalizeClass(r.unref(i).root) },
                    [
                      r.createElementVNode(
                        'ol',
                        r.mergeProps(
                          { class: r.unref(i).list, role: 'tablist' },
                          r.unref(l).list
                        ),
                        [
                          (r.openBlock(!0),
                          r.createElementBlock(
                            r.Fragment,
                            null,
                            r.renderList(e.pager.pages, (e) => {
                              var n, a
                              return (
                                r.openBlock(),
                                r.createElementBlock(
                                  r.Fragment,
                                  null,
                                  [
                                    e.available
                                      ? (r.openBlock(),
                                        r.createElementBlock(
                                          'li',
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              class: r.unref(i).wrapper(e),
                                              role: 'none',
                                            },
                                            { ref_for: !0 },
                                            null ==
                                              (a = (n = r.unref(l)).wrapper)
                                              ? void 0
                                              : a.call(n, e)
                                          ),
                                          [
                                            r.createElementVNode(
                                              'button',
                                              r.mergeProps(
                                                {
                                                  type: 'button',
                                                  class: r.unref(i).step,
                                                  id: e.pageId,
                                                  role: 'tab',
                                                  'aria-disabled': !e.enabled,
                                                  'aria-selected': e.selected,
                                                  'aria-current': e.selected,
                                                  'aria-controls': e.panelId,
                                                  tabindex: e.tabindex,
                                                },
                                                { ref_for: !0 },
                                                r.unref(l).step,
                                                {
                                                  onClick: e.select,
                                                  onKeydown: e.keydown,
                                                  onFocus: e.focus,
                                                  onBlur: e.blur,
                                                }
                                              ),
                                              [
                                                r.renderSlot(
                                                  t.$slots,
                                                  'default',
                                                  r.mergeProps(
                                                    { ref_for: !0 },
                                                    e
                                                  ),
                                                  () => {
                                                    var t
                                                    return [
                                                      (
                                                        null == (t = r.unref(c))
                                                          ? void 0
                                                          : t.default
                                                      )
                                                        ? (r.openBlock(),
                                                          r.createBlock(
                                                            r.resolveDynamicComponent(
                                                              r.unref(c).default
                                                            ),
                                                            r.mergeProps(
                                                              {
                                                                key: 0,
                                                                ref_for: !0,
                                                              },
                                                              e
                                                            ),
                                                            null,
                                                            16
                                                          ))
                                                        : (r.openBlock(),
                                                          r.createElementBlock(
                                                            r.Fragment,
                                                            { key: 1 },
                                                            [
                                                              r.createTextVNode(
                                                                r.toDisplayString(
                                                                  e.label
                                                                ),
                                                                1
                                                              ),
                                                            ],
                                                            64
                                                          )),
                                                    ]
                                                  }
                                                ),
                                              ],
                                              16,
                                              Bn
                                            ),
                                          ],
                                          16
                                        ))
                                      : r.createCommentVNode('', !0),
                                  ],
                                  64
                                )
                              )
                            }),
                            256
                          )),
                        ],
                        16
                      ),
                    ],
                    2
                  )),
            ])
        )
      },
    }),
    xn = {},
    $n = ve((e, r) => {
      const { template: t, slots: n } = fe(e)
      return { template: t, slots: n }
    }),
    Cn = [
      'id',
      'aria-selected',
      'aria-current',
      'aria-controls',
      'tabindex',
      'onClick',
      'onKeydown',
      'onFocus',
      'onBlur',
    ],
    Sn = r.defineComponent({
      name: 'VfTabs',
      type: 'form-component',
      __name: 'VfTabs',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        pager: {},
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
      },
      emits: [
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, xn),
          l = be(o),
          s = $n(o, a),
          i = he('VfTabs', () => ({
            root: 'vf-tabs',
            list: 'vf-tabs-wrapper',
            wrapper: ({ selected: e, invalid: r }) => [
              'vf-tab-wrapper',
              { 'vf-selected': e, 'vf-invalid': r },
            ],
            tab: 'vf-tab',
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { template: d, slots: c } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (t, n) =>
            r.renderSlot(t.$slots, 'template', { context: r.unref(u) }, () => [
              r.unref(d)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(d)),
                    { key: 0, context: r.unref(u) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'div',
                    r.mergeProps(
                      { key: 1, class: r.unref(i).root },
                      r.unref(l).root
                    ),
                    [
                      r.createElementVNode(
                        'ul',
                        r.mergeProps(
                          { class: r.unref(i).list, role: 'tablist' },
                          r.unref(l).list
                        ),
                        [
                          (r.openBlock(!0),
                          r.createElementBlock(
                            r.Fragment,
                            null,
                            r.renderList(e.pager.pages, (e) => {
                              var n, a
                              return (
                                r.openBlock(),
                                r.createElementBlock(
                                  r.Fragment,
                                  null,
                                  [
                                    e.available
                                      ? (r.openBlock(),
                                        r.createElementBlock(
                                          'li',
                                          r.mergeProps(
                                            {
                                              key: 0,
                                              class: r.unref(i).wrapper(e),
                                              role: 'none',
                                            },
                                            { ref_for: !0 },
                                            null ==
                                              (a = (n = r.unref(l)).wrapper)
                                              ? void 0
                                              : a.call(n, e)
                                          ),
                                          [
                                            r.createElementVNode(
                                              'button',
                                              r.mergeProps(
                                                {
                                                  type: 'button',
                                                  class: r.unref(i).tab,
                                                  id: e.pageId,
                                                  role: 'tab',
                                                  'aria-selected': e.selected,
                                                  'aria-current': e.selected,
                                                  'aria-controls': e.panelId,
                                                  tabindex: e.tabindex,
                                                },
                                                { ref_for: !0 },
                                                r.unref(l).tab,
                                                {
                                                  onClick: e.select,
                                                  onKeydown: e.keydown,
                                                  onFocus: e.focus,
                                                  onBlur: e.blur,
                                                }
                                              ),
                                              [
                                                r.renderSlot(
                                                  t.$slots,
                                                  'default',
                                                  r.mergeProps(
                                                    { ref_for: !0 },
                                                    e
                                                  ),
                                                  () => {
                                                    var t
                                                    return [
                                                      (
                                                        null == (t = r.unref(c))
                                                          ? void 0
                                                          : t.default
                                                      )
                                                        ? (r.openBlock(),
                                                          r.createBlock(
                                                            r.resolveDynamicComponent(
                                                              r.unref(c).default
                                                            ),
                                                            r.mergeProps(
                                                              {
                                                                key: 0,
                                                                ref_for: !0,
                                                              },
                                                              e
                                                            ),
                                                            null,
                                                            16
                                                          ))
                                                        : (r.openBlock(),
                                                          r.createElementBlock(
                                                            r.Fragment,
                                                            { key: 1 },
                                                            [
                                                              r.createTextVNode(
                                                                r.toDisplayString(
                                                                  e.label
                                                                ),
                                                                1
                                                              ),
                                                            ],
                                                            64
                                                          )),
                                                    ]
                                                  }
                                                ),
                                              ],
                                              16,
                                              Cn
                                            ),
                                          ],
                                          16
                                        ))
                                      : r.createCommentVNode('', !0),
                                  ],
                                  64
                                )
                              )
                            }),
                            256
                          )),
                        ],
                        16
                      ),
                    ],
                    16
                  )),
            ])
        )
      },
    })
  function En({ props: e, deps: t, events: n }) {
    const { helpId: a, hintId: o, errorId: l, children: s, container: i } = t,
      { language: u, languageId: d, translatable: c } = t,
      { fire: p } = n,
      f = te(),
      m = r.ref(),
      {
        value: v,
        model: g,
        initialModel: y,
        payload: h,
        dataPath: b,
        nullValue: k,
        invalid: B,
        required: w,
        dirty: x,
        pending: $,
        debouncing: C,
        busy: S,
        validated: E,
        completed: _,
        success: O,
        empty: A,
        numeric: V,
        hoisted: P,
        errors: D,
        hasError: F,
        displayErrors: j,
        ownErrors: R,
        formErrors: T,
        messages: M,
        messageBag: N,
        ruleMessages: I,
        invalidLanguages: L,
        update: q,
        reset: H,
        clear: z,
        validate: W,
        validateSelf: U,
        validateChildren: G,
        validateCurrent: K,
        unvalidate: Y,
        invalidate: Z,
        clean: X,
        clearErrors: J,
        clearMessages: Q,
        clearMessageBag: ee,
        filled: re,
        handleInput: ne,
        reinit: ae,
      } = wr({ props: e, deps: t, events: n }),
      oe = r.computed(() => {
        var r, t, n, s, i
        return {
          describedby:
            (null == (r = e.aria) ? void 0 : r.describedby) ||
            [
              c.value ? d.value : null,
              e.help ? a.value : null,
              e.hint ? o.value : null,
              F.value ? l.value : null,
            ]
              .filter((e) => !!e)
              .join(' ') ||
            void 0,
          labelledby: null == (t = e.aria) ? void 0 : t.labelledby,
          invalid:
            (null == (n = e.aria) ? void 0 : n.invalid) ?? (F.value || void 0),
          required:
            (null == (s = e.aria) ? void 0 : s.required) ?? (w.value || void 0),
          busy: (null == (i = e.aria) ? void 0 : i.busy) ?? (S.value || void 0),
          lang: c.value ? u.value : void 0,
        }
      })
    return (
      mr({ container: i, children: s }),
      {
        input: m,
        aria: oe,
        value: v,
        model: g,
        initialModel: y,
        payload: h,
        dataPath: b,
        nullValue: k,
        invalid: B,
        required: w,
        dirty: x,
        pending: $,
        debouncing: C,
        busy: S,
        validated: E,
        completed: _,
        success: O,
        empty: A,
        numeric: V,
        hoisted: P,
        errors: D,
        hasError: F,
        displayErrors: j,
        ownErrors: R,
        formErrors: T,
        messages: M,
        messageBag: N,
        ruleMessages: I,
        invalidLanguages: L,
        update: q,
        reset: H,
        clear: z,
        validate: W,
        validateSelf: U,
        validateChildren: G,
        validateCurrent: K,
        unvalidate: Y,
        invalidate: Z,
        clean: X,
        clearErrors: J,
        clearMessages: Q,
        clearMessageBag: ee,
        filled: re,
        handleInput: ne,
        reinit: ae,
        handleKeydown: (e) => p('keydown', e, f),
        handleKeyup: (e) => p('keyup', e, f),
        handleKeypress: (e) => p('keypress', e, f),
      }
    )
  }
  const _n = {
      type: 'text',
      inputType: 'text',
      loading: !1,
      disabled: !1,
      readonly: !1,
      translate: !1,
      debounce: 0,
      submit: !0,
      bail: !0,
      maxErrors: 1,
      default: null,
      conditions: void 0,
      showRequired: void 0,
      untrackOn: () => ['input'],
    },
    On = ve((e, r) => ({
      ...je(e, r, [nr, lr, vr, ar, nt, un, tt, En, hr]),
      ...r,
    })),
    An = [
      'type',
      'name',
      'id',
      'placeholder',
      'autocomplete',
      'disabled',
      'readonly',
      'aria-labelledby',
      'aria-describedby',
      'aria-invalid',
      'aria-required',
      'aria-busy',
      'lang',
    ],
    Vn = r.defineComponent({
      name: 'VfText',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfText',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        loading: { type: Boolean },
        autocomplete: {},
        modelValue: {},
        default: {},
        rules: {},
        inputType: {},
        aria: {},
        readonly: { type: [String, Boolean, Object, Function, Array] },
        placeholder: { type: [String, Object, Function] },
        as: {},
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        untrackOn: {},
        detached: { type: Boolean },
        transformPayload: { type: Function },
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        translate: { type: Boolean },
        languages: {},
        before: { type: [String, Object, Array, Function] },
        after: { type: [String, Object, Array, Function] },
      },
      emits: [
        'input',
        'focus',
        'blur',
        'keydown',
        'keyup',
        'keypress',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, _n),
          l = be(o),
          s = On(o, a),
          i = he('VfText', () => ({
            root: { 'vf-text': !0, 'vf-align-label': !s.help.value },
            inputGroup: 'vf-input-group',
            input: {
              'vf-input': !0,
              'vf-text-input': !0,
              'vf-disabled': s.disabled.value,
              'vf-focused': s.focused.value,
              'vf-danger': s.hasError.value,
            },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { inputType: d, autocomplete: c } = _e(o, [
            'inputType',
            'autocomplete',
          ]),
          {
            value: p,
            id: f,
            readonly: m,
            placeholder: v,
            viewLoaded: g,
            disabled: y,
            aria: h,
            input: b,
            template: k,
            name: B,
            handleKeydown: w,
            handleKeyup: x,
            handleKeypress: $,
            handleInput: C,
            handleFocus: S,
            handleBlur: E,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(g)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(k)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(k)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.withDirectives(
                                r.createElementVNode(
                                  'input',
                                  r.mergeProps(
                                    {
                                      type: r.unref(d),
                                      name: r.unref(B),
                                      id: r.unref(f),
                                      class: r.unref(i).input,
                                      'onUpdate:modelValue':
                                        t[0] ||
                                        (t[0] = (e) =>
                                          r.isRef(p) ? (p.value = e) : null),
                                      placeholder: r.unref(v),
                                      autocomplete: r.unref(c),
                                      disabled: r.unref(y),
                                      readonly: r.unref(m),
                                      'aria-labelledby': r.unref(h).labelledby,
                                      'aria-describedby':
                                        r.unref(h).describedby,
                                      'aria-invalid': r.unref(h).invalid,
                                      'aria-required': r.unref(h).required,
                                      'aria-busy': r.unref(h).busy,
                                      lang: r.unref(h).lang,
                                    },
                                    r.unref(l).input,
                                    {
                                      ref: (e) => (b.value = e),
                                      onKeydown:
                                        t[1] ||
                                        (t[1] = (...e) =>
                                          r.unref(w) && r.unref(w)(...e)),
                                      onKeyup:
                                        t[2] ||
                                        (t[2] = (...e) =>
                                          r.unref(x) && r.unref(x)(...e)),
                                      onKeypress:
                                        t[3] ||
                                        (t[3] = (...e) =>
                                          r.unref($) && r.unref($)(...e)),
                                      onSelect:
                                        t[4] ||
                                        (t[4] = (...e) =>
                                          r.unref(C) && r.unref(C)(...e)),
                                      onBlur:
                                        t[5] ||
                                        (t[5] = (...e) =>
                                          r.unref(E) && r.unref(E)(...e)),
                                      onFocus:
                                        t[6] ||
                                        (t[6] = (...e) =>
                                          r.unref(S) && r.unref(S)(...e)),
                                    }
                                  ),
                                  null,
                                  16,
                                  An
                                ),
                                [[r.vModelDynamic, r.unref(p)]]
                              ),
                            ]),
                            _: 1,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    }),
    Pn = {
      type: 'textarea',
      loading: !1,
      disabled: !1,
      readonly: !1,
      translate: !1,
      debounce: 0,
      submit: !0,
      bail: !0,
      maxErrors: 1,
      default: null,
      conditions: void 0,
      untrackOn: () => ['input'],
    },
    Dn = ve((e, r) => ({
      ...je(e, r, [nr, lr, vr, ar, nt, un, tt, En, hr]),
      ...r,
    })),
    Fn = [
      'name',
      'id',
      'placeholder',
      'autocomplete',
      'autocorrect',
      'disabled',
      'readonly',
      'rows',
      'aria-labelledby',
      'aria-describedby',
      'aria-invalid',
      'aria-required',
      'aria-busy',
      'lang',
    ],
    jn = r.defineComponent({
      name: 'VfTextarea',
      element: !0,
      inheritAttrs: !1,
      __name: 'VfTextarea',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        type: {},
        loading: { type: Boolean },
        autocomplete: {},
        autocorrect: {},
        modelValue: {},
        default: {},
        rules: {},
        rows: {},
        aria: {},
        readonly: { type: [String, Boolean, Object, Function, Array] },
        placeholder: { type: [String, Object, Function] },
        name: {},
        id: { type: [String, Object, Function] },
        label: { type: [String, Object, Function] },
        page: { type: [String, Object, Array, Function] },
        help: { type: [String, Object, Function] },
        hint: { type: [String, Object, Function] },
        tokens: {},
        layout: {},
        inline: { type: Boolean },
        hideLabel: { type: Boolean },
        columns: { type: [Number, String, Object, Function] },
        conditions: { type: [String, Boolean, Object, Function, Array] },
        expressions: {},
        spaceTop: {},
        spaceBottom: {},
        lineTop: { type: Boolean },
        lineBottom: { type: Boolean },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        disabled: { type: [String, Boolean, Object, Function, Array] },
        validateOn: {},
        debounce: {},
        submit: { type: Boolean },
        untrackOn: {},
        detached: { type: Boolean },
        transformPayload: { type: Function },
        bail: { type: Boolean },
        ruleMessages: {},
        displayName: { type: [String, Object, Function] },
        maxErrors: {},
        hideErrors: { type: Boolean },
        showRequired: { type: [Boolean, Array] },
        hoist: { type: Boolean },
        translate: { type: Boolean },
        languages: {},
        before: { type: [String, Object, Array, Function] },
        after: { type: [String, Object, Array, Function] },
      },
      emits: [
        'input',
        'focus',
        'blur',
        'keydown',
        'keyup',
        'keypress',
        'change',
        'update:modelValue',
        'reset',
        'clear',
        'valid',
        'invalid',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'load',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Pn),
          l = be(o),
          s = Dn(o, a),
          i = he('VfTextarea', () => ({
            root: { 'vf-textarea': !0, 'vf-align-label': !s.help.value },
            inputGroup: 'vf-input-group',
            input: {
              'vf-input': !0,
              'vf-textarea-input': !0,
              'vf-disabled': s.disabled.value,
              'vf-focused': s.focused.value,
              'vf-success': s.success.value,
              'vf-danger': s.hasError.value,
            },
          })),
          u = Ee(s, { parts: l, classes: i, props: o }),
          { autocomplete: d, autocorrect: c } = _e(o, [
            'autocomplete',
            'autocorrect',
          ]),
          {
            value: p,
            id: f,
            readonly: m,
            placeholder: v,
            viewLoaded: g,
            disabled: y,
            aria: h,
            input: b,
            template: k,
            name: B,
            handleKeydown: w,
            handleKeyup: x,
            handleKeypress: $,
            handleFocus: C,
            handleBlur: S,
          } = s
        return (
          t({ props: o, parts: l, classes: i, ...s }),
          (e, t) => {
            const n = r.resolveComponent('VfLayout')
            return r.unref(g)
              ? r.renderSlot(
                  e.$slots,
                  'template',
                  { key: 0, context: r.unref(u) },
                  () => [
                    r.unref(k)
                      ? (r.openBlock(),
                        r.createBlock(
                          r.resolveDynamicComponent(r.unref(k)),
                          { key: 0, context: r.unref(u) },
                          null,
                          8,
                          ['context']
                        ))
                      : (r.openBlock(),
                        r.createBlock(
                          n,
                          { key: 1 },
                          {
                            default: r.withCtx(() => [
                              r.withDirectives(
                                r.createElementVNode(
                                  'textarea',
                                  r.mergeProps(
                                    {
                                      name: r.unref(B),
                                      id: r.unref(f),
                                      class: r.unref(i).input,
                                      'onUpdate:modelValue':
                                        t[0] ||
                                        (t[0] = (e) =>
                                          r.isRef(p) ? (p.value = e) : null),
                                      placeholder: r.unref(v),
                                      autocomplete: r.unref(d),
                                      autocorrect: r.unref(c),
                                      disabled: r.unref(y),
                                      readonly: r.unref(m),
                                      rows: r.unref(o).rows,
                                      'aria-labelledby': r.unref(h).labelledby,
                                      'aria-describedby':
                                        r.unref(h).describedby,
                                      'aria-invalid': r.unref(h).invalid,
                                      'aria-required': r.unref(h).required,
                                      'aria-busy': r.unref(h).busy,
                                      lang: r.unref(h).lang,
                                    },
                                    r.unref(l).input,
                                    {
                                      ref_key: 'input',
                                      ref: b,
                                      onKeydown:
                                        t[1] ||
                                        (t[1] = (...e) =>
                                          r.unref(w) && r.unref(w)(...e)),
                                      onKeyup:
                                        t[2] ||
                                        (t[2] = (...e) =>
                                          r.unref(x) && r.unref(x)(...e)),
                                      onKeypress:
                                        t[3] ||
                                        (t[3] = (...e) =>
                                          r.unref($) && r.unref($)(...e)),
                                      onBlur:
                                        t[4] ||
                                        (t[4] = (...e) =>
                                          r.unref(S) && r.unref(S)(...e)),
                                      onFocus:
                                        t[5] ||
                                        (t[5] = (...e) =>
                                          r.unref(C) && r.unref(C)(...e)),
                                    }
                                  ),
                                  null,
                                  16,
                                  Fn
                                ),
                                [[r.vModelText, r.unref(p)]]
                              ),
                            ]),
                            _: 1,
                          }
                        )),
                  ]
                )
              : r.createCommentVNode('', !0)
          }
        )
      },
    })
  class Rn extends Error {
    constructor(e, r, t = 'unknown', a) {
      ;(super(e),
        n(this, 'status'),
        n(this, 'data'),
        n(this, 'config'),
        n(this, 'reason'),
        n(this, 'response'),
        (this.name = 'HttpError'),
        (this.config = r),
        (this.reason = t),
        (this.status = null == a ? void 0 : a.status),
        (this.data = null == a ? void 0 : a.data),
        (this.response = a))
    }
  }
  function Tn({
    autosave: e,
    payload: t,
    model: n,
    transformAutosave: a,
    invalid: o,
    headers: l,
    json: s,
    base64: i,
    fire: u,
    fireAsync: d,
    off: c,
    on: p,
  }) {
    const f = H(),
      m = J(),
      v = le(),
      g = Re('autosaveDelay'),
      y = Re('autosaveOn'),
      h = Re('autosaveInterval'),
      b = r.computed(() =>
        'string' == typeof r.unref(e)
          ? v.resolveIfAllowed('autosave', r.unref(e))
          : void 0
      ),
      k = r.computed(() => (a.value ? a.value(n.value, m) : t.value))
    let B,
      w = []
    const x = async () => {
        const t = r.unref(e)
        if (!t) return
        const n = 'function' == typeof t,
          a = await d('autosave', k.value, m)
        if (!1 === a) return
        let o
        if (!0 !== a && void 0 !== a) o = a
        else if (n) {
          const e = await t(k.value, m)
          if (!1 === e) return
          e && 'object' == typeof e && 'status' in e && (o = e)
        } else if (b.value)
          try {
            o = await f.request({
              url: b.value,
              data: k.value,
              headers: l.value,
              requestType: s.value ? 'json' : 'form',
              base64: i.value,
            })
          } catch (c) {
            if (c instanceof Rn) return void u('autosaveFail', c, m)
            throw c
          }
        o && u('autosaveSuccess', o, m)
      },
      $ = () => {
        var e
        return (null == (e = y.value) ? void 0 : e.includes('valid')) ?? !1
      },
      C = () => {
        ;(w.forEach(({ event: e, handler: r }) => c(e, r)),
          (w = []),
          void 0 !== B && (clearInterval(B), (B = void 0)))
      },
      S = () => {
        if ((C(), !r.unref(e))) return
        const t = y.value || [],
          n = Number(h.value)
        if (
          (n > 0 &&
            (B = setInterval(() => {
              ;($() && o.value) || x()
            }, n)),
          t.includes('change'))
        ) {
          const e = (function (e, t) {
            let n
            return function (...a) {
              n && clearTimeout(n)
              const o = r.unref(t),
                l = 'string' == typeof o ? Number(o) : o
              if (!l || l <= 0) return e.apply(this, a)
              n = setTimeout(() => {
                e.apply(this, a)
              }, l)
            }
          })(() => {
            ;($() && o.value) || x()
          }, Number(g.value))
          ;(p('change', e), w.push({ event: 'change', handler: e }))
        }
        t.filter((e) => 'change' !== e && 'valid' !== e).forEach((e) => {
          const r = () => {
            ;($() && o.value) || x()
          }
          ;(p(e, r), w.push({ event: e, handler: r }))
        })
      }
    ;(r.onMounted(S), r.onUnmounted(C), r.watch([e, g, y, h], S))
  }
  const Mn = {
      back: !0,
      progress: !0,
      nav: !0,
      syncSteps: !0,
      scrollToError: !0,
      focusError: !0,
      clearCustomErrors: !0,
      errorLevel: 'all',
      autosaveDelay: 1e3,
      autosaveInterval: 1e4,
      method: 'POST',
      dark: void 0,
      showRequired: () => ['label'],
      autosaveOn: () => ['valid'],
      scrollTopOn: () => ['always'],
      scrollOptions: () => ({ behavior: 'smooth' }),
      validateOn: () => ['blur', 'next', 'submit'],
      transformPayload: () => (e) => e,
      transformServerInvalid: () => (e) =>
        (null == e ? void 0 : e.errors) || e || {},
      transformResponse: () => (e) => (null == e ? void 0 : e.payload) || {},
    },
    Nn = ve((e, t) => {
      let n = null
      const a = (function () {
          const e = te()
          return (X(e), e)
        })(),
        o = a
      N(a)
      const l = m(),
        s = H(),
        i = le(),
        d = r.ref(l.uid()),
        c = u(),
        p = Te(),
        { localizeObject: f } = W(),
        { on: v, off: g, fire: y, fireAsync: h } = t,
        { template: b, slots: k } = fe(e),
        B = dr(
          r.toRef(e, 'tokens'),
          r.toRef(() => e.dark)
        ),
        w = r.toRef(() => l.nonce),
        x = `vf-t-${r.useId().replace(/:/g, '-')}`,
        $ = r.computed(() => {
          const e = Object.entries(B.value)
          return e.length
            ? `.${x}{${e.map(([e, r]) => `${e}:${r}`).join(';')}}`
            : ''
        }),
        C = r.computed(() => f(e.languages || l.languages)),
        S = r.toRef(() => Object.keys(C.value)[0]),
        E = Lr(r.toRef(() => r.unref(e.schema))),
        _ = Me(),
        O = Me(),
        A = _.children$,
        V = O.children$
      ;(O.on('register', (e, r) => _.children$.set(e, r)),
        O.on('unregister', (e) => _.children$.delete(e)))
      const P = new Map(),
        D = r.toRef(() => e.modelValue),
        F = r.toRef(() => e.ruleMessages),
        j = r.toRef(() => e.transformPayload),
        R = r.toRef(() => e.transformAutosave),
        T = Je({ modelValue: D, fire: y }),
        { initialModel: M, model: I, register: L, unregister: q, set: z } = T,
        {
          payload: U,
          invalid: G,
          dirty: K,
          pending: Y,
          debouncing: Z,
          busy: J,
          validated: Q,
          completed: ee,
          empty: re,
          hasError: ne,
          messages: ae,
          messageBag: oe,
          update: se,
          reset: ie,
          clear: ue,
          load: de,
          validate: ce,
          unvalidate: pe,
          invalidate: me,
          clean: ve,
          clearErrors: ge,
          clearMessages: ye,
          clearMessageBag: he,
        } = Br({
          rootModel: T,
          children: O,
          modelValue: D,
          ruleMessages: F,
          transformPayload: j,
          ...t,
        }),
        be = r.computed(() => {
          let e = {}
          for (const [r, t] of A) Object.assign(e, t.formErrors)
          return e
        }),
        ke = r.computed(() => {
          const e = new Set()
          for (const r of A.values())
            if (null == r ? void 0 : r.invalidLanguages)
              for (const t of r.invalidLanguages) e.add(t)
          return e
        }),
        Be = qr({
          active: r.toRef(() => e.stepped),
          schema: E,
          children: O,
          history: r.toRef(() => e.history),
          sequential: !0,
          onSelect: (e, r) => y('step', e, r, Be, a),
          onNext: async (e, r) => {
            ;(await rr('next'), y('next', e, r, Be, a))
          },
          onBack: async (e, r) => {
            ;(await rr('back'), y('back', e, r, Be, a))
          },
          onInvalid: async (r) => {
            const t = nr([r.el$])
            t &&
              (e.focusError
                ? (t.focus(), t.scrollTo(e.scrollOptions))
                : e.scrollToError
                  ? t.scrollTo(e.scrollOptions)
                  : rr('error'))
          },
          onFinish: async () => await lr(),
          onBeforeSelect: async (e, r) => await h('beforeStep', e, r, Be, a),
          onBeforeNext: async (e, r) => await h('beforeNext', e, r, Be, a),
          onBeforeBack: async (e, r) => await h('beforeBack', e, r, Be, a),
        }),
        we = () => {
          let e = 0
          for (const r of Be.pages) r.el$ && !r.el$.empty && (e = r.index)
          e > 0 && (Be.enableUntil(e), Be.select(e))
        }
      ;(v('reset', Be.reset),
        r.onMounted(async () => {
          e.stepped && e.syncSteps && (await r.nextTick(), we())
        }))
      const xe = qr({
        active: r.toRef(() => e.tabbed),
        schema: E,
        children: O,
        onSelect: (e, r) => y('tab', e, r, xe, a),
        onBeforeSelect: async (e, r) => await h('beforeTab', e, r, xe, a),
      })
      v('reset', xe.reset)
      const $e = r.ref(0),
        Ce = r.ref(!1),
        Se = r.ref(!1),
        Ee = r.ref(!1),
        _e = r.ref(),
        Oe = r.ref(),
        Ae = r.ref(S.value),
        Ve = r.toRef(e, 'errorLevel'),
        Pe = r.toRef(() => e.headers),
        De = r.toRef(() => e.json),
        Fe = r.toRef(() => e.base64),
        je = r.toRef(() => (e.stepped ? Be : e.tabbed ? xe : void 0)),
        Re = r.computed(() => `${d.value}__errors`),
        Ne = r.computed(() => `${d.value}__messages`),
        Ie = r.computed(
          () => !e.hideErrors && ('form' === Ve.value || 'all' === Ve.value)
        ),
        qe = r.computed(() => e.loading || !!J.value),
        He = r.computed(() => {
          const t = r.unref(e.readonly)
          return 'function' == typeof t ? !!t(o) : !!t || '' === t
        }),
        Ue = r.computed(() => {
          const t = r.unref(e.disabled)
          return 'function' == typeof t ? !!t(o) : !!t || '' === t
        }),
        Ge = r.computed(() =>
          'string' == typeof e.endpoint
            ? i.resolveIfAllowed('endpoint', e.endpoint)
            : void 0
        ),
        Ke = p(
          'successMessage',
          r.toRef(() => e.successMessage),
          o,
          !1
        ),
        Ye = p(
          'redirect',
          r.toRef(() => e.redirect),
          o,
          !1
        ),
        Xe = r.computed(() => {
          const t = e.consts
          if (!t) return
          const n = {}
          for (const [e, a] of Object.entries(t))
            if ('function' == typeof a) n[e] = a(o)
            else {
              const t = r.unref(a)
              t && 'object' == typeof t && !Array.isArray(t)
                ? (n[e] = f(t))
                : (n[e] = t)
            }
          return n
        }),
        Qe = (e) => A.get(e) ?? er(e),
        er = (e) => {
          for (const r of A.values())
            if ((null == r ? void 0 : r.dataPath) === e) return r
        },
        rr = async (r) => {
          var t, n
          ;((null == (t = e.scrollTopOn) ? void 0 : t.includes(r)) ||
            (null == (n = e.scrollTopOn) ? void 0 : n.includes('always'))) &&
            tr()
        },
        tr = () => {
          var r, t
          ;((r = ze(c)),
            (t = e.scrollOptions),
            r && !We(r) && r.scrollIntoView(t))
        },
        nr = (e) => {
          var r
          for (const t of e) {
            if (!t.invalid && !t.hasError) continue
            const e =
              t.statefulChildren$ ??
              ((null == (r = t.children) ? void 0 : r.children$) instanceof Map
                ? [...t.children.children$.values()].filter((e) => !e.isStatic)
                : void 0)
            if (null == e ? void 0 : e.length) {
              const r = nr(e)
              if (r) return r
            }
            if (t.hasError) return t
          }
        },
        ar = async () => {
          if (!e.scrollToError) return !1
          const r = nr([...A.values()])
          return !!r && (await r.scrollTo(e.scrollOptions))
        },
        or = async (r = !0) => {
          if (!e.focusError) return !1
          const t = nr([...A.values()])
          return !!t && (await t.focus(r))
        },
        lr = async () => {
          var t, a, l, i
          if (
            (console.log('submit'),
            $e.value++,
            (Oe.value = void 0),
            (_e.value = void 0),
            qe.value || Ue.value || Ce.value)
          )
            return (
              (Oe.value = {
                type: 'cancelled',
                reason: qe.value
                  ? 'loading'
                  : Ue.value
                    ? 'disabled'
                    : Ce.value
                      ? 'submitting'
                      : 'unknown',
                context$: o,
              }),
              y('cancelled', Oe.value),
              Oe.value
            )
          if (
            (!Ee.value &&
              (null == (t = e.validateOn) ? void 0 : t.includes('submit')) &&
              ((Se.value = !0), await ce(), (Se.value = !1)),
            G.value)
          )
            return (
              (Oe.value = {
                type: 'invalid',
                source: 'client',
                errors: be.value,
                context$: o,
              }),
              (await or()) || (await ar()) || (await rr('error')),
              Oe.value
            )
          ;((Ce.value = !0), (n = new AbortController()))
          try {
            const r = await h('submit', U.value, o)
            if (!1 === r)
              return (
                (Oe.value = {
                  type: 'cancelled',
                  reason: 'prevented',
                  context$: o,
                }),
                y('cancelled', Oe.value),
                Oe.value
              )
            if (!0 !== r) _e.value = r
            else if ('function' == typeof e.endpoint) {
              const r = await e.endpoint(U.value, o)
              if (!1 === r)
                return (
                  (Oe.value = {
                    type: 'cancelled',
                    reason: 'prevented',
                    context$: o,
                  }),
                  y('cancelled', Oe.value),
                  Oe.value
                )
              'string' == typeof r
                ? (_e.value = await s.request({
                    url: r,
                    method: e.method,
                    data: U.value,
                    headers: e.headers,
                    signal: n.signal,
                    requestType: e.json ? 'json' : 'form',
                    base64: e.base64,
                  }))
                : r && (_e.value = r)
            } else
              Ge.value &&
                (_e.value = await s.request({
                  url: Ge.value,
                  method: e.method,
                  data: U.value,
                  headers: e.headers,
                  signal: n.signal,
                  requestType: e.json ? 'json' : 'form',
                  base64: e.base64,
                }))
          } catch (u) {
            if (u instanceof Rn) {
              const r = (null == (a = u.response) ? void 0 : a.data) || null
              if ('abort' === u.reason)
                return (
                  (Oe.value = {
                    type: 'fail',
                    reason: 'abort',
                    status: null,
                    message: u.message,
                    data: null,
                    response: null,
                    context$: o,
                  }),
                  y('fail', Oe.value),
                  Oe.value
                )
              if (422 === u.status) {
                const t =
                  (null == (l = e.transformServerInvalid)
                    ? void 0
                    : l.call(e, r, o)) || {}
                if (
                  ((Oe.value = {
                    type: 'invalid',
                    source: 'server',
                    errors: t,
                    data: r,
                    response: u.response,
                    context$: o,
                  }),
                  u.response && y('response', u.response),
                  y('serverInvalid', Oe.value),
                  e.setInvalid)
                ) {
                  for (const [e, r] of Object.entries(t)) {
                    const t = Qe(e)
                    if (null == t ? void 0 : t.messageBag)
                      for (const e of r) t.messageBag.append(e, 'error')
                  }
                  ;(await or()) || (await ar()) || (await rr('error'))
                }
                return Oe.value
              }
              return (
                (Oe.value = {
                  type: 'fail',
                  reason: u.reason,
                  status: u.status || null,
                  message: u.message,
                  data: r,
                  response: u.response || null,
                  context$: o,
                }),
                u.response && y('response', u.response),
                y('fail', Oe.value),
                Oe.value
              )
            }
            throw new Error(u)
          } finally {
            ;((Ce.value = !1), (n = null))
          }
          if (_e.value) {
            if (
              ((Oe.value = {
                type: 'success',
                data: _e.value.data,
                status: _e.value.status,
                response: _e.value,
                context$: o,
              }),
              y('response', _e.value),
              y('success', Oe.value),
              Ke.value && oe.append(Ke.value, 'message'),
              e.resetOnSuccess && ie(),
              e.clearOnSuccess && ue(),
              e.setResponse)
            ) {
              const r =
                (null == (i = e.transformResponse)
                  ? void 0
                  : i.call(e, _e.value.data, o)) || {}
              Object.keys(r).length && se(r)
            }
            return (
              await rr('success'),
              Ye.value &&
                r.nextTick(() => {
                  window.location.href = Ye.value
                }),
              Oe.value
            )
          }
          return Oe.value
        },
        sr = (e, r, t, n) => {
          if ((O.register(r, e), t)) {
            P.has(t) || P.set(t, [])
            const e = P.get(t)
            ;(e.push(r),
              e.length > 1 &&
                console.error(
                  `[Vueform error]: Multiple elements (\`${e.join('`, `')}\`) share the same \`dataPath\`: "${t}". Ensure each element has a unique \`dataPath\` by avoiding non-nested groups with children that share names with other elements at the same data level.`
                ))
          }
          t && L(t, n)
        },
        ir = (e, r) => {
          if ((O.unregister(e), r)) {
            const t = P.get(r)
            if (t) {
              const n = t.indexOf(e)
              ;(-1 !== n && t.splice(n, 1), t.length || P.delete(r))
            }
          }
          r && q(r)
        },
        ur = z,
        cr = (e) => (Ae.value = e)
      return (
        Tn({
          autosave: r.toRef(() => e.autosave),
          payload: U,
          model: I,
          transformAutosave: R,
          invalid: G,
          headers: Pe,
          json: De,
          base64: Fe,
          on: v,
          off: g,
          fire: y,
          fireAsync: h,
        }),
        Le({
          type: 'root',
          id: d,
          pager: je,
          model: I,
          children: O,
          register: sr,
          unregister: ir,
          update: ur,
          subscribe: T.subscribe,
        }),
        {
          loading: qe,
          disabled: Ue,
          readonly: He,
          showErrors: Ie,
          template: b,
          slots: k,
          tokens: B,
          tokenClass: x,
          tokenCss: $,
          nonce: w,
          elements$: A,
          children$: V,
          resolvedSchema: E,
          errorsId: Re,
          messagesId: Ne,
          tabs: xe,
          steps: Be,
          language: Ae,
          languages: C,
          submits: $e,
          submitting: Ce,
          validating: Se,
          supressValidation: Ee,
          model: I,
          initialModel: M,
          resolvedConsts: Xe,
          payload: U,
          invalid: G,
          dirty: K,
          pending: Y,
          debouncing: Z,
          busy: J,
          validated: Q,
          completed: ee,
          empty: re,
          errors: be,
          invalidLanguages: ke,
          hasError: ne,
          ruleMessages: F,
          messages: ae,
          messageBag: oe,
          uid: d,
          pager: je,
          children: O,
          result: Oe,
          response: _e,
          update: se,
          reset: ie,
          clear: ue,
          load: de,
          syncSteps: we,
          validate: ce,
          unvalidate: pe,
          invalidate: me,
          clean: ve,
          clearErrors: ge,
          clearMessages: ye,
          clearMessageBag: he,
          submit: lr,
          abort: () => {
            null == n || n.abort()
          },
          on: v,
          off: g,
          fire: y,
          fireAsync: h,
          find: Qe,
          findByDataPath: er,
          findSiblings: (e) => {
            const r = e.lastIndexOf('.'),
              t = -1 === r ? '' : e.substring(0, r),
              n = '' === t ? '' : `${t}.`,
              a = []
            for (const [o, l] of A) {
              const e = String(o)
              e.startsWith(n) &&
                !e.substring(n.length).includes('.') &&
                a.push(l)
            }
            return a
          },
          get: (e) => {
            const r = e.indexOf(':')
            if (-1 !== r) {
              const t = e.slice(0, r),
                n = e.slice(r + 1),
                a = Qe(t)
              return a ? Ze(a, n) : void 0
            }
            const t = Qe(e)
            return t ? t.model : Ze(I.value, e)
          },
          set: (e, r) => {
            const t = Qe(e)
            t ? t.update(r) : z(e, r)
          },
          toJSON: () => JSON.stringify(I.value),
          scrollToTop: tr,
          scrollToFirstError: ar,
          focusFirstError: or,
          selectLanguage: cr,
          handleSubmit: () => lr(),
          handleLanguageSelect: (e) => cr(e),
          registerChild: sr,
          unregisterChild: ir,
          updateChild: ur,
        }
      )
    }),
    In = ['id'],
    Ln = ['id'],
    qn = ['disabled'],
    Hn = r.defineComponent({
      name: 'VfForm',
      type: 'form',
      inheritAttrs: !1,
      __name: 'VfForm',
      props: {
        parts: {},
        classes: {},
        reclass: {},
        slots: {},
        schema: {},
        modelValue: {},
        ruleMessages: {},
        languages: {},
        multilingual: { type: Boolean },
        validateOn: {},
        showRequired: { type: [Boolean, Array] },
        clearCustomErrors: { type: Boolean },
        errorLevel: {},
        hideErrors: { type: Boolean },
        stepped: { type: Boolean },
        progress: { type: Boolean },
        nav: { type: Boolean },
        syncSteps: { type: Boolean },
        history: { type: Boolean },
        back: { type: Boolean },
        nextLabel: { type: [String, Object, Function] },
        backLabel: { type: [String, Object, Function] },
        finishLabel: { type: [String, Object, Function] },
        scrollTopOn: {},
        scrollToError: { type: Boolean },
        scrollOptions: {},
        focusError: { type: Boolean },
        autosave: { type: [String, Function] },
        autosaveOn: {},
        autosaveDelay: {},
        autosaveInterval: {},
        submits: { type: Boolean },
        loading: { type: Boolean },
        disabled: { type: [String, Boolean, Object, Function, Array] },
        readonly: { type: [String, Boolean, Object, Function, Array] },
        method: {},
        endpoint: { type: [String, Function] },
        redirect: { type: [String, Object, Function] },
        successMessage: { type: [String, Object, Function] },
        resetOnSuccess: { type: Boolean },
        clearOnSuccess: { type: Boolean },
        setInvalid: { type: Boolean },
        setResponse: { type: Boolean },
        json: { type: Boolean },
        base64: { type: Boolean },
        headers: {},
        tokens: {},
        expressions: {},
        consts: {},
        dark: { type: Boolean },
        transformPayload: { type: Function },
        transformAutosave: { type: Function },
        transformServerInvalid: { type: Function },
        transformResponse: { type: Function },
        class: { type: [Boolean, null, String, Object, Array] },
        presets: {},
        view: {},
        template: {},
        component: {},
        tabbed: { type: Boolean },
      },
      emits: [
        'step',
        'back',
        'next',
        'beforeStep',
        'beforeBack',
        'beforeNext',
        'beforeFinish',
        'change',
        'reset',
        'clear',
        'load',
        'autosave',
        'autosaveSuccess',
        'autosaveFail',
        'invalid',
        'valid',
        'submit',
        'response',
        'fail',
        'serverInvalid',
        'success',
        'cancelled',
        'update:modelValue',
        'beforeMount',
        'mounted',
        'beforeUnmount',
        'unmounted',
        'updated',
        'tab',
        'beforeTab',
      ],
      setup(e, { expose: t }) {
        const n = e,
          a = Pe(),
          o = Se(n, Mn),
          l = be(o),
          s = Nn(o, a),
          i = m(),
          u = he('VfForm', () => ({
            root: {
              'vf-form': !0,
              [s.tokenClass]: !!s.tokenCss.value,
              [i.build.darkClass]: !0 === o.dark,
              [i.build.lightClass]: !1 === o.dark,
            },
            errorsWrapper: [
              'vf-form-errors-wrapper',
              {
                'sr-only':
                  !s.showErrors.value ||
                  0 === Object.keys(s.errors.value).length,
              },
            ],
            errors: 'vf-form-errors',
            error: 'vf-form-error',
            messagesWrapper: 'vf-form-messages-wrapper',
            messages: 'vf-form-messages',
            message: 'vf-form-message',
          })),
          d = Ee(s, { parts: l, classes: u, props: o }),
          {
            multilingual: c,
            nav: p,
            stepped: f,
            nextLabel: v,
            backLabel: g,
            finishLabel: y,
            tabbed: h,
            progress: b,
            back: k,
            submits: B,
          } = _e(o, [
            'multilingual',
            'nav',
            'stepped',
            'nextLabel',
            'backLabel',
            'finishLabel',
            'tabbed',
            'progress',
            'back',
            'submits',
          ]),
          {
            showErrors: w,
            resolvedSchema: x,
            tabs: $,
            steps: C,
            language: S,
            invalid: E,
            invalidLanguages: _,
            messages: O,
            languages: A,
            errorsId: V,
            messagesId: P,
            errors: D,
            template: F,
            tokenCss: j,
            nonce: R,
            slots: T,
            selectLanguage: M,
            handleLanguageSelect: N,
            handleSubmit: I,
          } = s
        return (
          t({ props: o, parts: l, classes: u, ...s }),
          (e, t) =>
            r.renderSlot(e.$slots, 'template', { context: r.unref(d) }, () => [
              r.unref(F)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent(r.unref(F)),
                    { key: 0, context: r.unref(d) },
                    null,
                    8,
                    ['context']
                  ))
                : (r.openBlock(),
                  r.createElementBlock(
                    'form',
                    r.mergeProps(
                      { key: 1, class: r.unref(u).root },
                      r.unref(l).root,
                      {
                        onSubmit:
                          t[1] ||
                          (t[1] = r.withModifiers(() => {}, ['prevent'])),
                      }
                    ),
                    [
                      r.renderSlot(
                        e.$slots,
                        'content',
                        { context: r.unref(d) },
                        () => {
                          var n
                          return [
                            (null == (n = r.unref(T)) ? void 0 : n.content)
                              ? (r.openBlock(),
                                r.createBlock(
                                  r.resolveDynamicComponent(r.unref(T).content),
                                  { key: 0, context: r.unref(d) },
                                  null,
                                  8,
                                  ['context']
                                ))
                              : (r.openBlock(),
                                r.createElementBlock(
                                  r.Fragment,
                                  { key: 1 },
                                  [
                                    r.unref(w)
                                      ? r.renderSlot(
                                          e.$slots,
                                          'errors',
                                          {
                                            key: 0,
                                            errors: r.unref(D),
                                            id: r.unref(V),
                                          },
                                          () => {
                                            var t
                                            return [
                                              (
                                                null == (t = r.unref(T))
                                                  ? void 0
                                                  : t.errors
                                              )
                                                ? (r.openBlock(),
                                                  r.createBlock(
                                                    r.resolveDynamicComponent(
                                                      r.unref(T).errors
                                                    ),
                                                    {
                                                      key: 0,
                                                      errors: r.unref(D),
                                                      id: r.unref(V),
                                                    },
                                                    null,
                                                    8,
                                                    ['errors', 'id']
                                                  ))
                                                : (r.openBlock(),
                                                  r.createElementBlock(
                                                    'div',
                                                    r.mergeProps(
                                                      {
                                                        key: 1,
                                                        class:
                                                          r.unref(u)
                                                            .errorsWrapper,
                                                        id: r.unref(V),
                                                      },
                                                      r.unref(l).errorsWrapper,
                                                      {
                                                        role: 'alert',
                                                        'aria-live':
                                                          'assertive',
                                                        'aria-atomic': 'true',
                                                        tabindex: '-1',
                                                      }
                                                    ),
                                                    [
                                                      r.createElementVNode(
                                                        'ul',
                                                        r.mergeProps(
                                                          {
                                                            class:
                                                              r.unref(u).errors,
                                                          },
                                                          r.unref(l).errors
                                                        ),
                                                        [
                                                          (r.openBlock(!0),
                                                          r.createElementBlock(
                                                            r.Fragment,
                                                            null,
                                                            r.renderList(
                                                              r.unref(D),
                                                              (t, n) => (
                                                                r.openBlock(),
                                                                r.createElementBlock(
                                                                  r.Fragment,
                                                                  { key: n },
                                                                  [
                                                                    (r.openBlock(
                                                                      !0
                                                                    ),
                                                                    r.createElementBlock(
                                                                      r.Fragment,
                                                                      null,
                                                                      r.renderList(
                                                                        t,
                                                                        (t) => (
                                                                          r.openBlock(),
                                                                          r.createElementBlock(
                                                                            'li',
                                                                            r.mergeProps(
                                                                              {
                                                                                class:
                                                                                  r.unref(
                                                                                    u
                                                                                  )
                                                                                    .error,
                                                                              },
                                                                              {
                                                                                ref_for:
                                                                                  !0,
                                                                              },
                                                                              r.unref(
                                                                                l
                                                                              )
                                                                                .error
                                                                            ),
                                                                            [
                                                                              r.renderSlot(
                                                                                e.$slots,
                                                                                'error',
                                                                                {
                                                                                  error:
                                                                                    t,
                                                                                  path: n,
                                                                                },
                                                                                () => {
                                                                                  var e
                                                                                  return [
                                                                                    (
                                                                                      null ==
                                                                                      (e =
                                                                                        r.unref(
                                                                                          T
                                                                                        ))
                                                                                        ? void 0
                                                                                        : e.error
                                                                                    )
                                                                                      ? (r.openBlock(),
                                                                                        r.createBlock(
                                                                                          r.resolveDynamicComponent(
                                                                                            r.unref(
                                                                                              T
                                                                                            )
                                                                                              .error
                                                                                          ),
                                                                                          {
                                                                                            key: 0,
                                                                                            error:
                                                                                              t,
                                                                                            path: n,
                                                                                          },
                                                                                          null,
                                                                                          8,
                                                                                          [
                                                                                            'error',
                                                                                            'path',
                                                                                          ]
                                                                                        ))
                                                                                      : (r.openBlock(),
                                                                                        r.createElementBlock(
                                                                                          r.Fragment,
                                                                                          {
                                                                                            key: 1,
                                                                                          },
                                                                                          [
                                                                                            r.createTextVNode(
                                                                                              r.toDisplayString(
                                                                                                t
                                                                                              ),
                                                                                              1
                                                                                            ),
                                                                                          ],
                                                                                          64
                                                                                        )),
                                                                                  ]
                                                                                }
                                                                              ),
                                                                            ],
                                                                            16
                                                                          )
                                                                        )
                                                                      ),
                                                                      256
                                                                    )),
                                                                  ],
                                                                  64
                                                                )
                                                              )
                                                            ),
                                                            128
                                                          )),
                                                        ],
                                                        16
                                                      ),
                                                    ],
                                                    16,
                                                    In
                                                  )),
                                            ]
                                          }
                                        )
                                      : r.createCommentVNode('', !0),
                                    r.unref(O).length
                                      ? r.renderSlot(
                                          e.$slots,
                                          'messages',
                                          {
                                            key: 1,
                                            messages: r.unref(O),
                                            id: r.unref(P),
                                          },
                                          () => {
                                            var t
                                            return [
                                              (
                                                null == (t = r.unref(T))
                                                  ? void 0
                                                  : t.messages
                                              )
                                                ? (r.openBlock(),
                                                  r.createBlock(
                                                    r.resolveDynamicComponent(
                                                      r.unref(T).message
                                                    ),
                                                    {
                                                      key: 0,
                                                      messages: r.unref(O),
                                                      id: r.unref(P),
                                                    },
                                                    null,
                                                    8,
                                                    ['messages', 'id']
                                                  ))
                                                : (r.openBlock(),
                                                  r.createElementBlock(
                                                    'div',
                                                    r.mergeProps(
                                                      {
                                                        key: 1,
                                                        class:
                                                          r.unref(u)
                                                            .messagesWrapper,
                                                        id: r.unref(P),
                                                      },
                                                      r.unref(l)
                                                        .messagesWrapper,
                                                      {
                                                        role: 'status',
                                                        'aria-live': 'polite',
                                                        'aria-atomic': 'true',
                                                        tabindex: '-1',
                                                      }
                                                    ),
                                                    [
                                                      r.createElementVNode(
                                                        'ul',
                                                        r.mergeProps(
                                                          {
                                                            class:
                                                              r.unref(u)
                                                                .messages,
                                                          },
                                                          r.unref(l).messages
                                                        ),
                                                        [
                                                          (r.openBlock(!0),
                                                          r.createElementBlock(
                                                            r.Fragment,
                                                            null,
                                                            r.renderList(
                                                              r.unref(O),
                                                              (t) => (
                                                                r.openBlock(),
                                                                r.createElementBlock(
                                                                  'li',
                                                                  r.mergeProps(
                                                                    {
                                                                      class:
                                                                        r.unref(
                                                                          u
                                                                        )
                                                                          .message,
                                                                    },
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    r.unref(l)
                                                                      .message
                                                                  ),
                                                                  [
                                                                    r.renderSlot(
                                                                      e.$slots,
                                                                      'message',
                                                                      {
                                                                        message:
                                                                          t,
                                                                      },
                                                                      () => {
                                                                        var e
                                                                        return [
                                                                          (
                                                                            null ==
                                                                            (e =
                                                                              r.unref(
                                                                                T
                                                                              ))
                                                                              ? void 0
                                                                              : e.message
                                                                          )
                                                                            ? (r.openBlock(),
                                                                              r.createBlock(
                                                                                r.resolveDynamicComponent(
                                                                                  r.unref(
                                                                                    T
                                                                                  )
                                                                                    .message
                                                                                ),
                                                                                {
                                                                                  key: 0,
                                                                                  message:
                                                                                    t,
                                                                                },
                                                                                null,
                                                                                8,
                                                                                [
                                                                                  'message',
                                                                                ]
                                                                              ))
                                                                            : (r.openBlock(),
                                                                              r.createElementBlock(
                                                                                r.Fragment,
                                                                                {
                                                                                  key: 1,
                                                                                },
                                                                                [
                                                                                  r.createTextVNode(
                                                                                    r.toDisplayString(
                                                                                      t
                                                                                    ),
                                                                                    1
                                                                                  ),
                                                                                ],
                                                                                64
                                                                              )),
                                                                        ]
                                                                      }
                                                                    ),
                                                                  ],
                                                                  16
                                                                )
                                                              )
                                                            ),
                                                            256
                                                          )),
                                                        ],
                                                        16
                                                      ),
                                                    ],
                                                    16,
                                                    Ln
                                                  )),
                                            ]
                                          }
                                        )
                                      : r.createCommentVNode('', !0),
                                    r.unref(c)
                                      ? r.renderSlot(
                                          e.$slots,
                                          'languages',
                                          {
                                            key: 2,
                                            languages: r.unref(A),
                                            language: r.unref(S),
                                            invalidLanguages: r.unref(_),
                                            select: r.unref(M),
                                          },
                                          () => {
                                            var t
                                            return [
                                              (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  (null == (t = r.unref(T))
                                                    ? void 0
                                                    : t.languages) ||
                                                    'VfLanguages'
                                                ),
                                                r.mergeProps(
                                                  {
                                                    languages: r.unref(A),
                                                    language: r.unref(S),
                                                    'invalid-languages':
                                                      r.unref(_),
                                                    select: r.unref(M),
                                                  },
                                                  r.unref(l).languages,
                                                  { onSelect: r.unref(N) }
                                                ),
                                                {
                                                  default: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'language',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      )
                                                    ),
                                                  ]),
                                                  _: 3,
                                                },
                                                16,
                                                [
                                                  'languages',
                                                  'language',
                                                  'invalid-languages',
                                                  'select',
                                                  'onSelect',
                                                ]
                                              )),
                                            ]
                                          }
                                        )
                                      : r.createCommentVNode('', !0),
                                    r.unref(h)
                                      ? r.renderSlot(
                                          e.$slots,
                                          'tabs',
                                          { key: 3, pager: r.unref($) },
                                          () => {
                                            var t
                                            return [
                                              (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  (null == (t = r.unref(T))
                                                    ? void 0
                                                    : t.tabs) || 'VfTabs'
                                                ),
                                                r.mergeProps(
                                                  { pager: r.unref($) },
                                                  r.unref(l).tabs
                                                ),
                                                {
                                                  default: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'tab',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.tab
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  r.unref(T).tab
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  _: 3,
                                                },
                                                16,
                                                ['pager']
                                              )),
                                            ]
                                          }
                                        )
                                      : r.createCommentVNode('', !0),
                                    r.unref(f) && r.unref(b)
                                      ? r.renderSlot(
                                          e.$slots,
                                          'steps',
                                          { key: 4, pager: r.unref(C) },
                                          () => {
                                            var t
                                            return [
                                              (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  (null == (t = r.unref(T))
                                                    ? void 0
                                                    : t.steps) || 'VfSteps'
                                                ),
                                                r.mergeProps(
                                                  { pager: r.unref(C) },
                                                  r.unref(l).steps
                                                ),
                                                {
                                                  default: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'step',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.step
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  r.unref(T)
                                                                    .step
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  _: 3,
                                                },
                                                16,
                                                ['pager']
                                              )),
                                            ]
                                          }
                                        )
                                      : r.createCommentVNode('', !0),
                                    r.renderSlot(
                                      e.$slots,
                                      'elements',
                                      { resolvedSchema: r.unref(x) },
                                      () => {
                                        var t
                                        return [
                                          (r.openBlock(),
                                          r.createBlock(
                                            r.resolveDynamicComponent(
                                              (null == (t = r.unref(T))
                                                ? void 0
                                                : t.elements) || 'VfElements'
                                            ),
                                            { 'resolved-schema': r.unref(x) },
                                            {
                                              default: r.withCtx(() => [
                                                r.renderSlot(
                                                  e.$slots,
                                                  'default',
                                                  {
                                                    resolvedSchema: r.unref(x),
                                                  },
                                                  () => {
                                                    var e
                                                    return [
                                                      (
                                                        null == (e = r.unref(T))
                                                          ? void 0
                                                          : e.default
                                                      )
                                                        ? (r.openBlock(),
                                                          r.createBlock(
                                                            r.resolveDynamicComponent(
                                                              r.unref(T).default
                                                            ),
                                                            {
                                                              key: 0,
                                                              'resolved-schema':
                                                                r.unref(x),
                                                            },
                                                            null,
                                                            8,
                                                            ['resolved-schema']
                                                          ))
                                                        : (r.openBlock(!0),
                                                          r.createElementBlock(
                                                            r.Fragment,
                                                            { key: 1 },
                                                            r.renderList(
                                                              r.unref(x),
                                                              (e) => (
                                                                r.openBlock(),
                                                                r.createBlock(
                                                                  r.resolveDynamicComponent(
                                                                    e.component
                                                                  ),
                                                                  r.mergeProps(
                                                                    {
                                                                      ref_for:
                                                                        !0,
                                                                    },
                                                                    e.props,
                                                                    {
                                                                      key: e
                                                                        .props
                                                                        .name,
                                                                    }
                                                                  ),
                                                                  null,
                                                                  16
                                                                )
                                                              )
                                                            ),
                                                            128
                                                          )),
                                                    ]
                                                  }
                                                ),
                                              ]),
                                              _: 3,
                                            },
                                            8,
                                            ['resolved-schema']
                                          )),
                                        ]
                                      }
                                    ),
                                    r.unref(f) && r.unref(p)
                                      ? r.renderSlot(
                                          e.$slots,
                                          'nav',
                                          {
                                            key: 5,
                                            pager: r.unref(C),
                                            next: r.unref(v),
                                            backLabel: r.unref(g),
                                            finish: r.unref(y),
                                            back: r.unref(k),
                                          },
                                          () => {
                                            var t
                                            return [
                                              (r.openBlock(),
                                              r.createBlock(
                                                r.resolveDynamicComponent(
                                                  (null == (t = r.unref(T))
                                                    ? void 0
                                                    : t.nav) || 'VfNav'
                                                ),
                                                r.mergeProps(
                                                  {
                                                    pager: r.unref(C),
                                                    next: r.unref(v),
                                                    back: r.unref(g),
                                                    finish: r.unref(y),
                                                    'hide-back': !r.unref(k),
                                                  },
                                                  r.unref(l).nav
                                                ),
                                                {
                                                  back: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'back',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e, n
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.back
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  null ==
                                                                    (n =
                                                                      r.unref(
                                                                        T
                                                                      ))
                                                                    ? void 0
                                                                    : n.back
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  backText: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'backText',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e, n
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.backText
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  null ==
                                                                    (n =
                                                                      r.unref(
                                                                        T
                                                                      ))
                                                                    ? void 0
                                                                    : n.backText
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  next: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'next',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e, n
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.next
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  null ==
                                                                    (n =
                                                                      r.unref(
                                                                        T
                                                                      ))
                                                                    ? void 0
                                                                    : n.next
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  nextText: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'nextText',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e, n
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.nextText
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  null ==
                                                                    (n =
                                                                      r.unref(
                                                                        T
                                                                      ))
                                                                    ? void 0
                                                                    : n.nextText
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  finish: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'finish',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e, n
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.finish
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  null ==
                                                                    (n =
                                                                      r.unref(
                                                                        T
                                                                      ))
                                                                    ? void 0
                                                                    : n.finish
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  finishText: r.withCtx((t) => [
                                                    r.renderSlot(
                                                      e.$slots,
                                                      'finishText',
                                                      r.normalizeProps(
                                                        r.guardReactiveProps(t)
                                                      ),
                                                      () => {
                                                        var e, n
                                                        return [
                                                          (
                                                            null ==
                                                            (e = r.unref(T))
                                                              ? void 0
                                                              : e.finishText
                                                          )
                                                            ? (r.openBlock(),
                                                              r.createBlock(
                                                                r.resolveDynamicComponent(
                                                                  null ==
                                                                    (n =
                                                                      r.unref(
                                                                        T
                                                                      ))
                                                                    ? void 0
                                                                    : n.finishText
                                                                ),
                                                                r.normalizeProps(
                                                                  r.mergeProps(
                                                                    { key: 0 },
                                                                    t
                                                                  )
                                                                ),
                                                                null,
                                                                16
                                                              ))
                                                            : r.createCommentVNode(
                                                                '',
                                                                !0
                                                              ),
                                                        ]
                                                      }
                                                    ),
                                                  ]),
                                                  _: 3,
                                                },
                                                16,
                                                [
                                                  'pager',
                                                  'next',
                                                  'back',
                                                  'finish',
                                                  'hide-back',
                                                ]
                                              )),
                                            ]
                                          }
                                        )
                                      : r.createCommentVNode('', !0),
                                    r.unref(B)
                                      ? (r.openBlock(),
                                        r.createElementBlock(
                                          'button',
                                          {
                                            key: 6,
                                            disabled: r.unref(E),
                                            onClick:
                                              t[0] ||
                                              (t[0] = r.withModifiers(
                                                (...e) =>
                                                  r.unref(I) &&
                                                  r.unref(I)(...e),
                                                ['prevent']
                                              )),
                                          },
                                          ' Submit ',
                                          8,
                                          qn
                                        ))
                                      : r.createCommentVNode('', !0),
                                  ],
                                  64
                                )),
                          ]
                        }
                      ),
                    ],
                    16
                  )),
              r.unref(j)
                ? (r.openBlock(),
                  r.createBlock(
                    r.resolveDynamicComponent('style'),
                    { key: 2, '^nonce': r.unref(R) },
                    {
                      default: r.withCtx(() => [
                        r.createTextVNode(r.toDisplayString(r.unref(j)), 1),
                      ]),
                      _: 1,
                    },
                    8,
                    ['^nonce']
                  ))
                : r.createCommentVNode('', !0),
            ])
        )
      },
    }),
    zn = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          VfAddon: Fe,
          VfBtn: fr,
          VfButton: ur,
          VfCheckbox: _r,
          VfCheckboxes: Fr,
          VfCol: Ir,
          VfContent: hn,
          VfLayout: Jr,
          VfElements: rt,
          VfField: lt,
          VfFile: pt,
          VfForm: Hn,
          VfGrid: ht,
          VfGroup: Wr,
          VfHidden: wt,
          VfLanguages: St,
          VfList: Ft,
          VfMatrix: zt,
          VfNav: Kt,
          VfRadio: en,
          VfRadios: nn,
          VfRow: sn,
          VfSelect: vn,
          VfSteps: wn,
          VfTabs: Sn,
          VfText: Vn,
          VfTextarea: jn,
        },
        Symbol.toStringTag,
        { value: 'Module' }
      )
    )
  function Wn(e) {
    return (r) => e(r)
  }
  const Un = Wn(({ config: e, form$: t, $services: n }) => {
    const a = (e) =>
        'object' == typeof e && !Array.isArray(e) && !r.isRef(e) && 'not' in e,
      o = (e, t, n) => {
        if (a(e)) return !o(e.not, t, n)
        if (r.isRef(e)) return !!r.unref(e)
        if ('function' == typeof e) return e(t)
        if ('string' == typeof e) return s(e, t)
        if ('boolean' == typeof e) return e
        if (!Array.isArray(e))
          throw new Error(
            'Conditions must be a Ref<boolean>, string, function, or array'
          )
        return (
          0 === e.length ||
          ('string' == typeof e[0]
            ? l(e, t, n)
            : e.every((e) => {
                if (!Array.isArray(e))
                  throw new Error('Structured condition members must be arrays')
                return 'string' == typeof e[0]
                  ? l(e, t, n)
                  : e.some((e) => {
                      if (!Array.isArray(e))
                        throw new Error(
                          'OR group members must be structured conditions (arrays)'
                        )
                      return l(e, t, n)
                    })
              }))
        )
      },
      l = ([a, o, l], s, u) => {
        var d
        const c = a.indexOf(':'),
          p = -1 !== c ? a.slice(c + 1) : null
        let f = -1 !== c ? a.slice(0, c) : a
        u && (f = Ge(f, u))
        const m = null == t ? void 0 : t.find(f)
        if (!m || (!m.available && s && !i(s, m, u))) return !1
        let v
        if (
          (void 0 !== l ||
            ['empty', 'not_empty', 'today'].includes(o) ||
            ((l = o),
            (o = '=='),
            console.warn(
              '[Vueform warn]: Using conditions without an operator is deprecated, use `==` instead'
            )),
          p)
        )
          v = Ze(m, p)
        else {
          if (!r.unref(m.dataPath))
            throw new Error(
              'Conditions can only target elements with a data model'
            )
          v = (null == t ? void 0 : t.model) || void 0
          for (const e of r.unref(m.dataPath).split('.')) {
            if (!v) break
            v = v[e]
          }
        }
        return (function (e, r, t, { strict: n, dateFormat: a, $date: o }) {
          if (!r) return !1
          const l = (e, r) => {
            if (!o) throw new Error('Date service is not installed')
            return o(e, r)
          }
          switch (
            ((e = Array.isArray(e) ? e.map((e) => yr(e)) : yr(e)),
            (t = Array.isArray(t) ? t.map((e) => yr(e)) : yr(t)),
            r.toLowerCase())
          ) {
            case '>':
              return Array.isArray(e) ? e.every((e) => e > t) : e > t
            case '>=':
              return Array.isArray(e)
                ? n
                  ? e.every((e) => e >= t && null != e && '' !== e)
                  : e.every((e) => e >= t)
                : n
                  ? e >= t && null != e && '' !== e
                  : e >= t
            case '<':
              return Array.isArray(e)
                ? n
                  ? e.every((e) => e < t && null != e && '' !== e)
                  : e.every((e) => e < t)
                : n
                  ? e < t && null != e && '' !== e
                  : e < t
            case '<=':
              return Array.isArray(e)
                ? n
                  ? e.every((e) => e <= t && null != e && '' !== e)
                  : e.every((e) => e <= t)
                : n
                  ? e <= t && null != e && '' !== e
                  : e <= t
            case 'between':
              return e > t[0] && e < t[1]
            case 'empty':
              if (Array.isArray(e)) return !e.length
              if (e && e instanceof File) return !1
              if (e && e instanceof Blob) return !1
              if (e && 'object' == typeof e) {
                let r = Object.values(e)
                return (
                  !r.length ||
                  r.every((e) =>
                    Array.isArray(e)
                      ? !e.length
                      : e && 'object' == typeof e
                        ? Object.values(e).every((e) =>
                            Array.isArray(e)
                              ? !e.length
                              : -1 !== ['', null, void 0].indexOf(e)
                          )
                        : -1 !== ['', null, void 0].indexOf(e)
                  )
                )
              }
              return -1 !== ['', null, void 0].indexOf(e)
            case 'not_empty':
              if (Array.isArray(e)) return !!e.length
              if (e && e instanceof File) return !0
              if (e && e instanceof Blob) return !0
              if (e && 'object' == typeof e) {
                let r = Object.values(e)
                return (
                  !!r.length &&
                  r.some((e) =>
                    Array.isArray(e)
                      ? !!e.length
                      : e && 'object' == typeof e
                        ? Object.values(e).some((e) =>
                            Array.isArray(e)
                              ? !!e.length
                              : -1 === ['', null, void 0].indexOf(e)
                          )
                        : -1 === ['', null, void 0].indexOf(e)
                  )
                )
              }
              return -1 === ['', null, void 0].indexOf(e)
            case '==':
            case 'in':
              return Array.isArray(t)
                ? Array.isArray(e)
                  ? t.length
                    ? e.filter((e) => t.includes(e)).length > 0
                    : !e.length
                  : -1 !== t.indexOf(e)
                : Array.isArray(e)
                  ? -1 !== e.indexOf(t)
                  : e == t
            case '!=':
            case 'not_in':
              return Array.isArray(t)
                ? Array.isArray(e)
                  ? t.length
                    ? 0 == e.filter((e) => t.includes(e)).length
                    : !!e.length
                  : -1 === t.indexOf(e)
                : Array.isArray(e)
                  ? -1 === e.indexOf(t)
                  : e != t
            case 'today':
              return (
                Array.isArray(e) || (e = [e]),
                e.length && e.every((e) => l(e, a).isSame(l(), 'day'))
              )
            case 'before':
              return (
                Array.isArray(e) || (e = [e]),
                e.length &&
                  e.every((e) => {
                    let r = l(e, a)
                    return (
                      r.isValid() &&
                      r.isBefore(l('today' === t ? void 0 : t), 'day')
                    )
                  })
              )
            case 'after':
              return (
                Array.isArray(e) || (e = [e]),
                e.length &&
                  e.every((e) => {
                    let r = l(e, a)
                    return (
                      r.isValid() &&
                      r.isAfter(l('today' === t ? void 0 : t), 'day')
                    )
                  })
              )
            case '^':
              return String(e).startsWith(t)
            case '$':
              return String(e).endsWith(t)
            case '*':
              return String(e).includes(t)
            default:
              return !1
          }
          return !1
        })(v, o, l, {
          strict: e.strictConditions,
          dateFormat:
            null == (d = null == s ? void 0 : s.props)
              ? void 0
              : d.valueDateFormat,
          $date: n.$date,
        })
      },
      s = (e, r) => {
        var a
        if (
          (/^{/.test(e) || /}$/.test(e) || (e = `{${e}}`),
          !(null == (a = n.$expression) ? void 0 : a.installed))
        )
          throw new Error(
            'Expression service must be installed to use expression-based conditions'
          )
        return (
          'true' ===
          n.$expression.resolve(e, (null == t ? void 0 : t.model) || {}, r)
        )
      },
      i = (e, t, o) => {
        var l
        if (
          !e ||
          !(null == (l = null == t ? void 0 : t.props)
            ? void 0
            : l.conditions) ||
          !o
        )
          return !1
        let s = t.props.conditions
        if ((a(s) && (s = s.not), 'function' == typeof s || r.isRef(s)))
          return !1
        if ('string' == typeof s)
          return (
            !!n.$expression && n.$expression.usedPaths(`{${s}}`, o).includes(o)
          )
        if (!Array.isArray(s)) return !1
        const i = (e) => {
          const r = e.indexOf(':')
          return -1 !== r ? e.slice(0, r) : e
        }
        return 'string' == typeof s[0]
          ? Ge(i(s[0]), o) === o
          : s.some(
              (e) =>
                !!Array.isArray(e) &&
                ('string' == typeof e[0]
                  ? Ge(i(e[0]), o) === o
                  : e.some((e) => !!Array.isArray(e) && Ge(i(e[0]), o) === o))
            )
      }
    return { check: o, isNegated: a }
  })
  function Gn(e) {
    return e.replace(/s$/, '')
  }
  function Kn(e, r) {
    const t = 12 * (e.year() - r.year()) + (e.month() - r.month()),
      n = e.date(),
      a = r.date()
    return t > 0 && n < a ? t - 1 : t < 0 && n > a ? t + 1 : t
  }
  let Yn = !1,
    Zn = !1
  class Xn {
    constructor(e) {
      ;(n(this, '_d'), (this._d = e))
    }
    isValid() {
      return !isNaN(this._d.getTime())
    }
    year() {
      return this._d.getFullYear()
    }
    month() {
      return this._d.getMonth() + 1
    }
    date() {
      return this._d.getDate()
    }
    day() {
      return this._d.getDay()
    }
    hour() {
      return this._d.getHours()
    }
    minute() {
      return this._d.getMinutes()
    }
    second() {
      return this._d.getSeconds()
    }
    millisecond() {
      return this._d.getMilliseconds()
    }
    add(e, r) {
      const t = new Date(this._d.getTime())
      switch (Gn(r)) {
        case 'year':
          t.setFullYear(t.getFullYear() + e)
          break
        case 'month':
          t.setMonth(t.getMonth() + e)
          break
        case 'week':
          t.setDate(t.getDate() + 7 * e)
          break
        case 'day':
          t.setDate(t.getDate() + e)
          break
        case 'hour':
          t.setTime(t.getTime() + 36e5 * e)
          break
        case 'minute':
          t.setTime(t.getTime() + 6e4 * e)
          break
        case 'second':
          t.setTime(t.getTime() + 1e3 * e)
          break
        case 'millisecond':
          t.setTime(t.getTime() + e)
      }
      return new Xn(t)
    }
    subtract(e, r) {
      return this.add(-e, r)
    }
    startOf(e) {
      const r = new Date(this._d.getTime())
      switch (Gn(e)) {
        case 'year':
          ;(r.setMonth(0, 1), r.setHours(0, 0, 0, 0))
          break
        case 'month':
          ;(r.setDate(1), r.setHours(0, 0, 0, 0))
          break
        case 'week':
          ;(r.setDate(r.getDate() - r.getDay()), r.setHours(0, 0, 0, 0))
          break
        case 'day':
          r.setHours(0, 0, 0, 0)
          break
        case 'hour':
          r.setMinutes(0, 0, 0)
          break
        case 'minute':
          r.setSeconds(0, 0)
          break
        case 'second':
          r.setMilliseconds(0)
      }
      return new Xn(r)
    }
    endOf(e) {
      const r = new Date(this._d.getTime())
      switch (Gn(e)) {
        case 'year':
          ;(r.setMonth(11, 31), r.setHours(23, 59, 59, 999))
          break
        case 'month':
          ;(r.setMonth(r.getMonth() + 1, 0), r.setHours(23, 59, 59, 999))
          break
        case 'week':
          ;(r.setDate(r.getDate() + (6 - r.getDay())),
            r.setHours(23, 59, 59, 999))
          break
        case 'day':
          r.setHours(23, 59, 59, 999)
          break
        case 'hour':
          r.setMinutes(59, 59, 999)
          break
        case 'minute':
          r.setSeconds(59, 999)
          break
        case 'second':
          r.setMilliseconds(999)
      }
      return new Xn(r)
    }
    set(e, r) {
      const t = new Date(this._d.getTime())
      switch (Gn(e)) {
        case 'year':
          t.setFullYear(r)
          break
        case 'month':
          t.setMonth(r - 1)
          break
        case 'week':
          break
        case 'day':
          t.setDate(r)
          break
        case 'hour':
          t.setHours(r)
          break
        case 'minute':
          t.setMinutes(r)
          break
        case 'second':
          t.setSeconds(r)
          break
        case 'millisecond':
          t.setMilliseconds(r)
      }
      return new Xn(t)
    }
    isBefore(e, r) {
      return r
        ? this.startOf(r).valueOf() < e.startOf(r).valueOf()
        : this.valueOf() < e.valueOf()
    }
    isAfter(e, r) {
      return r
        ? this.startOf(r).valueOf() > e.startOf(r).valueOf()
        : this.valueOf() > e.valueOf()
    }
    isSame(e, r) {
      return r
        ? this.startOf(r).valueOf() === e.startOf(r).valueOf()
        : this.valueOf() === e.valueOf()
    }
    isSameOrBefore(e, r) {
      return this.isSame(e, r) || this.isBefore(e, r)
    }
    isSameOrAfter(e, r) {
      return this.isSame(e, r) || this.isAfter(e, r)
    }
    isBetween(e, r, t, n = '()') {
      const a = t ? this.startOf(t).valueOf() : this.valueOf(),
        o = t ? e.startOf(t).valueOf() : e.valueOf(),
        l = t ? r.startOf(t).valueOf() : r.valueOf(),
        s = '[' === n[0] ? a >= o : a > o,
        i = ']' === n[1] ? a <= l : a < l
      return s && i
    }
    diff(e, r) {
      if (!r) return this.valueOf() - e.valueOf()
      const t = this.valueOf() - e.valueOf()
      switch (Gn(r)) {
        case 'year':
          return Math.trunc(Kn(this, e) / 12)
        case 'month':
          return Kn(this, e)
        case 'week':
          return Math.trunc(t / 6048e5)
        case 'day':
          return Math.trunc(t / 864e5)
        case 'hour':
          return Math.trunc(t / 36e5)
        case 'minute':
          return Math.trunc(t / 6e4)
        case 'second':
          return Math.trunc(t / 1e3)
        default:
          return t
      }
    }
    toDate() {
      return new Date(this._d.getTime())
    }
    toISOString() {
      return this._d.toISOString()
    }
    toISODate() {
      return `${String(this._d.getFullYear()).padStart(4, '0')}-${String(this._d.getMonth() + 1).padStart(2, '0')}-${String(this._d.getDate()).padStart(2, '0')}`
    }
    valueOf() {
      return this._d.getTime()
    }
    unix() {
      return Math.floor(this._d.getTime() / 1e3)
    }
    clone() {
      return new Xn(new Date(this._d.getTime()))
    }
    format(e) {
      return (
        Yn ||
          (console.warn(
            '[Vueform warn]: A date format plugin is required to use format(). Install @vueform/date-dayjs, @vueform/date-fns, or @vueform/date-luxon.'
          ),
          (Yn = !0)),
        this.toISOString()
      )
    }
  }
  const Jn = Wn(() => (e, r) => {
      if (
        (r &&
          (Zn ||
            (console.warn(
              '[Vueform warn]: A date format plugin is required for format-aware parsing. Install @vueform/date-dayjs, @vueform/date-fns, or @vueform/date-luxon.'
            ),
            (Zn = !0))),
        null == e)
      )
        return new Xn(new Date())
      if (e instanceof Xn) return e.clone()
      if (e instanceof Date) return new Xn(new Date(e.getTime()))
      if ('number' == typeof e) return new Xn(new Date(e))
      if ('object' == typeof e && 'function' == typeof e.toDate)
        return new Xn(new Date(e.toDate().getTime()))
      const t = String(e)
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
        const [e, r, n] = t.split('-').map(Number)
        return new Xn(new Date(e, r - 1, n))
      }
      const n = t.match(
        /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/
      )
      if (n) {
        const [, e, r, t, a, o, l] = n
        return new Xn(new Date(+e, +r - 1, +t, +a, +o, +(l || 0)))
      }
      return new Xn(new Date(t))
    }),
    Qn = Wn((e) => ({
      installed: !1,
      resolve: function (e) {
        return e
      },
      usedPaths: () => [],
    }))
  function ea(e) {
    return e instanceof File || e instanceof Blob
  }
  function ra(e) {
    return (
      !!ea(e) ||
      (Array.isArray(e)
        ? e.some(ra)
        : !(!e || 'object' != typeof e || e instanceof Date) &&
          Object.values(e).some(ra))
    )
  }
  async function ta(e) {
    if (ea(e))
      return await ((r = e),
      new Promise((e, t) => {
        const n = new FileReader()
        ;((n.onload = () => e(n.result)), (n.onerror = t), n.readAsDataURL(r))
      }))
    var r
    if (Array.isArray(e)) return Promise.all(e.map(ta))
    if (e && 'object' == typeof e && !(e instanceof Date)) {
      const r = {}
      for (const [t, n] of Object.entries(e)) r[t] = await ta(n)
      return r
    }
    return e
  }
  function na(e, r = new FormData(), t = '') {
    for (const [n, a] of Object.entries(e)) {
      const e = t ? `${t}[${n}]` : n
      null == a
        ? r.append(e, '')
        : a instanceof File || a instanceof Blob
          ? r.append(e, a)
          : Array.isArray(a)
            ? a.forEach((t, n) => {
                const a = `${e}[${n}]`
                t instanceof File || t instanceof Blob
                  ? r.append(a, t)
                  : 'object' == typeof t
                    ? na(t, r, a)
                    : r.append(a, String(t))
              })
            : 'object' != typeof a || a instanceof Date
              ? r.append(e, String(a))
              : na(a, r, e)
    }
    return r
  }
  async function aa(e, r, t = 'json', n = !1) {
    if (null != e) {
      if (
        e instanceof FormData ||
        e instanceof Blob ||
        e instanceof URLSearchParams
      )
        return e
      switch (t) {
        case 'form':
        case 'multipart':
          return 'object' == typeof e ? na(e) : e
        case 'urlencoded':
          return (
            r.has('Content-Type') ||
              r.set('Content-Type', 'application/x-www-form-urlencoded'),
            'object' == typeof e
              ? new URLSearchParams(
                  Object.entries(e)
                    .filter(([, e]) => null != e)
                    .map(([e, r]) => [e, String(r)])
                )
              : String(e)
          )
        case 'text':
          return (
            r.has('Content-Type') || r.set('Content-Type', 'text/plain'),
            'string' == typeof e ? e : JSON.stringify(e)
          )
        default:
          return 'string' == typeof e
            ? e
            : (ra(e) &&
                (n
                  ? (e = await ta(e))
                  : 'production' !== process.env.NODE_ENV &&
                    console.warn(
                      '[Vueform warn]: Request data contains File/Blob objects but requestType is "json". Files cannot be serialized as JSON. Use requestType: "form" for file uploads, convert files to base64 manually, or enable automatic base64 conversion with { base64: true }'
                    )),
              r.has('Content-Type') ||
                r.set('Content-Type', 'application/json'),
              JSON.stringify(e))
      }
    }
  }
  const oa = async (e) => {
      var r
      const t = (function (e) {
          let { url: r, baseURL: t, params: n } = e
          if (
            (t &&
              !/^https?:\/\//i.test(r) &&
              (r = `${t.replace(/\/+$/, '')}/${r.replace(/^\/+/, '')}`),
            n)
          ) {
            const e = Object.entries(n)
              .filter(([, e]) => null != e)
              .map(
                ([e, r]) =>
                  `${encodeURIComponent(e)}=${encodeURIComponent(String(r))}`
              )
              .join('&')
            e && (r += (r.includes('?') ? '&' : '?') + e)
          }
          return r
        })(e),
        n = (e.method || 'GET').toUpperCase(),
        a = new Headers(e.headers),
        o = ['GET', 'HEAD'].includes(n)
          ? void 0
          : await aa(e.data, a, e.requestType, e.base64)
      let l,
        s,
        i,
        u = e.signal
      if (e.timeout && e.timeout > 0) {
        const r = new AbortController()
        ;(e.signal &&
          e.signal.addEventListener('abort', () => r.abort(e.signal.reason)),
          (u = r.signal),
          (l = setTimeout(() => r.abort('timeout'), e.timeout)))
      }
      try {
        s = await fetch(t, {
          method: n,
          headers: a,
          body: o,
          signal: u,
          credentials: e.withCredentials ? 'include' : 'same-origin',
        })
      } catch (c) {
        clearTimeout(l)
        const t =
            'AbortError' === (null == c ? void 0 : c.name) ||
            (null == u ? void 0 : u.aborted),
          n =
            'timeout' === c ||
            (null == (r = null == c ? void 0 : c.message)
              ? void 0
              : r.includes('timeout'))
              ? 'timeout'
              : t
                ? 'abort'
                : 'network',
          a = {
            timeout: `Timeout of ${e.timeout}ms exceeded`,
            abort: 'Request aborted',
            network: `Network Error: ${null == c ? void 0 : c.message}`,
          }
        throw new Rn(a[n], e, n)
      }
      clearTimeout(l)
      try {
        switch (e.responseType) {
          case 'text':
            i = await s.text()
            break
          case 'blob':
            i = await s.blob()
            break
          case 'arrayBuffer':
            i = await s.arrayBuffer()
            break
          default: {
            const e = await s.text()
            i = e ? JSON.parse(e) : null
          }
        }
      } catch {
        i = null
      }
      const d = {
        data: i,
        status: s.status,
        statusText: s.statusText,
        headers: Object.fromEntries(s.headers.entries()),
        config: e,
      }
      if (!s.ok)
        throw new Rn(`Request failed with status ${s.status}`, e, 'http', d)
      return d
    },
    la = Wn(({ config: e }) => {
      const {
          adapter: r,
          defaultMethod: t,
          requestType: n,
          baseURL: a,
          timeout: o,
          headers: l,
          withCredentials: s,
          base64: i,
          onRequest: u,
          onResponse: d,
        } = e.$http,
        c = r ?? oa,
        p = {
          method: t || 'GET',
          requestType: n || 'json',
          baseURL: a,
          timeout: o,
          headers: l || {},
          withCredentials: s,
          base64: i || !1,
        },
        f = [],
        m = []
      async function v(e) {
        let r = { ...p, ...e, headers: { ...p.headers, ...e.headers } }
        if (u) for (const n of u) r = await n(r)
        for (const n of f) r = await n(r)
        let t = await c(r)
        if (d) for (const n of d) t = await n(t)
        for (const n of m) t = await n(t)
        return t
      }
      return {
        request: v,
        get: (e, r) => v({ ...r, url: e, method: 'GET' }),
        post: (e, r, t) => v({ ...t, url: e, method: 'POST', data: r }),
        put: (e, r, t) => v({ ...t, url: e, method: 'PUT', data: r }),
        patch: (e, r, t) => v({ ...t, url: e, method: 'PATCH', data: r }),
        delete: (e, r) => v({ ...r, url: e, method: 'DELETE' }),
        onRequest: (e) => {
          f.push(e)
        },
        onResponse: (e) => {
          m.push(e)
        },
      }
    }),
    sa = Wn(
      ({
        config: {
          locales: e,
          fallbackLocale: t,
          locale: n,
          localeParamPattern: a,
        },
      }) => {
        const o = r.computed({
            get: () => r.unref(n) || Object.keys(e)[0],
            set: (e) => (r.isRef(n) ? (n.value = e) : (n = e)),
          }),
          l = i(() => ({ ...e[t], ...e[o.value] })),
          s = (e) =>
            e
              ? 'string' == typeof e
                ? e
                : e[o.value] || e[t || ''] || e[Object.keys(e)[0] || ''] || ''
              : '',
          u = (e, r) =>
            (r &&
              e.replace(new RegExp(a.source, 'g'), (e, t) =>
                t in r ? String(r[t]) : e
              )) ||
            e
        return {
          locale: o,
          tags: l,
          locales: e,
          fallbackLocale: t,
          t: (r, n) => {
            var a
            if ('string' != typeof r) return ''
            const l =
              e[o.value][r] || (null == (a = e[t || '']) ? void 0 : a[r]) || r
            return 'function' == typeof l ? '' : n ? u(l, n) : l
          },
          setLocale: (e) => {
            o.value = e
          },
          replaceParams: u,
          localize: s,
          localizeObject: (e) =>
            E(e).reduce((e, [r, t]) => ({ ...e, [r]: s(t) }), {}),
        }
      }
    ),
    ia = Wn(() => ({
      make: () => {
        const e = r.reactive({ errors: [], messages: [] }),
          t = r.reactive({ errors: [], messages: [] }),
          n = r.ref([]),
          a = r.computed(() => [...e.errors, ...t.errors]),
          o = r.computed(() => [...e.messages, ...t.messages]),
          l = r.computed(() => a.value[0]),
          s = r.computed(() => o.value[0]),
          i = (r, n = 'any') => {
            ;(-1 !== ['any', 'error'].indexOf(n) &&
              (e.errors.forEach((e, t) => {
                e === r && u('prepends', 'errors', t)
              }),
              t.errors.forEach((e, t) => {
                e === r && u('appends', 'errors', t)
              })),
              -1 !== ['any', 'message'].indexOf(n) &&
                (e.messages.forEach((e, t) => {
                  e === r && u('prepends', 'messages', t)
                }),
                t.messages.forEach((e, t) => {
                  e === r && u('appends', 'messages', t)
                })))
          },
          u = (r, n, a) => {
            'prepends' === r ? e[n].splice(a, 1) : t[n].splice(a, 1)
          }
        return {
          prepends: e,
          appends: t,
          errors: a,
          messages: o,
          error: l,
          message: s,
          prepend: (r, t = 'error', a = !1) => {
            ;(e['error' === t ? 'errors' : 'messages'].unshift(r),
              a && !n.value.includes(r) && n.value.push(r))
          },
          append: (e, r = 'error', a = !1) => {
            ;(t['error' === r ? 'errors' : 'messages'].push(e),
              a && !n.value.includes(e) && n.value.push(e))
          },
          remove: i,
          rm: u,
          clear: (r = 'all') => {
            ;('all' === r
              ? [...e.errors, ...e.messages, ...t.errors, ...t.messages]
              : [...e[r], ...t[r]]
            )
              .filter((e) => !n.value.includes(e))
              .forEach((e) => i(e, 'any'))
          },
          clearPrepended: (r = 'all') => {
            ;('all' === r ? [...e.errors, ...e.messages] : e[r])
              .filter((e) => !n.value.includes(e))
              .forEach((e) => i(e, 'any'))
          },
          clearAppended: (e = 'all') => {
            ;('all' === e ? [...t.errors, ...t.messages] : t[e])
              .filter((e) => !n.value.includes(e))
              .forEach((e) => i(e, 'any'))
          },
          snapshot: () => ({
            prepends: { errors: [...e.errors], messages: [...e.messages] },
            appends: { errors: [...t.errors], messages: [...t.messages] },
          }),
          restore: (r) => {
            ;(e.errors.splice(0),
              e.errors.push(...r.prepends.errors),
              e.messages.splice(0),
              e.messages.push(...r.prepends.messages),
              t.errors.splice(0),
              t.errors.push(...r.appends.errors),
              t.messages.splice(0),
              t.messages.push(...r.appends.messages))
          },
        }
      },
    })),
    ua = Wn(({ config: e }) => ({
      sanitize: (r) => {
        var t, n
        if ('string' != typeof r) return ''
        if (!(null == (t = e.$security) ? void 0 : t.sanitize)) return r
        const a = null == (n = e.$security) ? void 0 : n.adapter
        if (!a) throw new Error('Security service is not installed')
        return a.sanitize(r)
      },
    }))
  function da(e) {
    if (e.startsWith('--vf-')) return e
    if (e.includes('-')) return `--vf-${e}`
    return `--vf-${e
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-z]{2,})(\d)/g, '$1-$2')
      .toLowerCase()}`
  }
  function ca(e) {
    return e.replace(/\$([a-zA-Z][a-zA-Z0-9]*)/g, (e, r) => `var(${da(r)})`)
  }
  function pa(e, r, t) {
    const n = da(r)
    'number' == typeof t
      ? e.set(n, String(t))
      : 'string' == typeof t && e.set(n, ca(t))
  }
  function fa(e) {
    const r = []
    for (const [t, n] of e) r.push(`  ${t}: ${n};`)
    return r.join('\n')
  }
  function ma(e, r = {}) {
    const {
      darkMode: t = 'system',
      scopedDarkMode: n = !1,
      darkClass: a = 'vf-dark',
      lightClass: o = 'vf-light',
    } = r
    if (!e || 0 === Object.keys(e).length) return ''
    const l = new Map(),
      s = new Map()
    for (const [u, d] of Object.entries(e))
      if ('css' !== u)
        if ('dark' !== u || 'object' != typeof d || null === d) pa(l, u, d)
        else for (const [e, r] of Object.entries(d)) pa(s, e, r)
    const i = []
    if ((l.size && i.push(`:root {\n${fa(l)}\n}`), s.size)) {
      const e = fa(s)
      'system' === t
        ? i.push(
            `@media (prefers-color-scheme: dark) {\n  :root {\n${(function (
              e,
              r
            ) {
              const t = ' '.repeat(r)
              return e
                .split('\n')
                .map((e) => (e.length ? t + e : e))
                .join('\n')
            })(e, 4)}\n  }\n}`
          )
        : i.push(`:root${t} {\n${e}\n}`)
    }
    if (n && l.size) {
      const e = new Map(l)
      for (const [r, t] of s) e.set(r, t)
      ;(i.push(`.${a} {\n${fa(e)}\n}`), i.push(`.${o} {\n${fa(l)}\n}`))
    }
    return i.join('\n\n')
  }
  function va(e, r, t = !0) {
    const n = (e, t) =>
      `.${r(yr(e), t)} { grid-column: span ${e ?? 12} / span 12; }`
    let a = ''
    a += `${n()}\n` + [...Array(12)].map((e, r) => n(r + 1)).join('\n')
    const o = Object.keys(e),
      l = t ? o : o.slice().reverse()
    for (const s of l) {
      const o = e[s]
      a += `\n\n@media (${t ? 'min' : 'max'}-width: ${'number' == typeof o ? `${o}px` : o}) {\n  ${n(void 0, s)}\n${[...Array(12)].map((e, r) => `  ${n(r + 1, s)}`).join('\n')}\n\n  .vf-align-label .${r(void 0, s)}:vf-vertical,\n  :not(.vf-align-label) .${r(void 0, s)}:vf-vertical {\n    padding-top: 0;\n  }\n\n  .vf-align-label .${r(void 0, s)}:vf-horizontal {\n    padding-top: var(--vf-label-offset);\n  }\n}`
    }
    return a
  }
  function ga(e) {
    var r, t, n
    const a = []
    e.grid && a.push(va(e.breakpoints, e.cols, e.mobileFirst))
    const o = ma(e.theme, {
      darkMode: e.darkMode,
      scopedDarkMode: null == (r = e.build) ? void 0 : r.scopedDarkMode,
      darkClass: null == (t = e.build) ? void 0 : t.darkClass,
      lightClass: null == (n = e.build) ? void 0 : n.lightClass,
    })
    return (o && a.push(o), a.join('\n\n'))
  }
  const ya = Wn(({ config: e }) => {
      const t = (function (e = 'system') {
          const t = r.ref(!1)
          if ('undefined' == typeof window) return t
          if ('system' === e) {
            const e = window.matchMedia('(prefers-color-scheme: dark)')
            t.value = e.matches
            const r = (e) => {
              t.value = e.matches
            }
            return (
              'function' == typeof e.addEventListener
                ? e.addEventListener('change', r)
                : e.addListener(r),
              t
            )
          }
          const n = document.documentElement
          return (
            (t.value = n.matches(e)),
            new MutationObserver(() => {
              t.value = n.matches(e)
            }).observe(n, {
              attributes: !0,
              attributeFilter: ['class', 'data-theme'],
            }),
            t
          )
        })(e.darkMode),
        n = (e) => ('number' == typeof e ? String(e) : ca(e))
      return {
        make: function (e, a) {
          const o = r.computed(() => {
            const e = r.toValue(a)
            return void 0 !== e ? e : t.value
          })
          return r.computed(() => {
            const t = r.toValue(e),
              a = {}
            if (!t) return a
            for (const [e, r] of Object.entries(t))
              'dark' !== e &&
                'css' !== e &&
                ('number' == typeof r
                  ? (a[da(e)] = String(r))
                  : 'string' == typeof r && (a[da(e)] = n(r)))
            if (o.value && t.dark && 'object' == typeof t.dark)
              for (const [e, r] of Object.entries(t.dark))
                'number' == typeof r
                  ? (a[da(e)] = String(r))
                  : 'string' == typeof r && (a[da(e)] = n(r))
            return a
          })
        },
        install: (r) => {
          var t, n, a, o
          const l =
              (null == (t = e.build) ? void 0 : t.styleId) ?? 'vueform-style',
            s = ma(e.theme, {
              darkMode: e.darkMode,
              scopedDarkMode: null == (n = e.build) ? void 0 : n.scopedDarkMode,
              darkClass: null == (a = e.build) ? void 0 : a.darkClass,
              lightClass: null == (o = e.build) ? void 0 : o.lightClass,
            }),
            i = [e.grid ? va(e.breakpoints, e.cols, e.mobileFirst) : '', s]
              .filter(Boolean)
              .join('\n\n')
          i &&
            (function (e, r, t, n, a) {
              var o, l
              let s = !1
              if (!1 !== n)
                try {
                  const n =
                    (null == (o = e._context.provides) ? void 0 : o.usehead) ??
                    (null == (l = e.config.globalProperties) ? void 0 : l.$head)
                  n &&
                    'function' == typeof n.push &&
                    (n.push({
                      style: [
                        { id: r, innerHTML: t, ...(a ? { nonce: a } : {}) },
                      ],
                    }),
                    (s = !0))
                } catch {}
              if (s || 'undefined' == typeof document) return
              const i = document.getElementById(r)
              if (i) return void (i.textContent = t)
              const u = document.createElement('style')
              ;((u.id = r),
                (u.textContent = t),
                a && u.setAttribute('nonce', a),
                document.head.insertBefore(u, document.head.firstChild))
            })(r, l, i, e.useHead, e.nonce)
        },
      }
    }),
    ha = Wn(({ config: e, form$: t, $services: n }) => {
      if (!n.$conditions)
        throw new Error('Validation service requires the conditions service')
      return {
        make: (a, o) => {
          const l = r.ref([]),
            s = r.computed(() => l.value.some((e) => e.invalid)),
            i = r.computed(() => l.value.some((e) => e.pending)),
            u = r.computed(() => l.value.some((e) => e.timer)),
            d = r.computed(() => i.value || u.value),
            c = r.computed(() =>
              l.value.every((e) => e.validated || !e.active)
            ),
            p = r.computed(() =>
              l.value.some((e) => 'nullable' === e.name && e.active)
            ),
            f = r.computed(() =>
              l.value.reduce((e, r) => [...e, ...r.errors], [])
            ),
            m = r.computed(() =>
              l.value.some(
                (e) => !!['required', 'accepted'].includes(e.name) && e.active
              )
            ),
            v = r.computed(() =>
              l.value.some(
                (e) => !!['numeric', 'integer'].includes(e.name) && e.active
              )
            ),
            g = (r) => {
              if (!e.rules[r.name])
                throw new Error(`\`${r.name}\` validation rule does not exist`)
              return e.rules[r.name](r, {
                el$: a,
                form$: t,
                config: e,
                language: o,
                $services: n,
              })
            },
            y = (e) => {
              let r = 0
              const t = e.split(':'),
                n = t[0]
              if (1 === t.length)
                return { name: n, attributes: [], debounce: r, nullable: p }
              const a = [],
                o = t.slice(1).join(':')
              return (
                ['regex', 'not_regex'].includes(n)
                  ? a.push({ value: o.replace(/^pattern=/, '') })
                  : o.split(',').forEach((e) => {
                      const t = e.split('='),
                        n = {}
                      if (t.length > 1) {
                        const e = t[0],
                          a = yr(t[1])
                        if ('debounce' === e) return (r = a)
                        ;((n.name = e), (n.value = a))
                      } else n.value = yr(t[0])
                      a.push(n)
                    }),
                { name: n, attributes: a, debounce: r, nullable: p }
              )
            },
            h = (e) => {
              if (!$(e)) return []
              const r = []
              return (
                Object.entries(e).forEach(([e, t]) => {
                  r.push({ ...y(e), conditions: t })
                }),
                r
              )
            }
          return {
            language: o,
            invalid: s,
            pending: i,
            debouncing: u,
            numeric: v,
            busy: d,
            required: m,
            errors: f,
            validated: c,
            init: (r) => {
              if (((l.value = []), !r)) return
              ;((Array.isArray(r) ? r : r.split('|')).forEach((r) => {
                if ('function' == typeof r)
                  l.value.push(
                    r(
                      { name: 'raw', attributes: [], debounce: 0, nullable: p },
                      { el$: a, form$: t, config: e, language: o, $services: n }
                    )
                  )
                else if ('string' == typeof r) l.value.push(g(y(r)))
                else {
                  if (!$(r))
                    throw new Error(
                      'A rule must be a string, a validator class, or an object with `{ rule: condition }` format'
                    )
                  h(r).forEach((e) => {
                    l.value.push(g(e))
                  })
                }
              }),
                p.value &&
                  m.value &&
                  console.warn(
                    '[Vueform warn]: The `required` rule has no effect when combined with `nullable`'
                  ))
            },
            validate: async (e) => {
              let r = !0
              return (
                await Ae(l.value, async (t) => {
                  var n
                  if (r || !(null == (n = a.props) ? void 0 : n.bail))
                    try {
                      r = await t.validate(e)
                    } catch (o) {
                      if (!(o instanceof Error && 'cancelled' === o.message))
                        throw o
                      r = !1
                    }
                }),
                r
              )
            },
            invalidate: () => l.value.forEach((e) => e.invalidate()),
            reset: () => l.value.forEach((e) => e.reset()),
          }
        },
      }
    })
  function ba(e, t, n) {
    const a = (
      { attributes: a, conditions: o, debounce: l, nullable: s },
      { form$: i, el$: u, config: d, language: c, $services: p }
    ) => {
      let f,
        m,
        v = 0
      const { $locale: g, $conditions: y } = p,
        h = r.ref(),
        b = r.ref(!1),
        k = r.ref(!1),
        B = r.ref(!1),
        w = r.ref(),
        x = r.computed(() => {
          var e
          return Number(
            l ||
              (null == (e = u.props) ? void 0 : e.debounce) ||
              (null == n ? void 0 : n.debounce) ||
              0
          )
        }),
        $ = r.computed(() => (b.value ? [A.value] : [])),
        C = r.computed(() => !o || !y || y.check(o, u, u.path)),
        E = r.computed(() => j(u)),
        _ = r.computed(() => {
          if (void 0 === (null == n ? void 0 : n.params)) return {}
          if (!0 === n.params)
            return (null == a ? void 0 : a.map((e) => e.value)) || []
          const r = n.params.reduce((r, t, n) => {
            const o = String(t.replace(/(?:\$\?|[$?])$/, ''))
            return (
              (r[o] = (a.find((e) => e.name === o) || a[n] || {}).value),
              void 0 !== r[o] ||
                t.endsWith('?') ||
                console.warn(
                  `[Vueform warn]: Param \`${o}\` is not provided in \`${e}\` rule of \`${u.path}\``
                ),
              (t.endsWith('$') || t.endsWith('$?')) &&
                i &&
                'string' == typeof r[o] &&
                (r[`${o}$`] = i.find(Ge(r[o], u.path))),
              r
            )
          }, {})
          return 'function' == typeof n.transformParams
            ? n.transformParams({ params: r })
            : r
        }),
        O = r.computed(() => ({
          ...(Array.isArray(_.value) ? {} : _.value),
          attribute: u.genericName,
        })),
        A = r.computed(() => {
          var r, t
          const a = {
              el$: u,
              form$: i,
              config: d,
              $services: p,
              params: O.value,
              type: E.value,
              attribute: u.genericName,
              filled: F,
              size: D,
              getType: j,
              getOther$: R,
            },
            o = d.ruleMessageTag(
              e,
              (null == n ? void 0 : n.typed) ? E.value : void 0
            ),
            l =
              void 0 !== h.value
                ? h.value
                : 'function' == typeof (null == n ? void 0 : n.message)
                  ? n.message(a)
                  : 'string' == typeof (null == n ? void 0 : n.message)
                    ? n.message
                    : (null == (r = u.ruleMessages) ? void 0 : r[e]) ||
                      (null == (t = null == i ? void 0 : i.ruleMessages)
                        ? void 0
                        : t[e]) ||
                      ((null == g ? void 0 : g.tags[o])
                        ? o
                        : d.ruleMessageTag('default'))
          return g
            ? g.replaceParams(
                g.t(g.localize(l)),
                'function' == typeof (null == n ? void 0 : n.messageParams)
                  ? null == n
                    ? void 0
                    : n.messageParams(a)
                  : O.value
              )
            : l
        }),
        V = async () => {
          if (
            (!1 === u.touched &&
              !u.validated &&
              !(null == i ? void 0 : i.submits)) ||
            !C.value
          )
            return
          b.value = !1
          const e = c && 'default' !== c ? u.model[c] : u.model
          s.value && !u.filled(e) && (h.value = void 0)
          try {
            await P(e)
          } catch (r) {
            if (
              !(r instanceof Error) ||
              'cancelled' !== (null == r ? void 0 : r.message)
            )
              throw r
          }
        },
        P = async (e) => {
          ;(v++, (f = e))
          const r = v,
            n = {
              el$: u,
              form$: i,
              config: d,
              $services: p,
              params: _.value,
              type: E.value,
              attribute: u.genericName,
              filled: F,
              size: D,
              getType: j,
              getOther$: R,
            },
            a = t(e, n)
          Ve(a) && (k.value = !0)
          const o = Ve(a) ? await a : a
          if (!S(f, e) || r !== v) throw Error('cancelled')
          return (
            (k.value = !1),
            (b.value = !0 !== o),
            (h.value = 'string' == typeof o ? o : void 0),
            (B.value = !0),
            !b.value
          )
        },
        D = (e, r) => {
          if (null == e) return 0
          switch (r ? j(r) : E.value) {
            case 'array':
              return Array.isArray(e) ? e.length : 0
            case 'numeric':
              return Number(e)
            case 'file':
              return Number((null == e ? void 0 : e.size) || 0) / 1e3
            default:
              return String(e).length
          }
        },
        F = (e) => u.filled(e),
        j = (e) =>
          e.numeric
            ? 'numeric'
            : e.isArrayType
              ? 'array'
              : e.isFileType
                ? 'file'
                : 'string',
        R = (e) => (null == i ? void 0 : i.find(Ge(e, u.path)))
      if (i) {
        o &&
          r.watch(C, (e) => {
            e ? V() : ((b.value = !1), (h.value = void 0))
          })
        const e = (e) => void 0 !== e && 'string' != typeof e
        Object.entries(_.value).forEach(([t, n]) => {
          e(n) &&
            t.endsWith('$') &&
            r.watch(
              () => [n.value, n.validated],
              () => {
                V()
              },
              { deep: !0 }
            )
        })
      }
      return r.reactive({
        name: e,
        active: C,
        error: A,
        invalid: b,
        pending: k,
        errors: $,
        validated: B,
        timer: w,
        reset: () => {
          ;((h.value = void 0), (b.value = !1), (k.value = !1), (B.value = !1))
        },
        validate: async (e) => (
          clearTimeout(w.value),
          m && (m(new Error('cancelled')), (m = void 0)),
          !C.value || (s.value && !u.filled(e))
            ? ((b.value = !1), !(h.value = void 0))
            : x.value <= 0
              ? ((b.value = !1), await P(e))
              : new Promise((r, t) => {
                  ;((m = t),
                    (w.value = setTimeout(async () => {
                      ;((m = void 0), (w.value = void 0), (b.value = !1))
                      try {
                        r(await P(e))
                      } catch (n) {
                        t(n)
                      }
                    }, x.value)))
                })
        ),
        invalidate: () => (B.value = !1),
      })
    }
    return (...e) => {
      if (
        ((r = e[0]),
        (t = e[1]),
        null != r &&
          'object' == typeof r &&
          'attributes' in r &&
          'nullable' in r &&
          null != t &&
          'object' == typeof t &&
          'el$' in t)
      )
        return a(e[0], e[1])
      var r, t
      const o = (function (e, r) {
        return 1 === e.length && !0 !== r && $(e[0])
          ? Object.entries(e[0]).map(([e, r]) => ({ name: e, value: r }))
          : e.map((e) => ({ value: e }))
      })(e, null == n ? void 0 : n.params)
      return (e, r) => a({ ...e, attributes: o }, r)
    }
  }
  function ka(e, r) {
    const { dark: t, ...n } = r,
      a = { ...e, ...n }
    return (
      t && 'object' == typeof t && (a.dark = { ...(e.dark ?? {}), ...t }),
      a
    )
  }
  function Ba({ config: e, plugins: r }, t) {
    ;('function' == typeof e && e(t), null == r || r.forEach((e) => Ba(e, t)))
  }
  function wa({ globals: e, plugins: r }, t, n) {
    ;('function' == typeof e && e(t, n),
      null == r || r.forEach((e) => wa(e, t, n)))
  }
  function xa({ apply: e, props: r, emits: t, plugins: n }, a) {
    ;(e &&
      Object.values(a).forEach((n) => {
        'function' != typeof n &&
          me(e, n) &&
          (r && (n.props = { ...n.props, ...r }),
          t && (n.emits = [...n.emits, ...t]))
      }),
      null == n || n.forEach((e) => xa(e, a)))
  }
  function $a(e) {
    const r = { ...e }
    return (
      r.presets &&
        (r.presets = (function (e) {
          const r = {}
          for (const t in e) r[t] = xe(e[t])
          return r
        })(r.presets)),
      (r.classHelper = (r) => e.classHelper(r).replace(/\s/g, '')),
      r
    )
  }
  const Ca = {
      ...{
        strictConditions: !1,
        lazy: !0,
        grid: !0,
        nativeEmit: !1,
        mobileFirst: !0,
        useHead: !0,
        nonce: void 0,
        classHelpers: !1,
        locale: '',
        fallbackLocale: '',
        plugins: [],
        locales: {},
        languages: {},
        components: {},
        templates: {},
        presets: {},
        reclass: {},
        defaults: {},
        theme: {},
        tokens: {},
        build: {
          styleId: 'vueform-theme',
          scopedDarkMode: !1,
          darkClass: 'vf-dark',
          lightClass: 'vf-light',
        },
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
        rules: {},
        services: {},
        $http: {
          defaultMethod: 'GET',
          base64: !1,
          requestType: 'json',
          responseType: 'json',
          timeout: 0,
          withCredentials: !1,
          headers: {},
        },
        $security: { sanitize: !1 },
        uid: () => r.useId(),
        cols: (e, r) =>
          void 0 === r
            ? void 0 === e
              ? 'vf-col'
              : `vf-col-${e}`
            : void 0 === e
              ? `vf-col-${r}`
              : `vf-col-${r}-${e}`,
        label: (e, r) =>
          void 0 === r
            ? e < 12
              ? 'vf-horizontal'
              : 'vf-vertical'
            : e < 12
              ? `vf-col-${r}:vf-horizontal`
              : `vf-col-${r}:vf-vertical`,
        classHelper: (e) => `[__${e}__]`,
        localeParamPattern: /\{(\w+)\}/g,
        ruleMessageTag: (e, r) =>
          r ? `rule_${e}_${r}_error` : `rule_${e}_error`,
      },
      baseClasses: {
        '*element': {
          root: ({
            spaceTop: e,
            spaceBottom: r,
            lineTop: t,
            lineBottom: n,
          } = {}) => ({
            'vf-element': !0,
            'vf-space-top-1': 1 === e,
            'vf-space-top-2': 2 === e,
            'vf-space-top-3': 3 === e,
            'vf-space-bottom-1': 1 === r,
            'vf-space-bottom-2': 2 === r,
            'vf-space-bottom-3': 3 === r,
            'vf-line-top': !!t,
            'vf-line-bottom': !!n,
          }),
          panel: 'vf-panel',
          labelGroup: (e) => ({
            'vf-label-group': !0,
            'vf-h1': 1 === e,
            'vf-h2': 2 === e,
            'vf-h3': 3 === e,
            'vf-h4': 4 === e,
            'vf-h5': 5 === e,
            'vf-h6': 6 === e,
          }),
          label: 'vf-label',
          required: 'vf-required',
          elementGroup: 'vf-element-group',
          elementWrapper: 'vf-element-wrapper',
          help: 'vf-help',
          hint: 'vf-hint',
          errors: 'vf-errors',
          error: 'vf-error',
          messages: 'vf-messages',
          message: 'vf-message',
        },
      },
    },
    Sa = ba('accepted', (e) => ['yes', 'on', '1', 1, !0, 'true'].includes(e)),
    Ea = (e, { params: r, el$: t, $services: n }, a) => {
      var o
      Array.isArray(e) || (e = [e])
      const l = n.$date
      if (!l) throw new Error('Date service is not installed')
      let s
      if (r.date$)
        s = Array.isArray(r.date$.value)
          ? r.date$.value.map((e) => l(e, r.date$.valueFormat))
          : [l(r.date$.value, r.date$.valueFormat)]
      else
        switch (r.date) {
          case 'today':
            s = [l().startOf('day')]
            break
          case 'tomorrow':
            s = [l().startOf('day').add(1, 'days')]
            break
          case 'yesterday':
            s = [l().startOf('day').subtract(1, 'days')]
            break
          default:
            s = [l(r.date, null == (o = t.props) ? void 0 : o.valueFormat)]
        }
      return e.every((e) =>
        s.every((r) => {
          var n
          return a(l(e, null == (n = t.props) ? void 0 : n.valueFormat), r)
        })
      )
    },
    _a = ba('after', (e, r) => Ea(e, r, (e, r) => e.isAfter(r)), {
      params: ['date$'],
    }),
    Oa = ba(
      'after_or_equal',
      (e, r) => Ea(e, r, (e, r) => e.isSameOrAfter(r)),
      { params: ['date$'] }
    ),
    Aa = ba('alpha', (e) => new RegExp('^\\p{L}+$', 'u').test(e)),
    Va = ba('alpha_dash', (e) => /^[\p{L}\d\-_]+$/u.test(e)),
    Pa = ba('alpha_num', (e) => /^[\p{L}\d]+$/u.test(e)),
    Da = ba('array', (e) => Array.isArray(e)),
    Fa = ba('before', (e, r) => Ea(e, r, (e, r) => e.isBefore(r)), {
      params: ['date$'],
    }),
    ja = ba(
      'before_or_equal',
      (e, r) => Ea(e, r, (e, r) => e.isSameOrBefore(r)),
      { params: ['date$'] }
    ),
    Ra = ba(
      'between',
      (e, { size: r, params: t }) => {
        const n = r(e)
        return n >= Number(t.min) && n <= Number(t.max)
      },
      { params: ['min', 'max'], typed: !0 }
    ),
    Ta = ba('boolean', (e) => [!0, !1, 0, 1, '0', '1'].includes(e)),
    Ma = ba(
      'captcha',
      async (e, { el$: r }) => !r.verify || (await r.verify())
    ),
    Na = ba(
      'completed',
      (e, { el$: r, filled: t }) => {
        var n
        if (!r.Mask) return t(e)
        const a =
          null == (n = r.Mask.masked.currentMask) ? void 0 : n.isComplete
        return !(void 0 !== a && !r.empty) || a
      },
      { debounce: 1e3 }
    ),
    Ia = ba(
      'confirmed',
      (e, { el$: r, getOther$: t }) => e === t(`${r.path}_confirmed`)
    ),
    La = ba('date', (e, { $services: r }) => {
      if (!r.$date) throw new Error('Date service is not installed')
      return r.$date(e).isValid()
    }),
    qa = ba('date_equals', (e, { params: r }) => e === r.date, {
      params: ['date'],
    }),
    Ha = ba(
      'date_format',
      (e, { params: r, $services: t }) => {
        if (!t.$date) throw new Error('Date service is not installed')
        return e && t.$date(e, r.format).format(r.format) === e
      },
      { params: ['format'] }
    ),
    za = ba(
      'different',
      (e, { params: r, form$: t }) =>
        (!r.path$.validated &&
          r.path$.empty &&
          !(null == t ? void 0 : t.submits)) ||
        e != r.path$.value,
      {
        messageParams: ({ params: e }) => ({
          ...e,
          other: e.path$.genericName,
        }),
        params: ['path$'],
      }
    ),
    Wa = ba(
      'digits',
      (e, { params: r }) =>
        /^\d+$/.test(e) && String(e).length === Number(r.digits),
      { params: ['digits'] }
    ),
    Ua = ba(
      'digits_between',
      (e, { params: r }) =>
        /^\d+$/.test(e) &&
        String(e).length >= Number(r.min) &&
        String(e).length <= Number(r.min),
      { params: ['min', 'max'] }
    )
  const Ga = ba(
      'dimensions',
      async (e, { type: r, params: t }) => {
        if ('file' === r && !e) return !0
        if ('file' !== r || !Or(e)) return !1
        let n
        try {
          const r = await ((a = e),
          new Promise((e, r) => {
            const t = new FileReader()
            ;((t.onerror = () => {
              ;(t.abort(), r(new DOMException('File cannot be parsed.')))
            }),
              (t.onloadend = (r) => {
                e(r.target.result)
              }),
              t.readAsDataURL(a))
          }))
          n = await (function (e) {
            return new Promise((r, t) => {
              const n = new Image()
              ;((n.onerror = () => {
                t(new DOMException('Image could not be loaded.'))
              }),
                (n.onload = () => {
                  r(n)
                }),
                (n.src = e))
            })
          })(r)
        } catch {
          return !1
        }
        var a
        if (void 0 !== t.min_width && n.width < Number(t.min_width)) return !1
        if (void 0 !== t.max_width && n.width > Number(t.max_width)) return !1
        if (void 0 !== t.min_height && n.height < Number(t.min_height))
          return !1
        if (void 0 !== t.max_height && n.height > Number(t.max_height))
          return !1
        if (void 0 !== t.width && n.width !== Number(t.width)) return !1
        if (void 0 !== t.height && n.height !== Number(t.height)) return !1
        if (void 0 !== t.ratio) {
          const e = String(t.ratio)
          let r, a
          e.includes('/')
            ? ((r = Number(e.split('/')[0])), (a = Number(e.split('/')[1])))
            : ((r = Number(e)), (a = 1))
          const o = 1 / (Math.min(n.width, n.height) + 1)
          if (Math.abs(r / a - n.width / n.height) > o) return !1
        }
        return !0
      },
      {
        params: [
          'min_width?',
          'min_height?',
          'max_width?',
          'max_height?',
          'width?',
          'height?',
          'ratio?',
        ],
      }
    ),
    Ka = ba('distinct', (e) => {
      if (!Array.isArray(e)) return !0
      for (let r = 0; r < e.length; r++)
        for (let t = r + 1; t < e.length; t++) if (S(e[r], e[t])) return !1
      return !0
    }),
    Ya = ba('email', (e) =>
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        String(e).toLowerCase()
      )
    ),
    Za = ba('file', (e, { type: r }) => 'file' === r && (!e || Or(e))),
    Xa = ba('filled', (e, { el$: r }) => r.filled(e)),
    Ja = ba(
      'gt',
      (e, { params: r, size: t, form$: n }) =>
        (!r.path$.validated &&
          r.path$.empty &&
          !(null == n ? void 0 : n.submits)) ||
        t(e) > t(r.path$.value, r.path$),
      {
        params: ['path$'],
        typed: !0,
        messageParams: ({ params: e, size: r }) => ({
          ...e,
          value: r(e.path$.value, e.path$),
        }),
      }
    ),
    Qa = ba(
      'gte',
      (e, { params: r, size: t, form$: n }) =>
        (!r.path$.validated &&
          r.path$.empty &&
          !(null == n ? void 0 : n.submits)) ||
        t(e) >= t(r.path$.value, r.path$),
      {
        params: ['path$'],
        typed: !0,
        messageParams: ({ params: e, size: r }) => ({
          ...e,
          value: r(e.path$.value, e.path$),
        }),
      }
    ),
    eo = ba(
      'image',
      (e, { type: r }) =>
        'file' === r &&
        (!e ||
          (Or(e) &&
            ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(
              e.name.split('.').at(-1).toLowerCase()
            )))
    ),
    ro = ba('in_', (e, { params: r }) => r.includes(e), {
      params: !0,
      message: 'rule_not_in_error',
    }),
    to = ba(
      'in_array',
      (e, { params: r }) =>
        Array.isArray(r.path$.value) && r.path$.value.includes(e),
      {
        transformParams: ({ params: e }) => ({
          path$: e.path$.replace(/\.\*$/, ''),
        }),
        params: ['path$'],
      }
    ),
    no = ba('integer', (e) => {
      const r = yr(String(e).trim())
      return r === parseInt(r, 10)
    }),
    ao =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
    oo = ba('ipv4', (e) => ao.test(e)),
    lo =
      /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(\/(\d|\d\d|1[0-1]\d|12[0-8]))?$/,
    so = ba('ipv6', (e) => lo.test(e)),
    io = ba('ip', (e) => ao.test(e) || lo.test(e)),
    uo = ba('json', (e) =>
      (function (e) {
        try {
          JSON.parse(e)
        } catch {
          return !1
        }
        return !0
      })(e)
    ),
    co = ba(
      'lt',
      (e, { params: r, size: t, form$: n }) =>
        (!r.path$.validated &&
          r.path$.empty &&
          !(null == n ? void 0 : n.submits)) ||
        t(e) < t(r.path$.value, r.path$),
      {
        params: ['path$'],
        typed: !0,
        messageParams: ({ params: e, size: r }) => ({
          ...e,
          value: r(e.path$.value, e.path$),
        }),
      }
    ),
    po = ba(
      'lte',
      (e, { params: r, size: t, form$: n }) =>
        (!r.path$.validated &&
          r.path$.empty &&
          !(null == n ? void 0 : n.submits)) ||
        t(e) <= t(r.path$.value, r.path$),
      {
        params: ['path$'],
        typed: !0,
        messageParams: ({ params: e, size: r }) => ({
          ...e,
          value: r(e.path$.value, e.path$),
        }),
      }
    ),
    fo = ba('max', (e, { size: r, params: t }) => r(e) <= Number(t.max), {
      params: ['max'],
      typed: !0,
    }),
    mo = ba(
      'mimes',
      (e, { type: r, params: t }) =>
        'file' === r &&
        (!e ||
          (Or(e) &&
            t
              .map((e) => e.toLowerCase())
              .includes(e.name.split('.').at(-1).toLowerCase()))),
      { params: !0 }
    ),
    vo = ba(
      'mimetypes',
      (e, { type: r, params: t }) =>
        'file' === r &&
        (!e ||
          (Or(e) &&
            t.map((e) => e.toLowerCase()).includes(e.type.toLowerCase()))),
      { params: !0 }
    ),
    go = ba('min', (e, { size: r, params: t }) => r(e) >= Number(t.min), {
      params: ['min'],
      typed: !0,
    }),
    yo = ba('not_in', (e, { params: r }) => !r.includes(e), { params: !0 }),
    ho = ba('not_regex', (e) => !x(e).test(e), { message: 'rule_regex_error' }),
    bo = ba('nullable', () => !0),
    ko = ba(
      'numeric',
      (e) =>
        !isNaN(parseFloat(e)) &&
        isFinite(e) &&
        !/\s/.test(String(e)) &&
        !Boolean(String(e).match(/^0x[0-9a-f]+$/i))
    ),
    Bo = ba('regex', (e) => x(e).test(e)),
    wo = ba('required', (e, { el$: r }) => r.filled(e)),
    xo = ba(
      'same',
      (e, { params: r, form$: t }) =>
        (!r.path$.validated &&
          r.path$.empty &&
          !(null == t ? void 0 : t.submits)) ||
        e == r.path$.value,
      {
        messageParams: ({ params: e }) => ({
          ...e,
          other: e.path$.genericName,
        }),
        params: ['path$'],
      }
    ),
    $o = ba('size', (e, { size: r, params: t }) => r(e) === Number(t.size), {
      params: ['size'],
      typed: !0,
    }),
    Co = ba('string', (e) => 'string' == typeof e),
    So = ba('timezone', (e) => {
      try {
        return (Intl.DateTimeFormat(void 0, { timeZone: e }), !0)
      } catch {
        return !1
      }
    }),
    Eo = ba('url', (e) =>
      new RegExp(
        '^(?:(?:(?:https?|ftp):)?\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z0-9\\u00a1-\\uffff][a-z0-9\\u00a1-\\uffff_-]{0,62})?[a-z0-9\\u00a1-\\uffff]\\.)+(?:[a-z\\u00a1-\\uffff]{2,}\\.?))(?::\\d{2,5})?(?:[/?#]\\S*)?$',
        'i'
      ).test(e)
    ),
    _o = ba('uuid', (e) =>
      /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(e)
    ),
    Oo = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          accepted: Sa,
          after: _a,
          after_or_equal: Oa,
          alpha: Aa,
          alpha_dash: Va,
          alpha_num: Pa,
          array: Da,
          before: Fa,
          before_or_equal: ja,
          between: Ra,
          boolean: Ta,
          captcha: Ma,
          completed: Na,
          confirmed: Ia,
          date: La,
          date_equals: qa,
          date_format: Ha,
          different: za,
          digits: Wa,
          digits_between: Ua,
          dimensions: Ga,
          distinct: Ka,
          email: Ya,
          file: Za,
          filled: Xa,
          gt: Ja,
          gte: Qa,
          image: eo,
          in: ro,
          in_array: to,
          integer: no,
          ip: io,
          ipv4: oo,
          ipv6: so,
          json: uo,
          lt: co,
          lte: po,
          max: fo,
          mimes: mo,
          mimetypes: vo,
          min: go,
          not_in: yo,
          not_regex: ho,
          nullable: bo,
          numeric: ko,
          regex: Bo,
          required: wo,
          same: xo,
          size: $o,
          string: Co,
          timezone: So,
          url: Eo,
          uuid: _o,
        },
        Symbol.toStringTag,
        { value: 'Module' }
      )
    ),
    Ao = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          $conditions: Un,
          $date: Jn,
          $expression: Qn,
          $http: la,
          $locale: sa,
          $messageBag: ia,
          $security: ua,
          $theme: ya,
          $validation: ha,
        },
        Symbol.toStringTag,
        { value: 'Module' }
      )
    ),
    Vo = {
      ...{
        primary: '#07bf9b',
        danger: '#ef4444',
        success: '#10b981',
        white: '#ffffff',
        black: '#000000',
        gray50: '#f9fafb',
        gray100: '#f3f4f6',
        gray200: '#e5e7eb',
        gray300: '#d1d5db',
        gray400: '#9ca3af',
        gray500: '#6b7280',
        gray600: '#4b5563',
        gray700: '#374151',
        gray800: '#1f2937',
        gray900: '#111827',
        gutter: '1rem',
        space1: '1rem',
        space2: '2rem',
        space3: '3rem',
        spaceHr: '0.25rem',
        px: '0.75rem',
        py: '0.375rem',
        radius: '0.375rem',
        radiusSm: '0.25rem',
        radiusLg: '0.75rem',
        borderWidthT: '1px',
        borderWidthR: '1px',
        borderWidthB: '1px',
        borderWidthL: '1px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        fontSizeSm: '0.875em',
        lineHeightSm: 'inherit',
        letterSpacingSm: 'inherit',
        transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '200ms',
        iconAdd:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 0 1 0-2h5V2a1 1 0 0 1 1-1z' fill='currentColor'/%3E%3C/svg%3E\")",
        iconRemove:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M1.29 1.29a1 1 0 0 1 1.42 0L8 6.59l5.29-5.3a1 1 0 1 1 1.42 1.42L9.41 8l5.3 5.29a1 1 0 0 1-1.42 1.42L8 9.41l-5.29 5.3a1 1 0 0 1-1.42-1.42L6.59 8 1.29 2.71a1 1 0 0 1 0-1.42z' fill='currentColor'/%3E%3C/svg%3E\")",
        iconSort:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='0' y='3' width='16' height='2' rx='1' fill='currentColor'/%3E%3Crect x='0' y='7' width='16' height='2' rx='1' fill='currentColor'/%3E%3Crect x='0' y='11' width='16' height='2' rx='1' fill='currentColor'/%3E%3C/svg%3E\")",
        iconLoading:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6.5' fill='none' stroke='currentColor' stroke-width='1.5' stroke-dasharray='30.6 10.2' stroke-linecap='round'/%3E%3C/svg%3E\")",
      },
      primaryHover: 'color-mix(in srgb, $primary 100%, black 20%)',
      primaryDisabled: 'color-mix(in srgb, $primary 80%, white 100%)',
      primaryLight: 'color-mix(in srgb, $primary 10%, transparent)',
      dangerHover: 'color-mix(in srgb, $danger 100%, black 20%)',
      dangerDisabled: 'color-mix(in srgb, $danger 80%, white 100%)',
      dangerLight: 'color-mix(in srgb, $danger 10%, transparent)',
      successHover: 'color-mix(in srgb, $success 100%, black 20%)',
      successDisabled: 'color-mix(in srgb, $success 80%, white 100%)',
      successLight: 'color-mix(in srgb, $success 10%, transparent)',
      textOnPrimary: '$white',
      textOnPrimaryHover: '$white',
      textOnPrimaryDisabled: '$white',
      textDisabled: '$gray400',
      textSoft: '$gray500',
      linkColor: '$primary',
      bgDisabled: '$gray100',
      borderDisabled: '$gray300',
      ring: '2px solid color-mix(in srgb, $primary 30%, transparent)',
      ringDanger: '2px solid color-mix(in srgb, $primary 30%, transparent)',
      iconWidth: '0.75rem',
      iconHeight: '0.75rem',
      ...{
        formErrorsMargin: '0 0 $gutter 0',
        formErrorsPadding: '0.5rem 0.75rem',
        formErrorsBg: '$dangerLight',
        formErrorsColor: '$danger',
        formErrorsBorderColor: '$danger',
        formErrorsBorderStyle: 'solid',
        formErrorsBorderWidth: '1px',
        formErrorsRadius: '$radius',
        formMessagesMargin: '0 0 $gutter 0',
        formMessagesPadding: '0.5rem 0.75rem',
        formMessagesBg: '$successLight',
        formMessagesColor: '$success',
        formMessagesBorderColor: '$success',
        formMessagesBorderStyle: 'solid',
        formMessagesBorderWidth: '1px',
        formMessagesRadius: '$radius',
        elementsGutterX: '$gutter',
        elementsGutterY: '$gutter',
        elementGroupGutterX: '0',
        elementGroupGutterY: '0.25rem',
        elementWrapperPadding: '0',
        elementLineBorderColor: '$gray300',
        labelFontSize: '$fontSize',
        labelFontWeight: '600',
        labelGroupVPadding: '0 0 0.375rem 0',
        labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',
        requiredContent: "'*'",
        requiredW: 'auto',
        requiredH: 'auto',
        requiredBg: 'transparent',
        requiredColor: 'inherit',
        requiredIcon: 'none',
        helpFontSize: '$fontSizeSm',
        helpLineHeight: '$lineHeightSm',
        helpPadding: '0',
        helpBg: 'transparent',
        helpColor: '$textSoft',
        helpBorderColor: 'transparent',
        helpBorderStyle: 'solid',
        helpBorderWidth: '0',
        helpRadius: '$radius',
        hintFontSize: '$fontSizeSm',
        hintLineHeight: '$lineHeightSm',
        hintPadding: '0',
        hintBg: 'transparent',
        hintColor: '$textSoft',
        hintBorderColor: 'transparent',
        hintBorderStyle: 'solid',
        hintBorderWidth: '0',
        hintRadius: '$radius',
        errorsFontSize: '$fontSizeSm',
        errorsLineHeight: '$lineHeightSm',
        errorsPadding: '0',
        errorsBg: 'transparent',
        errorsColor: '$danger',
        errorsBorderColor: 'transparent',
        errorsBorderStyle: 'solid',
        errorsBorderWidth: '0',
        errorsRadius: '$radius',
        messagesFontSize: '$fontSizeSm',
        messagesLineHeight: '$lineHeightSm',
        messagesPadding: '0',
        messagesBg: 'transparent',
        messagesColor: '$success',
        messagesBorderColor: '$borderSuccess',
        messagesBorderStyle: 'solid',
        messagesBorderWidth: '0',
        messagesRadius: '$radius',
        headingsFontFamily: 'inherit',
        headingsFontWeight: '700',
        headingsLineHeight: '1.2',
        headingsLetterSpacing: '0',
        h1FontSize: '2.125rem',
        h2FontSize: '1.875rem',
        h3FontSize: '1.5rem',
        h4FontSize: '1.25rem',
        h5FontSize: '1.125rem',
        h6FontSize: '1rem',
        blockquoteFontFamily: '$fontFamily',
        blockquoteFontSize: '$fontSize',
        blockquoteFontWeight: 'inherit',
        blockquoteLineHeight: '$lineHeight',
        blockquoteLetterSpacing: '$letterSpacing',
        blockquotePadding: '0.25rem 0.75rem',
        hrPadding: '0.25rem 0',
        inputFontSize: '$fontSize',
        inputTransition: 'all $transitionTiming $transitionDuration',
        inputPt: '$py',
        inputPr: '$px',
        inputPb: '$py',
        inputPl: '$px',
        inputShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
        inputBg: '$white',
        inputBgAutofill: '$white',
        inputBgDanger: '$white',
        inputBgDisabled: '$bgDisabled',
        inputColor: '$gray800',
        inputColorAutofill: '$gray800',
        inputColorDanger: '$gray800',
        inputColorDisabled: '$textDisabled',
        inputBorderColor: '$gray300',
        inputBorderColorFocus: '$primary',
        inputBorderColorDanger: '$gray300',
        inputBorderColorDisabled: '$borderDisabled',
        inputBorderStyle: 'solid',
        inputBorderWidthT: '$borderWidthT',
        inputBorderWidthR: '$borderWidthR',
        inputBorderWidthB: '$borderWidthB',
        inputBorderWidthL: '$borderWidthL',
        inputRadius: '$radius',
        languagesFontSize: '$fontSize',
        languagesFontWeight: 'inherit',
        languagesGutter: '$gutter',
        languagesMargin: '0 0 $gutter 0',
        languagePadding: '0 1rem 0.5rem 1rem',
        languageBg: 'transparent',
        languageBgSelected: 'transparent',
        languageBgDanger: 'transparent',
        languageBgSelectedDanger: 'transparent',
        languageColor: 'inherit',
        languageColorSelected: 'inherit',
        languageColorDanger: '$danger',
        languageColorSelectedDanger: '$danger',
        languageBorderColor: 'transparent',
        languageBorderColorSelected: '$primary',
        languageBorderColorDanger: 'transparent',
        languageBorderColorSelectedDanger: '$danger',
        languageBorderWidth: '0 0 2px 0',
        languageRadius: '0px',
        btnFontSize: '$fontSize',
        btnFontWeight: 'inherit',
        btnFontSizeSm: '$fontSizeSm',
        btnFontWeightSm: 'inherit',
        btnTransition:
          'background-color $transitionTiming $transitionDuration, color $transitionTiming $transitionDuration, border-color $transitionTiming $transitionDuration',
        btnWidth: 'auto',
        btnGutter: '0.5rem',
        btnPaddingY: '$py',
        btnPaddingX: '$px',
        btnGutterSm: '0.5rem',
        btnPaddingYSm: '0.0625rem',
        btnPaddingXSm: '0.125rem',
        btnShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
        btnDisabledOpacity: '0.6',
        btnBg: '$gray200',
        btnBgHover: '$gray300',
        btnBgLight: '$gray100',
        btnBgDisabled: '$gray100',
        btnColor: '$gray700',
        btnColorHover: '$gray800',
        btnColorDisabled: '$gray400',
        btnColorOutline: '$gray700',
        btnBorderColor: '$gray200',
        btnBorderColorHover: '$gray300',
        btnBorderColorDisabled: '$gray100',
        btnBorderColorOutline: '$gray400',
        btnBorderColorOutlineDisabled: '$gray300',
        btnBorderWidth: '1px',
        btnBorderStyle: 'solid',
        btnRadius: '$radius',
        btnRadiusSm: '$radiusSm',
        ...{
          choiceFontSize: '$fontSize',
          choiceLineHeight: '$lineHeight',
          choiceTransition: 'all $transitionTiming $transitionDuration',
          choiceWidth: '1rem',
          choiceHeight: '1rem',
          choiceGutter: '0.375rem',
          choiceMargin: 'max(0px, calc((1lh - $choiceHeight) / 2)) 0 0 0',
          choiceShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
          choiceBg: '$white',
          choiceBgDanger: '$white',
          choiceBgDisabled: '$bgDisabled',
          choiceBgChecked: '$primary',
          choiceBgCheckedDanger: '$primary',
          choiceBgCheckedDisabled: '$primaryDisabled',
          choiceColor: 'inherit',
          choiceColorDanger: 'inherit',
          choiceColorDisabled: '$textDisabled',
          choiceIconColor: '$textOnPrimary',
          choiceIconColorDisabled: '$textOnPrimaryDisabled',
          choiceIconColorDanger: '$white',
          choiceBorderColor: '$gray300',
          choiceBorderColorFocus: '$primary',
          choiceBorderColorDanger: '$gray300',
          choiceBorderColorDisabled: '$borderDisabled',
          choiceBorderColorChecked: '$primary',
          choiceBorderColorCheckedDanger: '$primary',
          choiceBorderColorCheckedDisabled: '$primaryDisabled',
          choiceBorderWidthT: '1px',
          choiceBorderWidthR: '1px',
          choiceBorderWidthB: '1px',
          choiceBorderWidthL: '1px',
          choiceRadius: '$radiusSm',
          choiceIconChecked:
            "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")",
          choiceIconSelected:
            "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3.5'/%3e%3c/svg%3e\")",
        },
        choicesGutterX: '0.75rem',
        choicesGutterY: '0.25rem',
        choicesDirection: 'column',
        fileGutterX: 'calc($gutter / 2)',
        fileGutterY: 'calc($gutter / 2)',
        fileMargin: '0 0 calc($gutter / 2) 0',
        fileItemGutterX: 'calc($gutter / 2)',
        fileItemGutterY: 'calc($gutter / 2)',
        gridGutterX: '$gutter',
        gridGutterY: '$gutter',
        gridHeaderFontSize: '$fontSize',
        gridHeaderFontWeight: '700',
        gridHeaderLineHeight: '$lineHeight',
        gridColHeaderColor: 'inherit',
        gridRowHeaderColor: 'inherit',
        groupGutterX: '$gutter',
        groupGutterY: '$gutter',
        groupGridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        groupGutterStackedX: 'calc($gutter / 2)',
        groupGutterStackedY: 'calc($gutter / 2)',
        groupWrappedPadding: '1.5rem',
        groupWrappedBorderWidth: '1px',
        groupWrappedBorderColor: '$gray300',
        groupWrappedBorderStyle: 'solid',
        groupWrappedRadius: '$radius',
        groupWrappedBg: 'transparent',
        listGutterX: '$gutter',
        listGutterY: '$gutter',
        listItemGutterX: '$gutter',
        listItemGutterY: '0',
        listItemAlign: 'center',
        listRemoveAlign: 'center',
        listRemovePosition: 'relative',
        listRemoveInset: '0',
        listRemoveTransform: 'none',
        listRemoveOrder: '0',
        listSortAlign: 'center',
        listSortPosition: 'relative',
        listSortInset: '0',
        listSortTransform: 'none',
        listSortOrder: '0',
        listDraggingOpacity: '0.5',
        listWrappedRemovePosition: 'absolute',
        listWrappedRemoveInset: '0.25rem 0.25rem auto auto',
        listWrappedRemoveTransform: 'none',
        listWrappedSortPosition: 'absolute',
        listWrappedSortInset: '50% auto auto 0px',
        listWrappedSortTransform: 'translateY(-50%) translateX(-50%)',
        listPlaceholderBg: 'transparent',
        listPlaceholderBorderWidth: '0',
        listPlaceholderBorderColor: 'transparent',
        listPlaceholderBorderStyle: 'solid',
        listPlaceholderRadius: '$radius',
        listPlaceholderFontSize: '$fontSizeSm',
        listPlaceholderColor: '$textSoft',
        listPlaceholderAlign: 'left',
        listPlaceholderFontStyle: 'italic',
        listPlaceholderPadding: 'calc($py + $borderWidthT + $borderWidthB) 0',
        listAddMargin: 'calc($gutter * 0.66) 0 0 0',
        matrixGutterX: '$gutter',
        matrixGutterY: '$gutter',
        matrixHeaderFontSize: '$fontSize',
        matrixHeaderFontWeight: '700',
        matrixHeaderLineHeight: '$lineHeight',
        matrixColHeaderColor: 'inherit',
        matrixRowHeaderColor: 'inherit',
        matrixSortAlign: 'center',
        matrixSortPosition: 'relative',
        matrixSortInset: '0',
        matrixSortTransform: 'none',
        matrixSortOrder: '0',
        matrixRemoveAlign: 'center',
        matrixRemovePosition: 'relative',
        matrixRemoveInset: '0',
        matrixRemoveTransform: 'none',
        matrixRemoveOrder: '0',
        matrixAddMargin: '$gutter 0 0 0',
        tabsFontSize: '$fontSize',
        tabsFontWeight: 'inherit',
        tabsGutterX: '0',
        tabsGutterY: '0',
        tabsMargin: '0 0 $gutter 0',
        tabPadding: '0 1rem 0.5rem 1rem',
        tabBg: 'transparent',
        tabBgSelected: 'transparent',
        tabBgDanger: 'transparent',
        tabBgSelectedDanger: 'transparent',
        tabColor: 'inherit',
        tabColorSelected: 'inherit',
        tabColorDanger: '$danger',
        tabColorSelectedDanger: '$danger',
        tabBorderColor: 'transparent',
        tabBorderColorSelected: '$primary',
        tabBorderColorDanger: 'transparent',
        tabBorderColorSelectedDanger: '$danger',
        tabBorderWidth: '0 0 2px 0',
        tabRadius: '0px',
        ...{
          selectIconWidth: '0.5rem',
          selectIconHeight: '0.625rem',
          selectPlaceholderColor: '$gray500',
          selectIconCaret:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12' fill='none' stroke='%234b5563' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 4.5L5 1l4 3.5'/%3E%3Cpath d='M1 7.5L5 11l4-3.5'/%3E%3C/svg%3E\")",
        },
        ...{
          stepsFontSize: '$fontSize',
          stepsFontWeight: 'inherit',
          stepsMargin: '0 0 $gutter 0',
          stepsBgEnabled: '$primary',
          stepsBgDisabled: '$gray200',
          stepsBgDanger: '$danger',
          stepsColorEnabled: 'inherit',
          stepsColorDisabled: '$gray400',
          stepsColorDanger: '$danger',
          stepsColorSelected: 'inherit',
          stepsIconColor: '$white',
          stepsIconSelected:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><circle cx='4' cy='4' r='4' fill='white'/></svg>\")",
          stepsIconCompleted:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' d='M2 8l4 5 8-10'/></svg>\")",
          stepsIconDanger:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='6' y='0' width='4' height='9' rx='2' fill='white'/><circle cx='8' cy='13' r='2' fill='white'/></svg>\")",
        },
        navGutter: '$gutter',
        navMargin: '$gutter 0 0 0',
        navJustify: 'space-between',
        addonFontFamily: '$fontFamily',
        addonFontSize: '$fontSize',
        addonFontWeight: 'normal',
        addonBeforePadding: '0 $px',
        addonBeforeMargin: '0',
        addonAfterPadding: '0 $px',
        addonAfterMargin: '0',
        addonBg: '$white',
        addonBgDanger: '$white',
        addonColor: 'inherit',
        addonColorDanger: 'inherit',
        addonBorderColor: '$gray300',
        addonBorderColorDanger: '$gray300',
        addonBorderStyle: 'solid',
        addonBorderWidth: '1px',
        addonRadius: 'calc($radius - $borderWidthT)',
        tabularBg: '$white',
        tabularBorderColor: '$gray300',
        tabularBorderColorFocus: '$primary',
        tabularBorderWidth: '1px',
        tabularBorderStyle: 'solid',
        tabularRadius: '$radius',
        tabularHeaderFontSize: '$fontSize',
        tabularHeaderFontWeight: '700',
        tabularHeaderLineHeight: '$lineHeight',
        tabularHeaderPadding: '$py $px',
        tabularColHeaderBg: '$gray100',
        tabularColHeaderColor: 'inherit',
        tabularColHeaderBorderColor: '$gray300',
        tabularRowHeaderBg: '$gray100',
        tabularRowHeaderColor: 'inherit',
        tabularRowHeaderBorderColor: '$gray300',
        controlMinWidth: '1.25rem',
        controlMinHeight: '1.25rem',
        controlIconWidth: '0.625rem',
        controlIconHeight: '0.625rem',
        controlIconRemove: '$iconRemove',
        controlIconSort: '$iconSort',
        controlShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
        controlTransition:
          'background-color $transitionTiming $transitionDuration, color $transitionTiming $transitionDuration, border-color $transitionTiming $transitionDuration',
        controlBg: '$gray200',
        controlBgHover: '$gray300',
        controlColor: '$gray900',
        controlColorHover: '$gray900',
        controlBorderColor: '$gray200',
        controlBorderColorHover: '$gray300',
        controlBorderWidth: '1px',
        controlBorderStyle: 'solid',
        controlRadius: '$radiusSm',
      },
      dark: {
        gray50: '#efefef',
        gray100: '#dcdcdc',
        gray200: '#bdbdbd',
        gray300: '#a0a0a0',
        gray400: '#848484',
        gray500: '#737373',
        gray600: '#393939',
        gray700: '#323232',
        gray800: '#262626',
        gray900: '#191919',
        textSoft: '$gray300',
        primaryDisabled: 'color-mix(in srgb, $primary 80%, $gray600 60%)',
        textOnPrimaryDisabled: '$gray200',
        dangerLight: 'color-mix(in srgb, $danger 15%, $gray600 10%)',
        dangerDisabled: 'color-mix(in srgb, $danger 80%, $gray600 80%)',
        successLight: 'color-mix(in srgb, $success 15%, $gray600 10%)',
        successDisabled: 'color-mix(in srgb, $success 80%, $gray600 80%)',
        bgDisabled: '$gray700',
        borderDisabled: '$gray600',
        textDisabled: '$gray500',
        inputBg: '$gray900',
        inputBgAutofill: '$gray900',
        inputBgDanger: '$gray900',
        inputBgDisabled: '$bgDisabled',
        inputColor: '$white',
        inputColorAutofill: '$white',
        inputColorDanger: '$white',
        inputColorDisabled: '$textDisabled',
        inputBorderColor: '$gray600',
        inputBorderColorDanger: '$gray600',
        inputBorderColorDisabled: '$borderDisabled',
        selectIconCaret:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12' fill='none' stroke='%23737373' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 4.5L5 1l4 3.5'/%3E%3Cpath d='M1 7.5L5 11l4-3.5'/%3E%3C/svg%3E\")",
        choiceBg: '$gray900',
        choiceBgDanger: '$gray900',
        choiceBorderColor: '$gray600',
        choiceBorderColorDanger: '$gray600',
        btnBg: '$gray600',
        btnBgHover: '$gray700',
        btnBgLight: '$gray700',
        btnBgDisabled: '$gray700',
        btnColor: '$white',
        btnColorHover: '$white',
        btnColorDisabled: '$gray400',
        btnColorOutline: '$gray300',
        btnBorderColor: '$gray600',
        btnBorderColorHover: '$gray700',
        btnBorderColorDisabled: '$gray700',
        btnBorderColorOutline: '$gray700',
        btnBorderColorOutlineDisabled: '$gray600',
        addonBg: '$gray900',
        addonBgDanger: '$gray900',
        addonBorderColor: '$gray700',
        addonBorderColorDanger: '$gray700',
        listWrappedBorderColor: '$gray600',
        stepsBgDisabled: '$gray600',
        controlBg: '$gray600',
        controlBgHover: '$gray500',
        controlColor: '$white',
        controlColorHover: '$white',
        controlBorderColor: '$gray700',
        controlBorderColorHover: '$gray600',
        tabularBg: '$gray900',
        tabularBorderColor: '$gray700',
        tabularColHeaderBg: '$gray800',
        tabularColHeaderBorderColor: '$gray700',
        tabularRowHeaderBg: '$gray800',
        tabularRowHeaderBorderColor: '$gray700',
        elementLineBorderColor: '$gray600',
      },
    },
    Po = {
      ...Ca,
      components: zn,
      rules: Oo,
      services: Ao,
      theme: Vo,
      locales: {
        en_US: {
          file_button_text: 'Choose file',
          file_button_text_multiple: 'Choose files',
          sr_editing_language: 'Editing language',
          sr_step_error: 'Please fix errors to move to the next step',
          sr_step_loading: 'Processing data, please wait...',
          sr_list_add: 'Add item',
          sr_list_remove: 'Remove item {index}',
          sr_list_sort: 'Reorder item {index}',
          sr_matrix_add: 'Add row',
          sr_matrix_remove: 'Remove row {index}',
          steps_back: 'Back',
          steps_next: 'Next',
          steps_finish: 'Finish',
          rule_default_error: 'Invalid field',
          rule_accepted_error: 'The {attribute} must be accepted.',
          rule_active_url_error: 'The {attribute} is not a valid URL.',
          rule_after_error: 'The {attribute} must be a date after {date}.',
          rule_after_or_equal_error:
            'The {attribute} must be a date after or equal to {date}.',
          rule_alpha_error: 'The {attribute} may only contain letters.',
          rule_alpha_dash_error:
            'The {attribute} may only contain letters, numbers, dashes and underscores.',
          rule_alpha_num_error:
            'The {attribute} may only contain letters and numbers.',
          rule_array_error: 'The {attribute} must be an array.',
          rule_before_error: 'The {attribute} must be a date before {date}.',
          rule_before_or_equal_error:
            'The {attribute} must be a date before or equal to {date}.',
          rule_between_numeric_error:
            'The {attribute} must be between {min} and {max}.',
          rule_between_file_error:
            'The {attribute} must be between {min} and {max} kilobytes.',
          rule_between_string_error:
            'The {attribute} must be between {min} and {max} characters.',
          rule_between_array_error:
            'The {attribute} must have between {min} and {max} items.',
          rule_boolean_error: 'The {attribute} field must be true or false.',
          rule_captcha_error: 'Please verify that you are not a robot.',
          rule_completed_error: 'Please fill in a valid phone number.',
          rule_confirmed_error: 'The {attribute} confirmation does not match.',
          rule_date_error: 'The {attribute} is not a valid date.',
          rule_date_format_error:
            'The {attribute} does not match the format {format}.',
          rule_date_equals_error: 'The {attribute} must be equal to {date}.',
          rule_different_error:
            'The {attribute} and {other} must be different.',
          rule_digits_error: 'The {attribute} must be {digits} digits.',
          rule_digits_between_error:
            'The {attribute} must be between {min} and {max} digits.',
          rule_dimensions_error:
            'The {attribute} has invalid image dimensions.',
          rule_distinct_error: 'The {attribute} field has a duplicate value.',
          rule_email_error: 'The {attribute} must be a valid email address.',
          rule_exists_error: 'The selected {attribute} is invalid.',
          rule_file_error: 'The {attribute} must be a file.',
          rule_filled_error: 'The {attribute} field must have a value.',
          rule_gt_numeric_error:
            'The {attribute} must be greater than {value}.',
          rule_gt_file_error:
            'The {attribute} must be greater than {value} kilobytes.',
          rule_gt_string_error:
            'The {attribute} must be greater than {value} characters.',
          rule_gt_array_error:
            'The {attribute} must have more than {value} items.',
          rule_gte_numeric_error:
            'The {attribute} must be greater than or equal {value}.',
          rule_gte_file_error:
            'The {attribute} must be greater than or equal {value} kilobytes.',
          rule_gte_string_error:
            'The {attribute} must be greater than or equal {value} characters.',
          rule_gte_array_error:
            'The {attribute} must have {value} items or more.',
          rule_image_error: 'The {attribute} must be an image.',
          rule_in_error: 'The selected {attribute} is invalid.',
          rule_in_array_error:
            'The {attribute} field does not exist in {other}.',
          rule_integer_error: 'The {attribute} must be an integer.',
          rule_ip_error: 'The {attribute} must be a valid IP address.',
          rule_ipv4_error: 'The {attribute} must be a valid IPv4 address.',
          rule_ipv6_error: 'The {attribute} must be a valid IPv6 address.',
          rule_json_error: 'The {attribute} must be a valid JSON string.',
          rule_lt_numeric_error: 'The {attribute} must be less than {value}.',
          rule_lt_file_error:
            'The {attribute} must be less than {value} kilobytes.',
          rule_lt_string_error:
            'The {attribute} must be less than {value} characters.',
          rule_lt_array_error:
            'The {attribute} must have less than {value} items.',
          rule_lte_numeric_error:
            'The {attribute} must be less than or equal {value}.',
          rule_lte_file_error:
            'The {attribute} must be less than or equal {value} kilobytes.',
          rule_lte_string_error:
            'The {attribute} must be less than or equal {value} characters.',
          rule_lte_array_error:
            'The {attribute} must not have more than {value} items.',
          rule_max_numeric_error:
            'The {attribute} may not be greater than {max}.',
          rule_max_file_error:
            'The {attribute} may not be greater than {max} kilobytes.',
          rule_max_string_error:
            'The {attribute} may not be greater than {max} characters.',
          rule_max_array_error:
            'The {attribute} may not have more than {max} items.',
          rule_mimes_error: 'The {attribute} must be a file of type: {values}.',
          rule_mimetypes_error:
            'The {attribute} must be a file of type: {values}.',
          rule_min_numeric_error: 'The {attribute} must be at least {min}.',
          rule_min_file_error:
            'The {attribute} must be at least {min} kilobytes.',
          rule_min_string_error:
            'The {attribute} must be at least {min} characters.',
          rule_min_array_error:
            'The {attribute} must have at least {min} items.',
          rule_not_in_error: 'The selected {attribute} is invalid.',
          rule_not_regex_error: 'The {attribute} format is invalid.',
          rule_numeric_error: 'The {attribute} must be a number.',
          rule_present_error: 'The {attribute} field must be present.',
          rule_regex_error: 'The {attribute} format is invalid.',
          rule_required_error: 'The {attribute} field is required.',
          rule_required_if_error:
            'The {attribute} field is required when {other} is {value}.',
          rule_required_unless_error:
            'The {attribute} field is required unless {other} is in {values}.',
          rule_required_with_error:
            'The {attribute} field is required when {values} is present.',
          rule_required_with_all_error:
            'The {attribute} field is required when {values} are present.',
          rule_required_without_error:
            'The {attribute} field is required when {values} is not present.',
          rule_required_without_all_error:
            'The {attribute} field is required when none of {values} are present.',
          rule_same_error: 'The {attribute} and {other} must match.',
          rule_size_numeric_error: 'The {attribute} must be {size}.',
          rule_size_file_error: 'The {attribute} must be {size} kilobytes.',
          rule_size_string_error: 'The {attribute} must be {size} characters.',
          rule_size_array_error: 'The {attribute} must contain {size} items.',
          rule_string_error: 'The {attribute} must be a string.',
          rule_timezone_error: 'The {attribute} must be a valid zone.',
          rule_unique_error: 'The {attribute} has already been taken.',
          rule_uploaded_error: 'The {attribute} failed to upload.',
          rule_url_error: 'The {attribute} format is invalid.',
          rule_uuid_error: 'The {attribute} must be a valid UUID.',
          rule_remote_error: 'The {attribute} field is invalid.',
          expression_error: 'Error',
        },
      },
      locale: 'en_US',
    },
    Do =
      ((Fo = Po),
      function (e) {
        let t = !1
        const n = {
            ...Fo,
            ...e,
            locale: r.ref(e.locale || Fo.locale),
            components: { ...Fo.components, ...e.components },
            services: { ...Fo.services, ...e.services },
            build: { ...Fo.build, ...e.build },
            baseClasses: e.baseClasses
              ? P(Fo.baseClasses ?? {}, e.baseClasses, 1)
              : Fo.baseClasses,
          },
          a = n.tokens
        a &&
          'object' == typeof a &&
          Object.keys(a).length &&
          (n.theme = ka(n.theme, a))
        const o = $a(n)
        return {
          install: (e) => {
            t ||
              (e.runWithContext(() => {
                var t
                ;(o.plugins.forEach((e) => Ba(e, o)),
                  (function (e, r) {
                    f(e, r)
                  })(o, e))
                const n = { defaultBreakpoint: r.computed(() => 'base') }
                ;(null == (t = null == o ? void 0 : o.globals) ||
                  t.call(o, o, n),
                  o.plugins.forEach((e) => wa(e, o, n)),
                  (function (e, r) {
                    j(e, r)
                  })(n, e),
                  N(e).$theme.install(e),
                  (function (e) {
                    const r = m(),
                      t = r.defaults || {},
                      n = Object.keys(r.components).filter(
                        (e) => !e.includes('_')
                      ),
                      a = {}
                    for (const o of n) {
                      a[o] = {}
                      const e = [t['*']]
                      ;(r.components[o].element && e.push(t['*element']),
                        e.push(t[o]))
                      for (const r in e) {
                        const t = e[r]
                        void 0 !== t && (a[o] = A(a[o], t, r))
                      }
                    }
                    Be(a, e)
                  })(e),
                  o.plugins.forEach((e) => xa(e, o.components)),
                  Object.entries(o.components).forEach(([r, t]) =>
                    e.component(r, t)
                  ))
              }),
              (t = !0))
          },
          service: (e, r) => {
            if (t)
              throw new Error(
                'Cannot register a service after Vueform has been installed'
              )
            o.services[e] = r
          },
          use: (e) => {
            if (t)
              throw new Error(
                'Cannot register a plugin after Vueform has been installed'
              )
            o.plugins.push(e)
          },
          getCSS: () => ga(o),
          getStyleTag: () => {
            const e = ga(o)
            if (!e) return ''
            const r = o.nonce ? ` nonce="${o.nonce}"` : ''
            return `<style id="${o.build.styleId}"${r}>${e}</style>`
          },
        }
      })
  var Fo
  return (
    (e.createVueform = function (e) {
      const r = { ...(e ?? {}) }
      return (
        r.tokens && ((r.theme = ka(Vo, r.tokens)), delete r.tokens),
        Do(r)
      )
    }),
    Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
    e
  )
})({}, Vue)
