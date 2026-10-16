import { createRule } from '#src/helpers'
import { isFile } from '#src/utils'

function readImage(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reader.abort()
      reject(new DOMException('File cannot be parsed.'))
    }

    reader.onloadend = (event) => {
      resolve(event!.target!.result as string)
    }

    reader.readAsDataURL(file)
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onerror = () => {
      reject(new DOMException('Image could not be loaded.'))
    }

    image.onload = () => {
      resolve(image)
    }

    image.src = source
  })
}

/**
 * Validates that an image file matches specified dimension constraints (width,
 * height, ratio, etc.).
 *
 * @category File
 * @param width The exact width in pixels.
 * @param height The exact height in pixels.
 * @param min_width The minimum width in pixels.
 * @param min_height The minimum height in pixels.
 * @param max_width The maximum width in pixels.
 * @param max_height The maximum height in pixels.
 * @param ratio The width/height ratio, as a fraction (`ratio=3/2`) or a number
 *   (`ratio=1.5`).
 * @related image, file
 */
export const dimensions = createRule(
  'dimensions',
  async (value, { type, params }) => {
    if (type === 'file' && !value) {
      return true
    }

    if (type !== 'file' || !isFile(value)) {
      return false
    }

    let image: HTMLImageElement

    try {
      const source = await readImage(value)
      image = await loadImage(source)
    } catch {
      return false
    }

    if (
      params.min_width !== undefined &&
      image.width < Number(params.min_width)
    ) {
      return false
    }

    if (
      params.max_width !== undefined &&
      image.width > Number(params.max_width)
    ) {
      return false
    }

    if (
      params.min_height !== undefined &&
      image.height < Number(params.min_height)
    ) {
      return false
    }

    if (
      params.max_height !== undefined &&
      image.height > Number(params.max_height)
    ) {
      return false
    }

    if (params.width !== undefined && image.width !== Number(params.width)) {
      return false
    }

    if (params.height !== undefined && image.height !== Number(params.height)) {
      return false
    }

    if (params.ratio !== undefined) {
      const ratioStr = String(params.ratio)
      let numerator: number
      let denominator: number

      if (ratioStr.includes('/')) {
        numerator = Number(ratioStr.split('/')[0])
        denominator = Number(ratioStr.split('/')[1])
      } else {
        numerator = Number(ratioStr)
        denominator = 1
      }

      const precision = 1 / (Math.min(image.width, image.height) + 1)

      if (
        Math.abs(numerator / denominator - image.width / image.height) >
        precision
      ) {
        return false
      }
    }

    return true
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
    ] as const,
  }
)
