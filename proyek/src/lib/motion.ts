import type { Transition, Variants } from "motion/react"

/**
 * Shared motion primitives for staged entrance animations.
 *
 * Recipe (per make-interfaces-feel-better):
 * - enter: opacity 0 -> 1, translateY 12px -> 0, blur 4px -> 0
 * - stagger children ~100ms apart
 * - exits are subtler than enters (smaller translate, shorter duration)
 *
 * Accessibility: pair with `useReducedMotion()` and feed the result into
 * `enterItem(reduced)` / use `staggerContainer` with reduced delays.
 */

export const ENTER_DISTANCE = 12
export const STAGGER_CHILDREN = 0.1
export const STAGGER_DELAY = 0.05

const enterTransition: Transition = {
  duration: 0.5,
  ease: [0, 0.55, 0.45, 1], // --motion-ease-entrance
}

/**
 * Container variant. Drives staggered reveal of its `item` children.
 * Set `reduced` to collapse stagger/translate for reduced-motion users.
 */
export function staggerContainer(reduced = false): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : STAGGER_CHILDREN,
        delayChildren: reduced ? 0 : STAGGER_DELAY,
      },
    },
  }
}

/**
 * Child item variant. Translates up + de-blurs as it fades in.
 * When `reduced` is true, motion collapses to a plain opacity fade.
 */
export function enterItem(reduced = false): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    }
  }

  return {
    hidden: { opacity: 0, y: ENTER_DISTANCE, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: enterTransition,
    },
  }
}

/**
 * Horizontal entrance for split layouts (text on one side, media on the other).
 */
export function enterFrom(
  direction: "left" | "right",
  reduced = false
): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    }
  }

  const offset = direction === "left" ? -ENTER_DISTANCE : ENTER_DISTANCE
  return {
    hidden: { opacity: 0, x: offset, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: enterTransition,
    },
  }
}

/**
 * Shared `whileInView` config so sections reveal as they scroll into frame
 * and only animate once.
 */
export const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
} as const
