import {
  getComponentDef,
  getGenericInstance,
  getInstanceRawProp,
  getInstanceRawPropKeys,
  hasInstanceRawProp,
  isVaporInstance,
  type GenericInstance,
} from '@vueform/core'

const vdomInstance = (props: Record<string, any> | null) =>
  ({ vnode: { props } }) as unknown as GenericInstance

const vaporInstance = (rawProps: Record<string, any>) =>
  ({ vapor: true, rawProps }) as unknown as GenericInstance

describe('instance utils', () => {
  describe('isVaporInstance', () => {
    it('should discriminate vapor instances from vdom instances', () => {
      expect(isVaporInstance(vaporInstance({}) as any)).toBe(true)
      expect(isVaporInstance(vdomInstance({}) as any)).toBe(false)
      expect(isVaporInstance(null)).toBe(false)
      expect(isVaporInstance(undefined)).toBe(false)
    })
  })

  describe('getGenericInstance', () => {
    it('should return null outside setup context', () => {
      expect(getGenericInstance()).toBe(null)
    })
  })

  describe('getComponentDef', () => {
    it('should return $options for vdom instances with a proxy', () => {
      const vm = {
        proxy: { $options: { name: 'VfMerged', element: true } },
        type: { name: 'VfRaw' },
      } as unknown as GenericInstance

      expect(getComponentDef(vm).name).toBe('VfMerged')
    })

    it('should fall back to type for vdom instances without a proxy', () => {
      const vm = {
        proxy: null,
        type: { name: 'VfRaw', element: true },
      } as unknown as GenericInstance

      expect(getComponentDef(vm).name).toBe('VfRaw')
    })

    it('should return type for vapor instances', () => {
      const vm = {
        vapor: true,
        type: { name: 'VfVapor', element: true },
      } as unknown as GenericInstance

      expect(getComponentDef(vm).name).toBe('VfVapor')
      expect(getComponentDef(vm).element).toBe(true)
    })
  })

  describe('vdom raw props', () => {
    it('should read keys, presence, and values from vnode props', () => {
      const vm = vdomInstance({ label: 'Name', 'input-type': 'text' })

      expect(getInstanceRawPropKeys(vm)).toEqual(['label', 'input-type'])
      expect(hasInstanceRawProp(vm, 'label')).toBe(true)
      expect(hasInstanceRawProp(vm, 'missing')).toBe(false)
      expect(getInstanceRawProp(vm, 'label')).toBe('Name')
      expect(getInstanceRawProp(vm, 'missing')).toBe(undefined)
    })

    it('should handle null vnode props', () => {
      const vm = vdomInstance(null)

      expect(getInstanceRawPropKeys(vm)).toEqual([])
      expect(hasInstanceRawProp(vm, 'label')).toBe(false)
      expect(getInstanceRawProp(vm, 'label')).toBe(undefined)
    })
  })

  describe('vapor raw props', () => {
    it('should resolve static getter values', () => {
      const vm = vaporInstance({
        label: () => 'Name',
        plain: 'value',
      })

      expect(getInstanceRawProp(vm, 'label')).toBe('Name')
      expect(getInstanceRawProp(vm, 'plain')).toBe('value')
      expect(hasInstanceRawProp(vm, 'label')).toBe(true)
      expect(getInstanceRawPropKeys(vm)).toEqual(['label', 'plain'])
    })

    it('should never expose the $ key', () => {
      const vm = vaporInstance({ $: [{ spread: 1 }] })

      expect(hasInstanceRawProp(vm, '$')).toBe(false)
      expect(getInstanceRawProp(vm, '$')).toBe(undefined)
      expect(getInstanceRawPropKeys(vm)).toEqual(['spread'])
    })

    it('should resolve dynamic object and function sources', () => {
      const vm = vaporInstance({
        static: () => 'static-value',
        $: [{ fromObject: 'object-value' }, () => ({ fromFn: 'fn-value' })],
      })

      expect(hasInstanceRawProp(vm, 'fromObject')).toBe(true)
      expect(hasInstanceRawProp(vm, 'fromFn')).toBe(true)
      expect(getInstanceRawProp(vm, 'fromObject')).toBe('object-value')
      expect(getInstanceRawProp(vm, 'fromFn')).toBe('fn-value')
      expect(getInstanceRawPropKeys(vm).sort()).toEqual([
        'fromFn',
        'fromObject',
        'static',
      ])
    })

    it('should give later dynamic sources precedence over earlier ones and statics', () => {
      const vm = vaporInstance({
        key: () => 'static',
        $: [() => ({ key: 'first-source' }), () => ({ key: 'second-source' })],
      })

      expect(getInstanceRawProp(vm, 'key')).toBe('second-source')
    })

    it('should resolve getter values inside dynamic object sources', () => {
      const vm = vaporInstance({
        $: [{ key: () => 'getter-in-object' }],
      })

      expect(getInstanceRawProp(vm, 'key')).toBe('getter-in-object')
    })

    it('should return function values from dynamic function sources as-is', () => {
      const handler = () => 'handled'
      const vm = vaporInstance({
        $: [() => ({ onClick: handler })],
      })

      expect(getInstanceRawProp(vm, 'onClick')).toBe(handler)
    })
  })
})
