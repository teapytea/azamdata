"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { enterItem, inView, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface NewsItem {
  id: string
  tag: string
  title: string
  description: string
  image: string
  date: string
  publisher: string
  logo: React.ReactNode
}

const newsItems: NewsItem[] = [
  {
    id: "tech-demo",
    tag: "RELEASE",
    title: "Faiz UI Migrates to React 19 and Vite 6 for Blazing Fast Performance",
    description: "We've upgraded the entire boilerplate to leverage React 19's Server Actions and Vite 6's lightning-fast hot module replacement, reducing development build times by up to 50%.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
    date: "Sept 19, 2024",
    publisher: "TechCrunch",
    logo: (
      <div className="flex items-center gap-1 font-sans">
        <div className="flex size-4 items-center justify-center rounded-xs bg-[#1F1F1F] text-white text-[8px] font-bold">TC</div>
        <span className="text-[10px] font-black text-[#1F1F1F] dark:text-white tracking-tight">TechCrunch</span>
      </div>
    ),
  },
  {
    id: "lendingtree-challenge",
    tag: "MILESTONE",
    title: "Faiz UI Named #1 Product of the Week on Product Hunt",
    description: "Recognized for its groundbreaking composition patterns and beautiful design tokens, Faiz UI was voted the top product of the week by the global developer community.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop",
    date: "Nov 26, 2024",
    publisher: "Product Hunt",
    logo: (
      <div className="flex items-center gap-1 font-sans">
        <div className="flex size-4 items-center justify-center rounded-full bg-[#DA552F] text-white text-[9px] font-black">P</div>
        <span className="text-[10px] font-bold text-[#DA552F] tracking-tight">Product Hunt</span>
      </div>
    ),
  },
  {
    id: "voice-ai-banking",
    tag: "UPDATE",
    title: "Figma Design Files Now Available for All Pro & Enterprise Licenses",
    description: "Designers and developers can now work in perfect sync. We've released the complete Figma design system containing all 60+ components, fully tokenized and responsive.",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&auto=format&fit=crop",
    date: "February 27, 2025",
    publisher: "Figma Blog",
    logo: (
      <div className="flex items-center gap-1 font-sans">
        <div className="flex size-4 items-center justify-center rounded-full bg-foreground text-background text-[9px] font-black">F</div>
        <span className="text-[10px] font-bold text-foreground tracking-tight">Figma Blog</span>
      </div>
    ),
  },
  {
    id: "ai-revolutionize",
    tag: "RELEASE",
    title: "Faiz UI Adds 15+ New Interactive Dashboard Blocks",
    description: "Accelerate your SaaS development with our new premium dashboard blocks, featuring fully responsive layouts, advanced charts, complex forms, and seamless theme toggling.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    date: "Nov 25, 2024",
    publisher: "Forbes",
    logo: <span className="font-serif text-xs font-black tracking-tight text-[#001e62] dark:text-white">Forbes</span>,
  },
  {
    id: "future-compliance",
    tag: "PRESS",
    title: "How Faiz UI is Redefining Developer Productivity in 2026",
    description: "Traditional component libraries leave you with too much boilerplate. This article explores how Faiz UI's pre-configured project structure and motion primitives save developers hundreds of hours.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop",
    date: "Oct 12, 2024",
    publisher: "Smashing Magazine",
    logo: (
      <div className="flex items-center gap-1 font-sans">
        <div className="flex size-4 items-center justify-center rounded-xs bg-[#E85C3F] text-white text-[8px] font-bold">S</div>
        <span className="text-[10px] font-bold text-[#E85C3F] tracking-tight">Smashing Mag</span>
      </div>
    ),
  },
]

