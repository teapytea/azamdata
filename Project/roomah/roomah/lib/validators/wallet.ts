import { z } from "zod";

export const TopUpSchema = z.object({
  amount: z.coerce
    .number()
    .min(10_000, "Minimum top up adalah Rp10.000")
    .refine((v) => v % 1_000 === 0, "Jumlah harus kelipatan 1000"),
});
