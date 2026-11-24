import { z } from "zod";

export const issueIdSchema = z.uuid("This issue could not be found.");
export const issueStatusSchema = z.enum(["todo", "in_progress", "done"], {
  error: "Choose a valid status.",
});
export const issuePrioritySchema = z.enum(["low", "medium", "high"], {
  error: "Choose a valid priority.",
});

const titleSchema = z.string().trim().min(1, "Enter a title.").refine(
  (title) => Array.from(title).length <= 120,
  "Use a title of at most 120 characters.",
);
const descriptionSchema = z.string().trim().refine(
  (description) => Array.from(description).length <= 4000,
  "Use a description of at most 4,000 characters.",
).nullable().default(null).transform((description) => description || null);

export const issueFieldsSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: issuePrioritySchema,
  status: issueStatusSchema,
});

export const issueRowSchema = z.object({
  id: issueIdSchema,
  title: z.string(),
  description: z.string().nullable(),
  priority: issuePrioritySchema,
  status: issueStatusSchema,
  updated_at: z.iso.datetime({ offset: true }),
});

export type IssueFields = z.infer<typeof issueFieldsSchema>;
export type Issue = z.infer<typeof issueRowSchema>;

export const statusLabels = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
} satisfies Record<IssueFields["status"], string>;

export const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
} satisfies Record<IssueFields["priority"], string>;
