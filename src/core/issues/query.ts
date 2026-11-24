import { z } from "zod";
import { issuePrioritySchema, issueStatusSchema } from "./schema";

export const issueQuerySchema = z.object({
  q: z.string().trim().refine((term) => !term.includes("\0") && Array.from(term).length <= 120)
    .optional().transform((term) => term || null),
  status: z.union([issueStatusSchema, z.literal("")])
    .optional().transform((status) => status || null),
  priority: z.union([issuePrioritySchema, z.literal("")])
    .optional().transform((priority) => priority || null),
});

export type IssueQuery = z.infer<typeof issueQuerySchema>;
