/**
 * Color Palette and Brand Token Utilities
 * Provides robust parsing, extraction, quantization, and export formats.
 */

export function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return null
  let clean = hex.trim().replace(/^#/, '')
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('')
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return `#${clean.toUpperCase()}`
}

export function hexToRgb(hex) {
  const norm = normalizeHex(hex)
  if (!norm) return { r: 0, g: 0, b: 0, str: 'rgb(0, 0, 0)' }
  const clean = norm.replace('#', '')
  const num = parseInt(clean, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return { r, g, b, str: `rgb(${r}, ${g}, ${b})` }
}

export function colorDistance(hex1, hex2) {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2)
}

export function defaultRole(index) {
  const roles = [
    'Background',
    'Text / Ink',
    'Primary Accent',
    'Secondary / Clay',
    'Surface / Paper',
    'Highlight / Wash',
  ]
  return roles[index] || `Token ${index + 1}`
}

/**
 * Heuristic color namer based on HSL color space.
 */
export function getColorName(hex) {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
      default:
        break
    }
    h /= 6
  }

  const hueDeg = Math.round(h * 360)
  const satPct = Math.round(s * 100)
  const lightPct = Math.round(l * 100)

  // Near neutral / achromatic
  if (satPct < 14) {
    if (lightPct >= 94) return 'Paper White'
    if (lightPct >= 84) return 'Soft Cream'
    if (lightPct >= 65) return 'Warm Gray'
    if (lightPct >= 40) return 'Muted Slate'
    if (lightPct >= 20) return 'Charcoal'
    return 'Deep Ink'
  }

  // Extreme lightness
  if (lightPct >= 90) return 'Pale Tint'
  if (lightPct <= 12) return 'Midnight'

  if (hueDeg >= 345 || hueDeg < 16) return lightPct > 58 ? 'Coral Rose' : 'Crimson'
  if (hueDeg < 45) return lightPct > 55 ? 'Clay Ochre' : 'Warm Terracotta'
  if (hueDeg < 70) return lightPct > 65 ? 'Golden Flax' : 'Amber Gold'
  if (hueDeg < 165) return lightPct > 58 ? 'Sage Mist' : 'Forest Olive'
  if (hueDeg < 200) return lightPct > 60 ? 'Glacier Wash' : 'Teal Slate'
  if (hueDeg < 250) return lightPct > 55 ? 'Klarity Sky' : 'Ocean Cobalt'
  if (hueDeg < 290) return lightPct > 60 ? 'Lavender Gray' : 'Deep Indigo'
  if (hueDeg < 345) return lightPct > 60 ? 'Muted Orchid' : 'Plum Wine'

  return 'Brand Accent'
}

/**
 * Robust parser for text: handles hex lists, CSS variables, JSON tokens, and Tailwind configs.
 */
export function parseSwatchesFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return []
  const text = rawText.trim()

  // 1. Try JSON parsing
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        const swatches = parsed
          .filter((item) => item && (item.hex || item.value || typeof item === 'string'))
          .map((item, idx) => {
            const hex = normalizeHex(typeof item === 'string' ? item : item.hex || item.value)
            if (!hex) return null
            return {
              name: (typeof item === 'object' && item.name) || getColorName(hex),
              hex,
              role: (typeof item === 'object' && item.role) || defaultRole(idx),
            }
          })
          .filter(Boolean)
        if (swatches.length > 0) return swatches
      } else if (typeof parsed === 'object') {
        const result = []
        let idx = 0
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof val === 'string') {
            const hex = normalizeHex(val)
            if (hex) {
              result.push({
                name: key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                hex,
                role: defaultRole(idx++),
              })
            }
          }
        }
        if (result.length > 0) return result
      }
    } catch {}
  }

  // 2. Line-by-line parsing (CSS vars, key: #hex, label = #hex)
  const lines = text.split(/[\r\n]+/)
  const swatches = []
  const seenHexes = new Set()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const hexMatch = trimmed.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/)
    if (hexMatch) {
      const hex = normalizeHex(hexMatch[0])
      if (hex && !seenHexes.has(hex)) {
        seenHexes.add(hex)
        const parts = trimmed.split(/[:=]/)
        let name = ''
        if (parts.length > 1 && !parts[0].includes(hexMatch[0])) {
          name = parts[0]
            .replace(/^--/, '')
            .replace(/["'{}]/g, '')
            .replace(/[-_]/g, ' ')
            .trim()
        }
        if (!name || name.length > 28) {
          name = getColorName(hex)
        } else {
          name = name.replace(/\b\w/g, (c) => c.toUpperCase())
        }
        swatches.push({
          name,
          hex,
          role: defaultRole(swatches.length),
        })
      }
    }
  }

  if (swatches.length > 0) return swatches

  // 3. Fallback: Extract all hex codes from string
  const allHexMatches = text.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || []
  return Array.from(new Set(allHexMatches.map(normalizeHex).filter(Boolean))).map((hex, idx) => ({
    name: getColorName(hex),
    hex,
    role: defaultRole(idx),
  }))
}

/**
 * Analyze an image on an offscreen canvas and extract dominant distinct color swatches.
 */
export function extractColorsFromImage(dataUrl, maxColors = 6) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const size = 64
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)
        const imgData = ctx.getImageData(0, 0, size, size).data
        const colorCounts = new Map()

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i]
          const g = imgData[i + 1]
          const b = imgData[i + 2]
          const a = imgData[i + 3]
          if (a < 128) continue

          const qr = Math.round(r / 32) * 32
          const qg = Math.round(g / 32) * 32
          const qb = Math.round(b / 32) * 32

          const hex = `#${[qr, qg, qb]
            .map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()}`
          colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1)
        }

        const sorted = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([hex]) => hex)

        const distinct = []
        for (const hex of sorted) {
          const isTooClose = distinct.some((existing) => colorDistance(existing, hex) < 38)
          if (!isTooClose) {
            distinct.push(hex)
          }
          if (distinct.length >= maxColors) break
        }

        const swatches = distinct.map((hex, idx) => ({
          name: getColorName(hex),
          hex,
          role: defaultRole(idx),
        }))

        resolve(swatches)
      } catch {
        resolve([])
      }
    }
    img.onerror = () => resolve([])
    img.src = dataUrl
  })
}

/**
 * Generate CSS Variables string (:root { ... })
 */
export function generateCssVariables(swatches) {
  if (!swatches || !swatches.length) return ''
  const lines = swatches.map((s) => {
    const varName = (s.name || 'token')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    return `  --color-${varName}: ${s.hex};`
  })
  return `:root {\n${lines.join('\n')}\n}`
}

/**
 * Generate Tailwind config colors object
 */
export function generateTailwindConfig(swatches) {
  if (!swatches || !swatches.length) return ''
  const obj = {}
  swatches.forEach((s) => {
    const key = (s.name || 'token')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    obj[key] = s.hex
  })
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(obj, null, 2).replace(/\n/g, '\n      ')}\n    }\n  }\n}`
}

/**
 * Generate JSON design tokens
 */
export function generateTokensJson(swatches) {
  return JSON.stringify(swatches, null, 2)
}
