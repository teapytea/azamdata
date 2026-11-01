"use client"

import { motion, useReducedMotion } from "motion/react"
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { enterItem, inView, staggerContainer } from "@/lib/motion"

const builderAvatars = [
  {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    fallback: "JD",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    fallback: "AS",
  },
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    fallback: "MK",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
    fallback: "HL",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=100&auto=format&fit=crop",
    fallback: "OW",
  },
]

export function CtaSection() {
  const reduced = useReducedMotion() ?? false

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <motion.div
        className="relative overflow-hidden rounded-[32px] bg-neutral-950 text-white border border-neutral-800/80 grid grid-cols-1 md:grid-cols-12 items-stretch"
        variants={staggerContainer(reduced)}
        {...inView}
      >
        {/* Left Content Area */}
        <div className="md:col-span-7 flex flex-col items-start text-left z-10 p-8 md:p-12 lg:p-16 md:pr-0">
          {/* Avatar Stack + Label */}
          <motion.div
            variants={enterItem(reduced)}
            className="flex flex-wrap items-center gap-3"
          >
            <AvatarGroup className="-space-x-3 [&_[data-slot=avatar]]:ring-0">
              {builderAvatars.map((avatar, i) => (
                <Avatar key={i} className="size-7 after:border-0">
                  <AvatarImage src={avatar.src} alt="Builder Avatar" />
                  <AvatarFallback>{avatar.fallback}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <span className="text-caption text-neutral-400 font-medium">
              Join 9,000+ builders shipping with Faiz UI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={enterItem(reduced)}
            className="text-display text-white font-semibold tracking-tight mt-6 max-w-lg leading-tight"
          >
            Get access to these blocks and the full library
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={enterItem(reduced)}
            className="text-lead text-neutral-400 mt-4 max-w-md"
          >
            Production-ready blocks and components with matching Figma and React.
          </motion.p>

          {/* Action Button */}
          <motion.div variants={enterItem(reduced)} className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 border-transparent bg-white font-semibold text-neutral-950 shadow-sm hover:bg-neutral-100 hover:text-neutral-950 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              Get these blocks
              <Badge
                variant="secondary"
                className="border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-900"
              >
                Pro
              </Badge>
            </Button>
          </motion.div>
        </div>

        {/* Right Mockup Image Area — full-height, bleeds right, blends into card */}
        <div className="md:col-span-5 relative min-h-[280px] md:min-h-0 md:h-full overflow-hidden">
          <motion.div
            variants={enterItem(reduced)}
            className="w-[135%] items-center justify-end md:w-[150%] lg:w-[165%]"
          >
            <img
              src="/join-compact-cta-desktop.webp"
              alt="Faiz UI Mockup"
              className="h-[118%] w-auto max-w-none origin-center scale-[1.08] select-none object-contain object-right pointer-events-none md:h-[125%] md:scale-[1.12]"
              draggable={false}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
