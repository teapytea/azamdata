import { cn } from "@/lib/utils"

// QR mock deterministik dari seed string — pengganti QR asli sampai backend tersambung.
export function FakeQr({
  seed,
  className,
}: {
  seed: string
  className?: string
}) {
  const size = 21
  let state = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0) * 31, 7)
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }

  const cells: boolean[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
      cells.push(inFinder ? false : next() > 0.5)
    }
  }

  const finderOrigins: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Kode QR verifikasi"
      className={cn("size-32 rounded-md bg-white p-1", className)}
      shapeRendering="crispEdges"
    >
      {cells.map((filled, index) => {
        if (!filled) return null
        const x = index % size
        const y = Math.floor(index / size)
        return (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill="#16204A"
          />
        )
      })}
      {finderOrigins.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`} fill="#16204A">
          <rect x={fx} y={fy} width={7} height={1} />
          <rect x={fx} y={fy + 6} width={7} height={1} />
          <rect x={fx} y={fy} width={1} height={7} />
          <rect x={fx + 6} y={fy} width={1} height={7} />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} />
        </g>
      ))}
    </svg>
  )
}
