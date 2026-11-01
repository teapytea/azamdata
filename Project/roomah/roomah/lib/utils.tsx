// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — gabungkan className secara aman (Tailwind-aware).
 * - clsx: handle conditional/array/object
 * - twMerge: resolve konflik utilitas Tailwind (mis. p-2 vs p-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
