/**
 * RGB color representation.
 */
export interface RgbColor {
  r: number
  g: number
  b: number
}

/**
 * HSB (Hue-Saturation-Brightness) color representation.
 */
export interface HsbColor {
  h: number
  s: number
  b: number
}

/**
 * Supported color format identifiers.
 */
export type ColorFormat = (string & {}) | 'hex' | 'rgb' | 'hsb' | undefined

/**
 * Maps a color format name to its value type.
 */
export type ColorValue<F extends ColorFormat> = F extends 'hex'
  ? string
  : F extends 'rgb'
    ? RgbColor
    : HsbColor

/**
 * Converts a hex color string to an RGB object.
 *
 * @param hex Hex string, with or without a leading `#`.
 */
export function hexToRgb(hex: string): RgbColor {
  const v = parseInt(hex.indexOf('#') > -1 ? hex.substring(1) : hex, 16)
  return { r: v >> 16, g: (v & 0x00ff00) >> 8, b: v & 0x0000ff }
}

/**
 * Converts an RGB object to a 6-character hex string (no `#` prefix).
 *
 * @param rgb The RGB color to convert.
 */
export function rgbToHex(rgb: RgbColor): string {
  const hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)]
  for (const key in hex) {
    if (hex[key].length === 1) hex[key] = '0' + hex[key]
  }
  return hex.join('')
}

/**
 * Converts an RGB object to an HSB object (h: 0–360, s: 0–100, b: 0–100).
 *
 * @param rgb The RGB color to convert.
 */
export function rgbToHsb(rgb: RgbColor): HsbColor {
  const hsb = { h: 0, s: 0, b: 0 }
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const delta = max - min
  hsb.b = max
  hsb.s = max !== 0 ? (255 * delta) / max : 0
  if (hsb.s !== 0) {
    if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta
    else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta
    else hsb.h = 4 + (rgb.r - rgb.g) / delta
  } else {
    hsb.h = -1
  }
  hsb.h *= 60
  if (hsb.h < 0) hsb.h += 360
  hsb.s *= 100 / 255
  hsb.b *= 100 / 255
  return hsb
}

/**
 * Converts an HSB object (h: 0–360, s: 0–100, b: 0–100) to an RGB object.
 *
 * @param hsb The HSB color to convert.
 */
export function hsbToRgb(hsb: HsbColor): RgbColor {
  let rgb = { r: 0, g: 0, b: 0 }
  let h = Math.round(hsb.h)
  const s = Math.round((hsb.s * 255) / 100)
  const v = Math.round((hsb.b * 255) / 100)
  if (s === 0) {
    rgb = { r: v, g: v, b: v }
  } else {
    const t1 = v
    const t2 = ((255 - s) * v) / 255
    const t3 = ((t1 - t2) * (h % 60)) / 60
    if (h === 360) h = 0
    if (h < 60) {
      rgb.r = t1
      rgb.b = t2
      rgb.g = t2 + t3
    } else if (h < 120) {
      rgb.g = t1
      rgb.b = t2
      rgb.r = t1 - t3
    } else if (h < 180) {
      rgb.g = t1
      rgb.r = t2
      rgb.b = t2 + t3
    } else if (h < 240) {
      rgb.b = t1
      rgb.r = t2
      rgb.g = t1 - t3
    } else if (h < 300) {
      rgb.b = t1
      rgb.g = t2
      rgb.r = t2 + t3
    } else if (h < 360) {
      rgb.r = t1
      rgb.g = t2
      rgb.b = t1 - t3
    }
  }
  return {
    r: Math.round(rgb.r),
    g: Math.round(rgb.g),
    b: Math.round(rgb.b),
  }
}

/**
 * Converts a color value from one format to another. Returns the value
 * unchanged if the formats are the same or the value is nullish.
 *
 * @param value The source color value.
 * @param newFormat The target color format.
 * @param oldFormat The source color format.
 */
export function convertColor(
  value: any,
  newFormat: ColorFormat,
  oldFormat: ColorFormat
): any {
  if (newFormat === oldFormat || value == null) return value
  if (newFormat === 'hex' || (newFormat !== 'rgb' && newFormat !== 'hsb'))
    return value

  // Convert old format → RGB (intermediate)
  let rgb: RgbColor
  if (oldFormat === 'hex') rgb = hexToRgb(value)
  else if (oldFormat === 'rgb') rgb = value
  else rgb = hsbToRgb(value)

  // Convert RGB → new format
  if (newFormat === 'hex') return rgbToHex(rgb)
  if (newFormat === 'rgb') return rgb
  return rgbToHsb(rgb)
}
