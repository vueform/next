/**
 * Dependency-free SVG line chart generator used by the benchmark charts.
 * Renders one line per series over a linear x axis (the N sweep) with a legend,
 * grid and axis labels, so non-linear growth is visible as curvature.
 */

const WIDTH = 720
const HEIGHT = 452
const MARGIN = { top: 96, right: 32, bottom: 64, left: 80 }

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9']

const THEMES = {
  light: {
    background: '#ffffff',
    title: '#1f2328',
    text: '#57606a',
    grid: '#eaeef2',
    axis: '#8c959f',
  },
  // Dark palette matching the docs' dark-mode page background.
  dark: {
    background: '#0f0f11',
    title: '#e6edf3',
    text: '#8b949e',
    grid: '#21262d',
    axis: '#484f58',
  },
}

export interface ChartSeries {
  name: string
  color: string
  points: [number, number][]
}

export interface LineChartOptions {
  /**
   * Chart title shown at the top.
   */
  title: string
  /**
   * X axis label.
   */
  xLabel: string
  /**
   * Y axis label.
   */
  yLabel: string
  series: ChartSeries[]
  /**
   * Formats a y value for tick labels.
   */
  formatY: (value: number) => string
  /**
   * Color theme.
   */
  theme?: keyof typeof THEMES
}

function esc(text: string | number) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function fmtN(n: number) {
  if (n >= 1000000) return `${n / 1000000}M`
  if (n >= 1000) return `${n / 1000}k`
  return String(n)
}

function niceTicks(max: number, count = 5) {
  if (max <= 0) return [0, 1]
  const rough = max / count
  const mag = 10 ** Math.floor(Math.log10(rough))
  const norm = rough / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const ticks = []
  for (let v = 0; ; v += step) {
    ticks.push(Number(v.toPrecision(12)))
    if (v >= max) break
  }
  return ticks
}

/**
 * Returns the color for a series index.
 */
export function seriesColor(index: number) {
  return COLORS[index % COLORS.length]
}

/**
 * Renders a line chart as an SVG string.
 */
export function lineChart({
  title,
  xLabel,
  yLabel,
  series,
  formatY,
  theme = 'light',
}: LineChartOptions) {
  const colors = THEMES[theme]
  const innerW = WIDTH - MARGIN.left - MARGIN.right
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom

  const xValues = [
    ...new Set(series.flatMap((s) => s.points.map(([x]) => x))),
  ].sort((a, b) => a - b)

  const yMaxRaw = Math.max(
    ...series.flatMap((s) => s.points.map(([, y]) => y)),
    0
  )
  const yTicks = niceTicks(yMaxRaw * 1.05)
  const yMax = yTicks[yTicks.length - 1]

  const xTicks = niceTicks(xValues[xValues.length - 1])
  const xMax = xTicks[xTicks.length - 1]

  const xPos = (v: number) => MARGIN.left + (v / (xMax || 1)) * innerW
  const yPos = (v: number) => MARGIN.top + innerH - (v / (yMax || 1)) * innerH

  const parts = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">`
  )
  parts.push(
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.background}"/>`
  )

  // Title, centered
  parts.push(
    `<text x="${WIDTH / 2}" y="34" font-size="16" font-weight="600" fill="${colors.title}" text-anchor="middle">${esc(title)}</text>`
  )

  // Legend on its own centered row below the title, items side by side
  const legendGap = 16
  const itemWidths = series.map((s) => s.name.length * 7 + 26)
  const legendWidth =
    itemWidths.reduce((a, b) => a + b, 0) + legendGap * (series.length - 1)
  let legendX = (WIDTH - legendWidth) / 2

  series.forEach((s, i) => {
    parts.push(
      `<rect x="${legendX.toFixed(1)}" y="52" width="12" height="12" rx="2" fill="${s.color}"/>` +
        `<text x="${(legendX + 17).toFixed(1)}" y="62" font-size="12" fill="${colors.text}">${esc(s.name)}</text>`
    )
    legendX += itemWidths[i] + legendGap
  })

  // Horizontal grid + y tick labels
  for (const t of yTicks) {
    const y = yPos(t)
    parts.push(
      `<line x1="${MARGIN.left}" y1="${y}" x2="${WIDTH - MARGIN.right}" y2="${y}" stroke="${colors.grid}" stroke-width="1"/>`
    )
    parts.push(
      `<text x="${MARGIN.left - 8}" y="${y + 4}" font-size="11" fill="${colors.text}" text-anchor="end">${esc(formatY(t))}</text>`
    )
  }

  // Vertical grid + x tick labels at evenly spaced values
  for (const v of xTicks) {
    const x = xPos(v)
    parts.push(
      `<line x1="${x}" y1="${MARGIN.top}" x2="${x}" y2="${MARGIN.top + innerH}" stroke="${colors.grid}" stroke-width="1"/>`
    )
    parts.push(
      `<text x="${x}" y="${MARGIN.top + innerH + 18}" font-size="11" fill="${colors.text}" text-anchor="middle">${fmtN(v)}</text>`
    )
  }

  // Axes
  parts.push(
    `<line x1="${MARGIN.left}" y1="${MARGIN.top + innerH}" x2="${WIDTH - MARGIN.right}" y2="${MARGIN.top + innerH}" stroke="${colors.axis}" stroke-width="1"/>`
  )
  parts.push(
    `<line x1="${MARGIN.left}" y1="${MARGIN.top}" x2="${MARGIN.left}" y2="${MARGIN.top + innerH}" stroke="${colors.axis}" stroke-width="1"/>`
  )

  // Axis labels, centered on the plot area
  parts.push(
    `<text x="${MARGIN.left + innerW / 2}" y="${HEIGHT - 22}" font-size="12" fill="${colors.text}" text-anchor="middle">${esc(xLabel)}</text>`
  )
  parts.push(
    `<text x="28" y="${MARGIN.top + innerH / 2}" font-size="12" fill="${colors.text}" text-anchor="middle" transform="rotate(-90 28 ${MARGIN.top + innerH / 2})">${esc(yLabel)}</text>`
  )

  // Series lines + point markers
  for (const s of series) {
    const pts = [...s.points].sort((a, b) => a[0] - b[0])
    const path = pts
      .map(([x, y]) => `${xPos(x).toFixed(1)},${yPos(y).toFixed(1)}`)
      .join(' ')
    parts.push(
      `<polyline points="${path}" fill="none" stroke="${s.color}" stroke-width="2"/>`
    )
    for (const [x, y] of pts) {
      parts.push(
        `<circle cx="${xPos(x).toFixed(1)}" cy="${yPos(y).toFixed(1)}" r="3.5" fill="${s.color}"/>`
      )
    }
  }

  parts.push('</svg>')

  return parts.join('\n')
}
