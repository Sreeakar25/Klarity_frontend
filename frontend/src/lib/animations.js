import { gsap } from 'gsap'
import { animate, stagger } from 'animejs'

/**
 * Checks if the user prefers reduced motion.
 */
export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

/**
 * Seamless page transition using GSAP.
 * Glides in the page container and delicately staggers child panels and cards.
 * Returns a cleanup function for useEffect.
 */
export function animatePageEnter(containerEl) {
  if (!containerEl || isReducedMotion()) return () => {}

  const ctx = gsap.context(() => {
    // 1. Root page fade & subtle lift
    gsap.fromTo(
      containerEl,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.38,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      },
    )

    // 2. Staggered reveal for key panels/cards
    const items = containerEl.querySelectorAll(
      '.page-hero, .metric, .panel, .queue-row, .review-row, .guideline-card, .asset-card, .insight-card',
    )
    if (items.length > 0) {
      gsap.fromTo(
        Array.from(items).slice(0, 14),
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.035,
          ease: 'power2.out',
          delay: 0.04,
          clearProps: 'transform,opacity',
        },
      )
    }
  }, containerEl)

  return () => ctx.revert()
}

/**
 * Seamless numerical counter animation using Anime.js.
 * Animates a numeric value from start to end with easing.
 */
export function animateNumber({
  from = 0,
  to,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatter,
  onUpdate,
}) {
  if (isReducedMotion() || typeof to !== 'number' || Number.isNaN(to)) {
    const formatted = formatter
      ? formatter(to)
      : `${prefix}${to.toFixed(decimals)}${suffix}`
    onUpdate?.(formatted, to)
    return () => {}
  }

  const tracker = { val: from }

  const anim = animate(tracker, {
    val: to,
    duration,
    ease: 'outExpo',
    onUpdate: () => {
      const current = tracker.val
      const formatted = formatter
        ? formatter(current)
        : `${prefix}${current.toFixed(decimals)}${suffix}`
      onUpdate?.(formatted, current)
    },
    onComplete: () => {
      const finalFormatted = formatter
        ? formatter(to)
        : `${prefix}${to.toFixed(decimals)}${suffix}`
      onUpdate?.(finalFormatted, to)
    },
  })

  return () => {
    if (anim && typeof anim.pause === 'function') {
      anim.pause()
    }
  }
}

/**
 * Seamless SVG path drawing for trend charts using Anime.js & GSAP.
 */
export function animateSvgTrendPath(pathEl, areaEl) {
  if (!pathEl || isReducedMotion()) return () => {}

  try {
    const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 800
    pathEl.style.strokeDasharray = `${length}`
    pathEl.style.strokeDashoffset = `${length}`

    // Animate stroke draw
    const strokeAnim = animate(pathEl, {
      strokeDashoffset: [length, 0],
      duration: 1100,
      ease: 'inOutCubic',
    })

    // Animate area fill reveal
    let areaAnim
    if (areaEl) {
      areaEl.style.opacity = '0'
      areaAnim = animate(areaEl, {
        opacity: [0, 1],
        duration: 900,
        delay: 350,
        ease: 'outQuad',
      })
    }

    return () => {
      strokeAnim?.pause?.()
      areaAnim?.pause?.()
      pathEl.style.strokeDashoffset = '0'
      if (areaEl) areaEl.style.opacity = '1'
    }
  } catch {
    return () => {}
  }
}

/**
 * Seamless staggered bar reveal for volume bars using Anime.js.
 */
export function animateVolumeBars(containerEl) {
  if (!containerEl || isReducedMotion()) return () => {}

  const cols = containerEl.querySelectorAll('.volume-bars__col')
  const bars = containerEl.querySelectorAll('.volume-bars__bar')
  const values = containerEl.querySelectorAll('.volume-bars__value')
  if (!bars.length) return () => {}

  const anim = animate(bars, {
    scaleY: [0, 1],
    opacity: [0.2, 1],
    duration: 850,
    delay: stagger(90, { start: 100 }),
    ease: 'outBack(1.8)',
    composition: 'replace',
  })

  if (values.length) {
    animate(values, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 500,
      delay: stagger(90, { start: 250 }),
      ease: 'outQuad',
      composition: 'replace',
    })
  }

  return () => anim?.pause?.()
}

/**
 * Seamless staggered heatmap cell reveal using Anime.js grid stagger.
 */
export function animateHeatmapGrid(containerEl) {
  if (!containerEl || isReducedMotion()) return () => {}

  const cells = containerEl.querySelectorAll('.heatmap__cell')
  if (!cells.length) return () => {}

  const anim = animate(cells, {
    scale: [0.7, 1],
    opacity: [0, 1],
    duration: 500,
    delay: stagger(12, { from: 'center' }),
    ease: 'outQuad',
  })

  return () => anim?.pause?.()
}

/**
 * Seamless Drawer animation using GSAP.
 */
export function animateDrawerIn(drawerEl, backdropEl, onComplete) {
  if (isReducedMotion()) {
    onComplete?.()
    return
  }

  gsap.killTweensOf([drawerEl, backdropEl])

  if (backdropEl) {
    gsap.fromTo(
      backdropEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.28, ease: 'power2.out' },
    )
  }

  if (drawerEl) {
    gsap.fromTo(
      drawerEl,
      { xPercent: 100, opacity: 0.7 },
      {
        xPercent: 0,
        opacity: 1,
        duration: 0.38,
        ease: 'power3.out',
        onComplete,
      },
    )
  }
}

