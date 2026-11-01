"use client"

import { useState } from "react"
import {
  ArrowRight02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { Card } from "@/components/ui/card"
import { enterFrom, enterItem, inView, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function InfrastructureSection() {
  const reduced = useReducedMotion() ?? false
  // Card 1: AI Chat Mockup State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "user",
      text: "Help me build a settings page with consistent typography",
    },
    {
      id: 2,
      sender: "assistant",
      text: "Faiz UI has typography utilities and form patterns ready. I'll pick the right components and layout for you.",
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: "Got it — I'll pick the right Faiz UI components and layout patterns for that page.",
        },
      ])
    }, 1000)
  }

  // Card 3: Hover Tooltip State
  const [hoveredBar, setHoveredBar] = useState<number | null>(2) // Default to index 2 (Jun 3)

  // Data for Card 3 (Flex Charges Stacked Bars)
  const billingData = [
    { date: "Jun 1", dataTransfer: 1.2, objectStorage: 0.8 },
    { date: "Jun 2", dataTransfer: 1.8, objectStorage: 1.1 },
    { date: "Jun 3", dataTransfer: 2.37, objectStorage: 1.88 }, // Highlighted in image
    { date: "Jun 4", dataTransfer: 1.5, objectStorage: 0.9 },
    { date: "Jun 5", dataTransfer: 2.1, objectStorage: 1.4 },
    { date: "Jun 6", dataTransfer: 2.8, objectStorage: 1.9 },
    { date: "Jun 7", dataTransfer: 1.9, objectStorage: 1.2 },
    { date: "Jun 8", dataTransfer: 2.4, objectStorage: 1.6 },
    { date: "Jun 9", dataTransfer: 1.7, objectStorage: 1.1 },
    { date: "Jun 10", dataTransfer: 2.2, objectStorage: 1.5 },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      {/* Section Header */}
      <motion.div
        className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end"
        variants={staggerContainer(reduced)}
        {...inView}
      >
        <motion.h2
          className="text-display text-foreground max-w-xl"
          variants={enterFrom("left", reduced)}
        >
          Build better interfaces
          <br />
          with AI-ready design foundations
        </motion.h2>
        <motion.p
          className="text-lead text-muted-foreground max-w-md md:pb-2"
          variants={enterFrom("right", reduced)}
        >
          Structured components, agent skills, and a live UI kit so AI ships
          polished UIs — not generic output
        </motion.p>
      </motion.div>

      {/* Grid of Cards */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
        variants={staggerContainer(reduced)}
        {...inView}
      >
        {/* Card 1: AI-ready tooling */}
        <motion.div variants={enterItem(reduced)}>
        <Card className="relative flex flex-col border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          {/* Visual Mockup Container */}
          <div className="relative flex h-[280px] flex-col rounded-2xl border bg-muted/20 p-4 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                    transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
                    className={cn(
                      "flex w-full flex-col",
                      msg.sender === "user" ? "items-end" : "items-start"
                    )}
                  >
                    {msg.sender === "user" ? (
                      <div className="rounded-2xl bg-primary px-4 py-2 text-primary-foreground text-sm max-w-[85%] shadow-xs">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 w-full max-w-[90%]">
                        {/* Avatar Row */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format&q=80"
                              alt="Stripe"
                              className="inline-block size-5 rounded-full border border-background object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
                            />
                            <img
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format&q=80"
                              alt="GitHub"
                              className="inline-block size-5 rounded-full border border-background object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
                            />
                            <img
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format&q=80"
                              alt="Slack"
                              className="inline-block size-5 rounded-full border border-background object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            +12 components
                          </span>
                        </div>
                        {/* Message Bubble */}
                        <div className="rounded-2xl border bg-card px-4 py-2.5 text-foreground text-sm shadow-xs">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="relative mt-3 flex items-center"
            >
              <input
                type="text"
                placeholder="Start typing..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-xl border bg-card py-2 pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform hover:bg-primary/90 active:scale-[0.96]"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" />
              </button>
            </form>
          </div>

          {/* Text Content */}
          <div className="mt-6 flex flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-title font-semibold text-foreground">
                AI-ready tooling
              </h3>
              <p className="text-body text-muted-foreground">
                AGENTS.md rules, shadcn skills, and a live UI kit give your
                agent deep Faiz UI context.
              </p>
            </div>
            <a
              href="#ai-tooling"
              className="group flex w-fit items-center gap-1 text-label font-medium text-foreground hover:underline"
            >
              Agent setup
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                strokeWidth={2}
                className="size-3.5 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Card>
        </motion.div>

        {/* Card 2: Ship faster */}
        <motion.div variants={enterItem(reduced)}>
        <Card className="relative flex flex-col border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          {/* Visual Mockup Container */}
          <div className="relative flex h-[280px] flex-col rounded-2xl border bg-muted/20 p-4 overflow-hidden">
            {/* Traffic Line Chart */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Ship velocity
                </span>
              </div>

              {/* SVG Chart Area */}
              <div className="relative h-[120px] w-full">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-border/60" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-border/60" />
                <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-border/60" />

                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 text-[9px] text-muted-foreground font-medium">
                  20K
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground font-medium">
                  10K
                </div>
                <div className="absolute left-0 bottom-0 text-[9px] text-muted-foreground font-medium">
                  0
                </div>

                {/* SVG Path */}
                <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.769 0.188 70.08)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="oklch(0.769 0.188 70.08)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area Path */}
                  <path
                    d="M 30,100 C 60,80 80,95 110,60 C 140,30 170,45 200,35 C 230,25 260,50 290,15"
                    fill="none"
                    stroke="oklch(0.769 0.188 70.08)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="w-full"
                  />
                  <path
                    d="M 30,100 C 60,80 80,95 110,60 C 140,30 170,45 200,35 C 230,25 260,50 290,15 L 290,120 L 30,120 Z"
                    fill="url(#chart-gradient)"
                  />
                  {/* Pulsing glow dot at the end */}
                  <circle cx="290" cy="15" r="4" fill="oklch(0.769 0.188 70.08)" />
                  <circle cx="290" cy="15" r="8" fill="oklch(0.769 0.188 70.08)" fillOpacity="0.3" className="animate-ping" />
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between px-2 text-[9px] text-muted-foreground font-medium">
                <span>24h ago</span>
                <span>12h ago</span>
                <span>Now</span>
              </div>
            </div>

            <div className="my-3 border-t border-border/40" />

            {/* Server Size Scaling Indicator */}
            <div className="flex flex-col gap-1.5 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Component coverage
                </span>
                <span className="text-[10px] font-medium text-foreground">
                  From a single page to full product layouts.
                </span>
              </div>
              {/* Row of vertical scaling bars */}
              <div className="flex h-8 items-end gap-1">
                {[2, 3, 2, 4, 5, 4, 6, 7, 8, 6, 5, 4, 3, 4, 5, 6, 8, 9, 7, 5, 4, 3, 2].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-linear-to-t transition-[height,background-color] duration-300"
                    style={{
                      height: `${val * 10}%`,
                      backgroundColor: val > 7 
                        ? "oklch(0.769 0.188 70.08)" // Orange
                        : val > 4 
                        ? "oklch(0.879 0.169 91.605)" // Yellowish
                        : "oklch(0.666 0.179 58.318)", // Greenish
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="mt-6 flex flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-title font-semibold text-foreground">
                Ship faster
              </h3>
              <p className="text-body text-muted-foreground">
                60+ components and 20+ blocks — production-ready patterns you
                can copy, customize, and ship.
              </p>
            </div>
            <a
              href="#infrastructure"
              className="group flex w-fit items-center gap-1 text-label font-medium text-foreground hover:underline"
            >
              Browse components
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                strokeWidth={2}
                className="size-3.5 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Card>
        </motion.div>

        {/* Card 3: Own your stack */}
        <motion.div variants={enterItem(reduced)}>
        <Card className="relative flex flex-col border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          {/* Visual Mockup Container */}
          <div className="relative flex h-[280px] flex-col rounded-2xl border bg-muted/20 p-4 overflow-hidden">
            {/* Header Dropdowns */}
            <div className="flex items-center justify-between gap-2">
              {/* Billing Cycle Selector */}
              <div className="flex items-center gap-1 rounded-lg border bg-card px-2 py-1 text-[9px] font-medium text-foreground shadow-xs">
                <span>Current billing cycle</span>
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-2.5 text-muted-foreground" />
              </div>
              {/* Date Selector */}
              <div className="flex items-center gap-1 rounded-lg border bg-card px-2 py-1 text-[9px] font-medium text-foreground shadow-xs">
                <HugeiconsIcon icon={Calendar03Icon} className="size-2.5 text-muted-foreground" />
                <span>1/6 09:00 - 1/7 09:00</span>
              </div>
            </div>

            {/* Total Flex Charges */}
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[10px] font-medium text-muted-foreground">
                Pro plan — everything included
              </span>
              <span className="text-base font-semibold text-foreground tabular-nums">
                $149.00
              </span>
            </div>

            {/* Stacked Bar Chart */}
            <div className="relative mt-4 flex flex-1 items-end gap-2.5 pb-2">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 bottom-2 border-b border-border/40" />
              <div className="absolute inset-x-0 bottom-1/2 border-b border-dashed border-border/40" />
              <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-border/40" />

              {/* Y-Axis labels */}
              <div className="absolute left-0 top-1/3 -translate-y-1/2 text-[8px] text-muted-foreground font-medium">
                $10
              </div>
              <div className="absolute left-0 bottom-1/2 -translate-y-1/2 text-[8px] text-muted-foreground font-medium">
                $5
              </div>
              <div className="absolute left-0 bottom-2 text-[8px] text-muted-foreground font-medium">
                $0
              </div>

              {/* Bars */}
              <div className="flex flex-1 items-end justify-between pl-6 h-full">
                {billingData.map((data, idx) => {
                  const totalVal = data.dataTransfer + data.objectStorage
                  const isHovered = hoveredBar === idx

                  return (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center group cursor-pointer"
                      style={{ height: "70%" }}
                      onMouseEnter={() => setHoveredBar(idx)}
                    >
                      {/* Stacked Bar */}
                      <div className="flex flex-col-reverse w-3.5 rounded-xs overflow-hidden transition-transform duration-200 group-hover:scale-x-110">
                        {/* Blue: Data Transfer */}
                        <div
                          className={cn(
                            "w-full transition-colors",
                            isHovered ? "bg-blue-600" : "bg-blue-500/80"
                          )}
                          style={{ height: `${(data.dataTransfer / 5) * 100}%`, minHeight: "6px" }}
                        />
                        {/* Purple: Object Storage */}
                        <div
                          className={cn(
                            "w-full transition-colors",
                            isHovered ? "bg-purple-600" : "bg-purple-500/80"
                          )}
                          style={{ height: `${(data.objectStorage / 5) * 100}%`, minHeight: "4px" }}
                        />
                      </div>

                      {/* X-Axis Date (Only show first and hovered/selected) */}
                      {(idx === 0 || isHovered) && (
                        <span className="absolute -bottom-4 text-[8px] text-muted-foreground font-medium whitespace-nowrap">
                          {data.date}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Floating Tooltip */}
              <AnimatePresence initial={false}>
                {hoveredBar !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, y: 4, filter: "blur(2px)" }}
                    transition={{ duration: 0.2, ease: [0, 0.55, 0.45, 1] }}
                    className="absolute right-4 top-10 z-20 flex flex-col gap-1.5 rounded-xl border bg-card p-2.5 shadow-md min-w-[120px]"
                  >
                    <span className="text-[9px] font-medium text-muted-foreground">
                      {billingData[hoveredBar].date}, 2025
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          <span className="text-[9px] text-foreground font-medium">Components</span>
                        </div>
                        <span className="text-[9px] font-semibold text-foreground tabular-nums">
                          ${billingData[hoveredBar].dataTransfer.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-purple-500" />
                          <span className="text-[9px] text-foreground font-medium font-sans">Blocks</span>
                        </div>
                        <span className="text-[9px] font-semibold text-foreground tabular-nums">
                          ${billingData[hoveredBar].objectStorage.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Text Content */}
          <div className="mt-6 flex flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-title font-semibold text-foreground">
                Own your stack
              </h3>
              <p className="text-body text-muted-foreground">
                Copy components into your repo — no subscriptions, no GMV fees,
                no vendor lock-in.
              </p>
            </div>
            <a
              href="#pricing"
              className="group flex w-fit items-center gap-1 text-label font-medium text-foreground hover:underline"
            >
              View pricing
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                strokeWidth={2}
                className="size-3.5 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </Card>
        </motion.div>
      </motion.div>
    </section>
  )
}
