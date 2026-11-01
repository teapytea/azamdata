import { z } from "zod";

export const VerificationSchema = z.object({
  q1_ready: z.coerce.boolean(),
  q2_serious: z.coerce.boolean(),
  q3_honest: z.coerce.boolean(),
  q4_parents_ok: z.coerce.boolean(),
  q5_rules_ok: z.coerce.boolean(),
});

export type VerificationData = z.infer<typeof VerificationSchema>;