export function animateDrawerOut(drawerEl, backdropEl, onComplete) {
  if (isReducedMotion()) {
    onComplete?.()
    return
  }

  gsap.killTweensOf([drawerEl, backdropEl])

  if (backdropEl) {
    gsap.to(backdropEl, {
      opacity: 0,
      duration: 0.24,
      ease: 'power2.in',
    })
  }

  if (drawerEl) {
    gsap.to(drawerEl, {
      xPercent: 100,
      opacity: 0.5,
      duration: 0.28,
      ease: 'power3.in',
      onComplete,
    })
  } else {
    onComplete?.()
  }
}

/**
 * Seamless Command Palette animation using GSAP.
 */
export function animatePaletteIn(paletteEl, backdropEl, onComplete) {
  if (isReducedMotion()) {
    onComplete?.()
    return
  }

  gsap.killTweensOf([paletteEl, backdropEl])

  if (backdropEl) {
    gsap.fromTo(
      backdropEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' },
    )
  }

  if (paletteEl) {
    gsap.fromTo(
      paletteEl,
      { scale: 0.95, y: -12, opacity: 0 },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.32,
        ease: 'power3.out',
        onComplete,
      },
    )
  }
}

export function animatePaletteOut(paletteEl, backdropEl, onComplete) {
  if (isReducedMotion()) {
    onComplete?.()
    return
  }

  gsap.killTweensOf([paletteEl, backdropEl])

  if (backdropEl) {
    gsap.to(backdropEl, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    })
  }

  if (paletteEl) {
    gsap.to(paletteEl, {
      scale: 0.96,
      y: -8,
      opacity: 0,
      duration: 0.22,
      ease: 'power3.in',
      onComplete,
    })
  } else {
    onComplete?.()
  }
}

/**
 * Seamless Meter fill animation using GSAP.
 */
export function animateMeterBar(barEl, targetPercent) {
  if (!barEl || isReducedMotion()) {
    if (barEl) barEl.style.width = `${targetPercent}%`
    return
  }

  gsap.to(barEl, {
    width: `${Math.max(2, Math.min(100, targetPercent))}%`,
    duration: 0.65,
    ease: 'power2.out',
  })
}

/**
 * Seamless staggered horizontal bar expansion using Anime.js spring easing.
 */
export function animateHorizontalBars(containerEl) {
  if (!containerEl || isReducedMotion()) return () => {}

  const bars = containerEl.querySelectorAll(
    '.term-list__bar, .mix-row__segment, .issue-row__bar, .report-score__fill, .rail-health__track span, .meter > span'
  )
  if (!bars.length) return () => {}

  const anim = animate(bars, {
    scaleX: [0, 1],
    opacity: [0.2, 1],
    duration: 900,
    delay: stagger(70, { start: 120 }),
    ease: 'outBack(1.5)',
    composition: 'replace',
  })

  return () => anim?.pause?.()
}

/**
 * Seamless Toast appearance animation using GSAP.
 */
export function animateToastIn(toastEl) {
  if (!toastEl || isReducedMotion()) return

  gsap.fromTo(
    toastEl,
    { opacity: 0, y: 16, scale: 0.92 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.4)',
    },
  )
}

/**
 * Seamless sliding & dropping highlight box for tabs, segmented controls, and sidebar nav.
 * Calculates coordinates relative to container using untransformed layout geometry (offsetTop/offsetLeft),
 * so hover transforms, scales, and focus states never distort or misalign the pill.
 */
export function animateSlidingPill({
  containerEl,
  pillEl,
  activeSelector = '.is-active',
  targetEl = null,
  isInitialRef,
  isVertical = false,
}) {
  if (!containerEl || !pillEl || isReducedMotion()) return

  const activeEl = targetEl || containerEl.querySelector(activeSelector)
  if (!activeEl) {
    gsap.to(pillEl, { opacity: 0, duration: 0.2 })
    return
  }

  // Calculate coordinates relative to container using untransformed layout geometry.
  // offsetTop / offsetLeft are completely immune to CSS transforms (e.g. hover scale, translateX)
  let y = 0
  let x = 0
  let curr = activeEl
  while (curr && curr !== containerEl) {
    y += curr.offsetTop || 0
    x += curr.offsetLeft || 0
    curr = curr.offsetParent
  }
  const width = activeEl.offsetWidth
  const height = activeEl.offsetHeight

  if (isInitialRef && !isInitialRef.current) {
    isInitialRef.current = true
    gsap.set(pillEl, {
      x,
      y,
      width,
      height,
      opacity: 1,
      scale: 1,
    })
    // Initial drop-in animation
    gsap.fromTo(
      pillEl,
      {
        y: isVertical ? y - 12 : y,
        x: isVertical ? x : x - 8,
        opacity: 0,
      },
      {
        y,
        x,
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out',
      },
    )
    return
  }

  gsap.killTweensOf(pillEl)

  if (isVertical) {
    // Smooth, precise vertical glide without overflowing into adjacent elements
    gsap.to(pillEl, {
      x,
      y,
      width,
      height,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.28,
      ease: 'power3.out',
    })
  } else {
    // Horizontal fluid glide for tabs and segmented controls
    gsap.to(pillEl, {
      x,
      y,
      width,
      height,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.32,
      ease: 'power3.out',
    })
  }
}
