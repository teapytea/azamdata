import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/format"

// Angka yang menghitung naik dari 0 ke nilai target dengan easing halus.
function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0)
  const display = useTransform(count, (latest) =>
    formatNumber(Math.round(latest))
  )

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [count, value])

  return <motion.span>{display}</motion.span>
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
  isLoading,
}: {
  label: string
  value: number
  hint?: string
  icon: IconSvgElement
  isLoading?: boolean
}) {
  return (
    <Card className="shadow-xs transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-bold text-foreground tabular-nums">
              <AnimatedNumber value={value} />
            </p>
          )}
          {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon} className="size-4.5" />
        </div>
      </CardContent>
    </Card>
  )
}
