"use client"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { enterItem, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const reduced = useReducedMotion() ?? false
  const item = enterItem(reduced)

  return (
    <section className="w-full px-4 pt-24">
      <motion.div
        animate="visible"
        className={cn(
          "relative z-10 flex w-full flex-col items-center justify-center gap-5 px-4"
        )}
        initial="hidden"
        variants={staggerContainer(reduced)}
      >
        <motion.a
          className={cn(
            "group flex w-fit items-center gap-2 rounded-lg border bg-card p-1 shadow-xs"
          )}
          href="#link"
          variants={item}
        >
          <div className="rounded-md border bg-card px-1.5 py-0.5 shadow-sm">
            <p className="text-mono">NEW</p>
          </div>

          <span className="text-label">Introducing Faiz UI v1</span>
          <span className="block h-5 border-l" />

          <div className="pr-1">
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              strokeWidth={2}
              className="size-3 -translate-x-0.5 duration-fast ease-out group-hover:translate-x-0"
            />
          </div>
        </motion.a>

        <motion.h1
          className={cn("text-center text-foreground text-display")}
          variants={item}
        >
          Ship Beautiful UIs <br /> Without Starting From Scratch
        </motion.h1>

        <motion.p
          className={cn("text-lead text-center text-muted-foreground")}
          variants={item}
        >
          A premium UI kit and boilerplate built on shadcn/ui — 60+ components,
          <br /> ready-made blocks, and sensible defaults so you ship faster.
        </motion.p>

        <motion.div
          className="flex w-fit items-center justify-center gap-3 pt-2"
          variants={item}
        >
          <Button size="lg" variant="ghost">
            Browse Components
          </Button>
          <Button size="lg">
            Get started{" "}
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
          </Button>
        </motion.div>
      </motion.div>

      <div className="relative mx-auto mt-5 flex aspect-video w-full max-w-6xl items-end justify-center overflow-hidden md:aspect-10/5">
        {/* Left Card (Faded Background) */}
        <motion.div
          animate={{ y: "0px", rotate: -6, x: "-90%" }}
          className="absolute -bottom-12 left-[70%] hidden h-auto w-[75%] opacity-75 blur-[1px] md:block"
          initial={
            reduced
              ? { y: "0px", rotate: -6, x: "-90%" }
              : { y: "60px", rotate: 0, x: "-80%" }
          }
          transition={{ duration: reduced ? 0 : 1, ease: "circOut" }}
        >
          <ScreenCard />
        </motion.div>

        {/* Center Card (Main) */}
        <motion.div
          animate={{ y: "0px" }}
          className="z-20 size-full md:h-auto md:w-[75%]"
          initial={reduced ? { y: "0px" } : { y: "48px" }}
          transition={{ duration: reduced ? 0 : 1, ease: "circOut" }}
        >
          <ScreenCard className="shadow-xl ring-1 ring-foreground/5" />
        </motion.div>

        {/* Right Card (Faded Background) */}
        <motion.div
          animate={{ y: "0px", rotate: 6, x: "90%" }}
          className="absolute right-[70%] -bottom-12 hidden h-auto w-[75%] opacity-75 blur-[1px] md:block"
          initial={
            reduced
              ? { y: "0px", rotate: 6, x: "90%" }
              : { y: "60px", rotate: 0, x: "80%" }
          }
          transition={{ duration: reduced ? 0 : 1, ease: "circOut" }}
        >
          <ScreenCard />
        </motion.div>

        {/* Bottom Fade Gradient */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-40 h-20 w-full bg-linear-to-t from-background via-background/50 to-transparent" />
      </div>
    </section>
  )
}

function ScreenCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative z-20 size-full overflow-hidden rounded-lg border bg-background p-2 *:pointer-events-none *:select-none",
        className
      )}
      {...props}
    >
      <img
        alt="Faiz UI dashboard template in light mode"
        className="z-2 aspect-video rounded-lg outline outline-1 -outline-offset-1 outline-black/10 dark:hidden"
        height="auto"
        src="https://storage.efferd.com/screen/dashboard-light.webp"
        width="auto"
      />
      <img
        alt="Faiz UI dashboard template in dark mode"
        className="hidden aspect-video rounded-lg bg-background outline outline-1 -outline-offset-1 outline-white/10 dark:block"
        height="auto"
        src="https://storage.efferd.com/screen/dashboard-dark.webp"
        width="auto"
      />
    </div>
  )
}
