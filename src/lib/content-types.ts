import type { Localized } from "./i18n";
import seed from "@/content/seed.json";

export type ImageAsset = { src: string; alt: Localized };

export type Project = {
  title: Localized;
  format: Localized;
  status: Localized;
  question: Localized;
  description: Localized;
  image: ImageAsset;
};

export type Essay = {
  slug: string;
  published: boolean;
  date: string;
  title: Localized;
  summary: Localized;
  body: Localized;
};

export type PageSeo = { title: Localized; description: Localized };

// The seed file is the canonical shape of the site content. Arrays that ship
// empty (essays) are typed explicitly below.
type Seed = typeof seed;

export type SiteContent = Omit<Seed, "perspectives" | "productions"> & {
  productions: Omit<Seed["productions"], "projects"> & { projects: Project[] };
  perspectives: Omit<Seed["perspectives"], "essays"> & { essays: Essay[] };
};

export const seedContent = seed as SiteContent;

/** Blank items used by the admin panel when adding to a list. */
export const listTemplates: Record<string, unknown> = {
  "consulting.areas": {
    title: { en: "", fr: "" },
    body: { en: "", fr: "" },
  },
  "consulting.applications.items": { en: "", fr: "" },
  "productions.projects": {
    title: { en: "", fr: "" },
    format: { en: "", fr: "" },
    status: { en: "In development", fr: "En développement" },
    question: { en: "", fr: "" },
    description: { en: "", fr: "" },
    image: { src: "", alt: { en: "", fr: "" } },
  } satisfies Project,
  "perspectives.essays": {
    slug: "",
    published: false,
    date: "",
    title: { en: "", fr: "" },
    summary: { en: "", fr: "" },
    body: { en: "", fr: "" },
  } satisfies Essay,
};
