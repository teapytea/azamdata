"use client"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { enterFrom, enterItem, inView, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface MetricItem {
  value: string
  label: string
  linkText: string
  href: string
}

const metrics: MetricItem[] = [
  {
    value: "60+",
    label: "Components, ready to copy",
    linkText: "Browse components",
    href: "#",
  },
  {
    value: "20+",
    label: "Production-ready blocks",
    linkText: "View blocks",
    href: "#",
  },
  {
    value: "100%",
    label: "TypeScript, fully typed",
    linkText: "See the code",
    href: "#",
  },
  {
    value: "Lifetime",
    label: "Updates included",
    linkText: "View pricing",
    href: "#",
  },
]

export function MetricsSection() {
  const reduced = useReducedMotion() ?? false
  const item = enterItem(reduced)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Text & Metrics */}
        <motion.div
          className={cn("flex flex-col items-start justify-start gap-6")}
          variants={staggerContainer(reduced)}
          {...inView}
        >
          <motion.div className="flex flex-col gap-3" variants={item}>
            <h2 className="text-display text-foreground max-w-md">
              Everything You Need to Ship
            </h2>
            <p className="text-lead text-muted-foreground max-w-xl">
              Faiz UI gives you the components, blocks, and design tokens to go
              from idea to polished interface in minutes — not weeks.
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="mt-6 grid w-full grid-cols-2 gap-x-8 gap-y-10">
            {metrics.map((metric) => (
              <motion.div
                key={metric.label}
                className="flex flex-col gap-2"
                variants={item}
              >
                <span className="text-title font-semibold text-foreground">
                  {metric.value}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-caption text-muted-foreground">
                    {metric.label}
                  </span>
                  <a
                    href={metric.href}
                    className="group flex w-fit items-center gap-1 text-label font-medium text-foreground hover:underline"
                  >
                    {metric.linkText}
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      strokeWidth={2}
                      className="size-3.5 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
                    />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Premium Portrait Image */}
        <motion.div
          className={cn(
            "relative aspect-square overflow-hidden rounded-3xl border bg-muted shadow-sm md:aspect-[4/5] lg:aspect-square"
          )}
          variants={enterFrom("right", reduced)}
          {...inView}
        >
          <img
            src="https://assets.shadcncraft.com/registry/pro-marketing/metrics/3.webp?v=2"
            alt="Developer building an interface with Faiz UI"
            className="size-full object-cover outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-slow ease-out hover:scale-102 dark:outline-white/10"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}
