"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { logout, saveContent, uploadImage } from "@/app/admin/actions";
import { listTemplates, type SiteContent } from "@/lib/content-types";

type Path = (string | number)[];
type Json = string | boolean | Json[] | { [key: string]: Json };

const SECTIONS: { key: keyof SiteContent; label: string; intro: string; view?: string }[] = [
  { key: "home", label: "Opening", intro: "The first screen: statement, portrait and the two paths below it.", view: "/en" },
  { key: "about", label: "About", intro: "Your story, told in the first person. The closing line is shown on bronze.", view: "/en#about" },
  { key: "consulting", label: "Consulting", intro: "Practice areas and practical applications.", view: "/en#consulting" },
  { key: "productions", label: "Productions", intro: "Projects in development. Show only approved material.", view: "/en#productions" },
  { key: "contact", label: "Contact", intro: "Introduction, form labels and messages.", view: "/en#contact" },
  { key: "privacy", label: "Privacy notice", intro: "Linked from the contact form and the footer.", view: "/en/privacy" },
  { key: "perspectives", label: "Perspectives", intro: "Essays. The page stays hidden until it is switched on under Settings.", view: "/en/perspectives" },
  { key: "navigation", label: "Menu & labels", intro: "Menu items and small interface labels." },
  { key: "seo", label: "Search & sharing", intro: "Titles and descriptions shown in Google and in link previews." },
  { key: "settings", label: "Settings", intro: "Switches that change what the site shows." },
];

const LABELS: Record<string, string> = {
  cta: "Link label",
  seo: "Search & sharing",
  perspectivesEnabled: "Show the Perspectives page",
  showEmail: "Show the email address on the site",
  closing: "Closing line",
  image: "Image",
  email: "Email address",
  question: "Opening line",
  body: "Text",
  lead: "Headline",
  src: "Image",
  alt: "Image description (for screen readers and search engines)",
  slug: "Web address",
  published: "Published",
  date: "Date",
  areas: "Practice areas",
  items: "Applications",
  projects: "Projects",
  essays: "Essays",
  roles: "Roles",
  fields: "Form labels",
  messages: "Form messages",
  emailLabel: "Label before the email address",
  privacyNote: "Privacy note beside the form",
  readLabel: "“Read” link label",
  backLabel: "“Back” link label",
  notFoundTitle: "Page not found — message",
  notFoundLink: "Page not found — link label",
};

const HELP: Record<string, string> = {
  body: "Separate paragraphs with a blank line. Start a paragraph with “> ” to set it apart.",
  headline: "Wrap words in *asterisks* to set them in italics.",
  showEmail: "Turn on only once the mailbox is working.",
  perspectivesEnabled: "Adds Perspectives to the menu and shows published essays.",
  slug: "Lowercase words joined by hyphens, e.g. what-a-market-report-cannot-tell-you",
  date: "Format: YYYY-MM-DD",
  published: "Only published essays are shown on the site.",
};

const humanize = (key: string) => {
  const words = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
const labelFor = (key: string | number) => (typeof key === "number" ? "" : (LABELS[key] ?? humanize(key)));

const isObject = (v: unknown): v is Record<string, Json> => !!v && typeof v === "object" && !Array.isArray(v);
const isLocalized = (v: unknown): v is { en: string; fr: string } =>
  isObject(v) && Object.keys(v).length === 2 && typeof v.en === "string" && typeof v.fr === "string";
const isImage = (v: unknown): v is { src: string; alt: { en: string; fr: string } } =>
  isObject(v) && typeof v.src === "string" && isLocalized(v.alt);

function setAt(root: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setAt(copy[head as number], rest, value);
    return copy;
  }
  const obj = root as Record<string, Json>;
  return { ...obj, [head]: setAt(obj[head as string], rest, value) };
}

/** Template path for list items: numeric indexes are dropped ("productions.projects"). */
const templateKey = (path: Path) => path.filter((p) => typeof p === "string").join(".");

