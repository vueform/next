import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

// happy-dom neither reads files nor decodes images, so both globals the rule
// uses are stubbed: FileReader resolves to a data URL, Image reports the
// dimensions set per test.
class FakeFileReader {
  onloadend: ((event: any) => void) | null = null
  onerror: (() => void) | null = null
  abort() {}
  readAsDataURL(_file: Blob) {
    queueMicrotask(() =>
      this.onloadend?.({ target: { result: 'data:image/png;base64,stub' } })
    )
  }
}

class FakeImage {
  static nextWidth = 0
  static nextHeight = 0
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  width = FakeImage.nextWidth
  height = FakeImage.nextHeight
  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

const imageFile = () => new File(['stub'], 'image.png', { type: 'image/png' })

const makeField = (rules: string) =>
  createForm({
    schema: defineSchema({
      field: { type: 'text', rules, default: imageFile() as any },
    }),
  }).field

describe('dimensions', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', FakeFileReader)
    vi.stubGlobal('Image', FakeImage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should pass when exact width and height match', async () => {
    FakeImage.nextWidth = 200
    FakeImage.nextHeight = 100
    const field = makeField('dimensions:width=200,height=100')
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the exact width differs', async () => {
    FakeImage.nextWidth = 199
    FakeImage.nextHeight = 100
    const field = makeField('dimensions:width=200,height=100')
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should enforce min_width and min_height', async () => {
    FakeImage.nextWidth = 50
    FakeImage.nextHeight = 50
    const small = makeField('dimensions:min_width=100,min_height=100')
    await small.validate()
    expect(small.invalid).toBe(true)

    FakeImage.nextWidth = 150
    FakeImage.nextHeight = 150
    const big = makeField('dimensions:min_width=100,min_height=100')
    await big.validate()
    expect(big.invalid).toBe(false)
  })

  it('should enforce max_width and max_height', async () => {
    FakeImage.nextWidth = 500
    FakeImage.nextHeight = 500
    const big = makeField('dimensions:max_width=300,max_height=300')
    await big.validate()
    expect(big.invalid).toBe(true)

    FakeImage.nextWidth = 200
    FakeImage.nextHeight = 200
    const small = makeField('dimensions:max_width=300,max_height=300')
    await small.validate()
    expect(small.invalid).toBe(false)
  })

  it('should validate ratio given as a fraction', async () => {
    FakeImage.nextWidth = 200
    FakeImage.nextHeight = 100
    const matching = makeField('dimensions:ratio=2/1')
    await matching.validate()
    expect(matching.invalid).toBe(false)

    FakeImage.nextWidth = 100
    FakeImage.nextHeight = 100
    const mismatching = makeField('dimensions:ratio=2/1')
    await mismatching.validate()
    expect(mismatching.invalid).toBe(true)
  })

  it('should validate ratio given as a number', async () => {
    FakeImage.nextWidth = 300
    FakeImage.nextHeight = 200
    const matching = makeField('dimensions:ratio=1.5')
    await matching.validate()
    expect(matching.invalid).toBe(false)
  })

  it('should fail on a non-file value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'dimensions:width=10', default: 'text' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when the image cannot be loaded', async () => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.())
        }
      }
    )
    const field = makeField('dimensions:width=10')
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
