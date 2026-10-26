import type { Project } from "./content-types";

/** Stable anchor for a project on the Productions page, from its English title. */
export function projectSlug(project: Project): string {
  return (
    project.title.en
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}
