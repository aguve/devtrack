import type { Issue, IssueFields } from "@/src/core/issues/schema";
import type { IssueQuery } from "@/src/core/issues/query";

export type Database = {
  public: {
    Tables: {
      issues: {
        Row: Issue & { user_id: string; created_at: string };
        Insert: Pick<IssueFields, "title"> & { user_id: string } & Partial<
          Omit<IssueFields, "title"> & Pick<Issue, "id" | "updated_at"> & { created_at: string }
        >;
        Update: Partial<IssueFields>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      list_own_issues: {
        Args: {
          search_term: IssueQuery["q"];
          filter_status: IssueQuery["status"];
          filter_priority: IssueQuery["priority"];
        };
        Returns: Issue[];
      };
    };
  };
};