export function NewsSection() {
  const [activeIndex, setActiveIndex] = React.useState(2) // Start with the center card active
  const isMobile = useIsMobile()
  const reduced = useReducedMotion() ?? false

  const total = newsItems.length

  const handlePrev = React.useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total)
  }, [total])

  // Helper to calculate circular distance and offset
  const getCircularOffset = React.useCallback((index: number, active: number) => {
    let diff = index - active
    while (diff < -total / 2) diff += total
    while (diff > total / 2) diff -= total
    return diff
  }, [total])

  return (
    <section className="mx-auto w-full overflow-x-clip py-16 md:py-24">
      {/* Section Header */}
      <motion.div
        className="mb-12 flex flex-col items-center justify-center text-center px-4"
        variants={staggerContainer(reduced)}
        {...inView}
      >
        <motion.h2
          variants={enterItem(reduced)}
          className="text-display text-foreground mt-4 max-w-2xl"
        >
          What's New at Faiz UI
        </motion.h2>
        <motion.p
          variants={enterItem(reduced)}
          className="text-lead text-muted-foreground max-w-2xl mt-4"
        >
          Stay up to date with the latest releases, milestones, design files, and community updates from the Faiz UI ecosystem.
        </motion.p>
      </motion.div>

      {/* 3D Carousel Container */}
      <motion.div
        className="relative flex flex-col items-center justify-center"
        variants={staggerContainer(reduced)}
        {...inView}
      >
        <motion.div
          variants={enterItem(reduced)}
          className="relative flex h-[480px] md:h-[580px] w-full max-w-6xl items-center justify-center"
          style={{ perspective: isMobile ? "800px" : "1200px" }}
        >
          {newsItems.map((item, index) => {
            const offset = getCircularOffset(index, activeIndex)
            const absOffset = Math.abs(offset)

            // Determine if the card should be visible
            // We show active card (0), flanking cards (-1, 1), and outer edges (-2, 2)
            const isVisible = absOffset <= 2

            if (!isVisible) return null

            // Calculate 3D styles based on offset
            let rotateY = 0
            let scale = 1
            let x = 0
            let z = 0
            let opacity = 1
            let zIndex = 10 - absOffset

            if (reduced) {
              // Flat layout for reduced motion
              scale = offset === 0 ? 1 : 0.9
              opacity = offset === 0 ? 1 : 0.4
              x = offset * (isMobile ? 120 : 280)
            } else {
              // 3D Coverflow layout
              if (offset === 0) {
                rotateY = 0
                scale = isMobile ? 1.02 : 1.05
                x = 0
                z = 100
                opacity = 1
              } else if (offset < 0) {
                // Left flanking cards
                rotateY = isMobile ? 25 : 35
                scale = isMobile ? 0.82 : 0.85
                x = offset * (isMobile ? 100 : 240) - (isMobile ? 30 : 60)
                z = -100
                opacity = offset === -1 ? 0.75 : 0.25
              } else {
                // Right flanking cards
                rotateY = isMobile ? -25 : -35
                scale = isMobile ? 0.82 : 0.85
                x = offset * (isMobile ? 100 : 240) + (isMobile ? 30 : 60)
                z = -100
                opacity = offset === 1 ? 0.75 : 0.25
              }
            }

            return (
              <motion.div
                key={item.id}
                className={cn(
                  "absolute w-[280px] md:w-[400px] h-[420px] md:h-[520px] select-none cursor-pointer",
                  offset === 0 ? "cursor-default" : "cursor-pointer"
                )}
                style={{
                  transformStyle: "preserve-3d",
                  zIndex,
                }}
                animate={{
                  x,
                  rotateY,
                  scale,
                  z,
                  opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                onClick={() => {
                  if (offset !== 0) {
                    setActiveIndex(index)
                  }
                }}
                drag={isMobile ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) {
                    handlePrev()
                  } else if (info.offset.x < -50) {
                    handleNext()
                  }
                }}
              >
                {/* Outer Card with layered box shadow for natural depth */}
                <div
                  className={cn(
                    "relative flex h-full w-full flex-col rounded-[28px] bg-card p-4 text-card-foreground transition-all duration-300",
                    offset === 0
                      ? "shadow-md border border-border/80"
                      : "shadow-sm border border-border/40 hover:border-border/80 hover:shadow-md"
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Image with subtle 1px outline for consistent depth */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>

                  {/* Card Content */}
                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      {/* Tag */}
                      <Badge variant="secondary" className="text-mono tracking-wider uppercase text-[10px] px-2.5 py-0.5 rounded-full">
                        {item.tag}
                      </Badge>

                      {/* Title */}
                      <h3 className="text-subtitle font-semibold text-foreground mt-3 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-caption mt-2 line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                      <span className="text-caption font-medium">
                        {item.date}
                      </span>
                      <div className="flex items-center shrink-0">
                        {item.logo}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Navigation Controls */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={handlePrev}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform active:scale-[0.96] hover:bg-muted/50"
            aria-label="Previous slide"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-5" />
          </button>
          <button
            onClick={handleNext}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform active:scale-[0.96] hover:bg-muted/50"
            aria-label="Next slide"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
          </button>
        </div>
      </motion.div>
    </section>
  )
}