export function ContentEditor({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState<Json>(initial as unknown as Json);
  const [saved, setSaved] = useState<Json>(initial as unknown as Json);
  const [section, setSection] = useState<keyof SiteContent>("home");
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  const dirty = useMemo(() => JSON.stringify(content) !== JSON.stringify(saved), [content, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (path: Path, value: Json) => {
    setContent((c) => setAt(c, path, value));
    setStatus(null);
  };

  const save = () =>
    startSaving(async () => {
      const result = await saveContent(JSON.stringify(content));
      if (result.ok) {
        setSaved(content);
        const time = new Date(result.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setStatus({ tone: "ok", text: `Saved at ${time}. The site is updated.` });
      } else {
        setStatus({ tone: "error", text: result.error });
      }
    });

  const current = SECTIONS.find((s) => s.key === section)!;
  const data = (content as Record<string, Json>)[section];

  return (
    <div className="min-h-svh pb-32">
      <header className="border-b border-line bg-ivory">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-baseline gap-4">
            <span className="wordmark text-[1.3rem]">Araksan</span>
            <span className="eyebrow text-ink-soft">Site editor</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/en" target="_blank" rel="noreferrer" className="eyebrow link-underline">
              View site ↗
            </a>
            <form action={logout}>
              <button type="submit" className="eyebrow link-underline text-ink-soft">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 md:grid-cols-[13rem_1fr]">
        <nav aria-label="Sections">
          <ul className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setSection(s.key)}
                  aria-current={s.key === section ? "page" : undefined}
                  className={`w-full whitespace-nowrap px-3 py-2 text-left transition-colors ${
                    s.key === section ? "bg-charcoal text-ivory" : "hover:bg-cream"
                  }`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="section-title">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-charcoal pb-5">
            <div>
              <h1 id="section-title" className="font-display text-[2.2rem] leading-tight">
                {current.label}
              </h1>
              <p className="mt-1 text-ink-soft">{current.intro}</p>
            </div>
            {current.view && (
              <a href={current.view} target="_blank" rel="noreferrer" className="eyebrow link-underline text-bronze-ink">
                Open page ↗
              </a>
            )}
          </div>
          <div className="pt-8">
            <Node value={data} path={[section]} onChange={update} />
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p role="status" className={status?.tone === "error" ? "text-[#9b2c2c]" : "text-ink-soft"}>
            {status?.text ?? (dirty ? "You have unsaved changes." : "All changes are saved.")}
          </p>
          <div className="flex gap-3">
            {dirty && (
              <button
                type="button"
                onClick={() => {
                  setContent(saved);
                  setStatus(null);
                }}
                className="eyebrow px-5 py-3 text-ink-soft hover:text-charcoal"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="eyebrow bg-charcoal px-7 py-3 text-ivory transition-colors hover:bg-bronze-ink disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type NodeProps = { value: Json; path: Path; onChange: (path: Path, value: Json) => void; label?: string };

function Node({ value, path, onChange, label }: NodeProps) {
  const key = path[path.length - 1];
  const title = label ?? labelFor(key);
  const help = typeof key === "string" ? HELP[key] : undefined;
  const id = path.join("-");

  if (isLocalized(value)) return <LocalizedField id={id} title={title} help={help} value={value} path={path} onChange={onChange} />;
  if (isImage(value)) return <ImageField id={id} title={title} value={value} path={path} onChange={onChange} />;

  if (typeof value === "boolean") {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-start gap-4 border-b border-line py-5">
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="mt-1 h-5 w-5 accent-[#7a5a32]"
        />
        <span>
          <span className="block font-medium">{title}</span>
          {help && <span className="mt-1 block text-sm text-ink-soft">{help}</span>}
        </span>
      </label>
    );
  }

  if (typeof value === "string") {
    return (
      <div className="border-b border-line py-5">
        <label htmlFor={id} className="eyebrow block text-ink-soft">
          {title}
        </label>
        {help && <p className="mt-1 text-sm text-ink-soft">{help}</p>}
        <input
          id={id}
          type={key === "date" ? "date" : key === "email" ? "email" : "text"}
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
          className="field"
        />
      </div>
    );
  }

  if (Array.isArray(value)) return <ListField title={title} value={value} path={path} onChange={onChange} />;

  if (isObject(value)) {
    const nested = path.length > 1;
    return (
      <div className={nested && title ? "mt-8" : ""}>
        {nested && title && <h2 className="mb-1 font-display text-[1.6rem]">{title}</h2>}
        {Object.entries(value).map(([k, v]) => (
          <Node key={k} value={v} path={[...path, k]} onChange={onChange} />
        ))}
      </div>
    );
  }
  return null;
}

function LocalizedField({
  id,
  title,
  help,
  value,
  path,
  onChange,
}: {
  id: string;
  title: string;
  help?: string;
  value: { en: string; fr: string };
  path: Path;
  onChange: NodeProps["onChange"];
}) {
  const long = Math.max(value.en.length, value.fr.length) > 90 || /\n/.test(value.en + value.fr);
  const rows = Math.min(18, Math.max(2, Math.ceil(Math.max(value.en.length, value.fr.length) / 60) + 1));

  return (
    <fieldset className="border-b border-line py-5">
      <legend className="eyebrow float-left w-full text-ink-soft">{title}</legend>
      {help && <p className="clear-both pt-1 text-sm text-ink-soft">{help}</p>}
      <div className="clear-both grid gap-x-6 gap-y-3 pt-2 md:grid-cols-2">
        {(["en", "fr"] as const).map((lang) => {
          const fieldId = `${id}-${lang}`;
          const common = {
            id: fieldId,
            value: value[lang],
            lang,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange([...path, lang], e.target.value),
            className: "field",
          };
          return (
            <div key={lang}>
              <label htmlFor={fieldId} className="text-xs font-semibold tracking-wider text-bronze-ink">
                {lang === "en" ? "ENGLISH" : "FRANÇAIS"}
                {!value[lang].trim() && <span className="ml-2 font-normal text-[#9b2c2c]">empty</span>}
              </label>
              {long ? <textarea rows={rows} {...common} className="field resize-y leading-relaxed" /> : <input type="text" {...common} />}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function ImageField({
  id,
  title,
  value,
  path,
  onChange,
}: {
  id: string;
  title: string;
  value: { src: string; alt: { en: string; fr: string } };
  path: Path;
  onChange: NodeProps["onChange"];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    const data = new FormData();
    data.set("file", file);
    const result = await uploadImage(data);
    setBusy(false);
    if (result.ok) onChange([...path, "src"], result.src);
    else setError(result.error);
  };

  return (
    <div className="border-b border-line py-6">
      <p className="eyebrow text-ink-soft">{title || "Image"}</p>
      <div className="mt-4 flex flex-wrap items-start gap-6">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden bg-cream">
          {value.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-ink-soft">No image</span>
          )}
        </div>
        <div className="space-y-3">
          <label htmlFor={`${id}-file`} className="eyebrow inline-block cursor-pointer border border-charcoal px-4 py-3 hover:bg-charcoal hover:text-ivory">
            {busy ? "Uploading…" : "Replace image"}
          </label>
          <input
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p className="text-sm text-ink-soft">JPEG, PNG or WebP, up to 15 MB. Large images are resized automatically.</p>
          {value.src && (
            <button type="button" onClick={() => onChange([...path, "src"], "")} className="text-sm text-ink-soft underline">
              Remove image
            </button>
          )}
          {error && (
            <p role="alert" className="text-sm text-[#9b2c2c]">
              {error}
            </p>
          )}
        </div>
      </div>
      <LocalizedField id={`${id}-alt`} title={labelFor("alt")} value={value.alt} path={[...path, "alt"]} onChange={onChange} />
    </div>
  );
}

function ListField({ title, value, path, onChange }: { title: string; value: Json[]; path: Path; onChange: NodeProps["onChange"] }) {
  const template = listTemplates[templateKey(path)] as Json | undefined;

  const move = (from: number, to: number) => {
    const copy = [...value];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(path, copy);
  };

  const summary = (item: Json, i: number) => {
    if (isLocalized(item)) return item.en || `Item ${i + 1}`;
    if (isObject(item)) {
      const t = item.title;
      if (typeof t === "string" && t) return t;
      if (isLocalized(t) && t.en) return t.en;
    }
    return `Item ${i + 1}`;
  };

  return (
    <div className="mt-8">
      <h2 className="font-display text-[1.6rem]">{title}</h2>
      <ol className="mt-4 space-y-4">
        {value.map((item, i) => (
          <li key={i}>
            <details className="border border-line bg-ivory open:bg-white/40" open={value.length <= 2}>
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
                <span className="font-medium">
                  <span className="mr-3 text-bronze-ink">{String(i + 1).padStart(2, "0")}</span>
                  {summary(item, i)}
                </span>
                <span className="flex gap-1 text-sm text-ink-soft" onClick={(e) => e.preventDefault()}>
                  <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="px-2 py-1 hover:text-charcoal disabled:opacity-30" aria-label={`Move item ${i + 1} up`}>
                    ↑
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} className="px-2 py-1 hover:text-charcoal disabled:opacity-30" aria-label={`Move item ${i + 1} down`}>
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Remove this item? You can still discard before saving.")) {
                        onChange(path, value.filter((_, j) => j !== i));
                      }
                    }}
                    className="px-2 py-1 hover:text-[#9b2c2c]"
                  >
                    Remove
                  </button>
                </span>
              </summary>
              <div className="border-t border-line px-5 pb-5">
                <Node value={item} path={[...path, i]} onChange={onChange} label="" />
              </div>
            </details>
          </li>
        ))}
      </ol>
      {template !== undefined && (
        <button
          type="button"
          onClick={() => onChange(path, [...value, structuredClone(template)])}
          className="eyebrow mt-4 border border-dashed border-charcoal/40 px-5 py-3 hover:border-charcoal"
        >
          + Add
        </button>
      )}
    </div>
  );
}
