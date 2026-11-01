import { useEffect, useState } from "react"

// Simulasi jeda pemuatan data agar state loading tiap halaman bisa terlihat.
// Saat backend asli tersambung, ganti dengan status query sesungguhnya.
export function useMockLoading(delayMs = 450): boolean {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  return isLoading
}
