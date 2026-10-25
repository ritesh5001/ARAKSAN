"use server";

import { hasLocale } from "@/lib/i18n";
import { sendEnquiry } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type ContactState = {
  status: "idle" | "success" | "invalid" | "error" | "limited";
  errors?: Partial<Record<"name" | "email" | "message", true>>;
  values?: { name: string; email: string; organization: string; message: string };
};

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const MIN_FILL_MS = 2500;

const field = (data: FormData, key: string, max: number) =>
  String(data.get(key) ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);

export async function submitEnquiry(_prev: ContactState, data: FormData): Promise<ContactState> {
  const values = {
    name: field(data, "name", 120).replace(/[\r\n]+/g, " "),
    email: field(data, "email", 200).replace(/[\r\n]+/g, ""),
    organization: field(data, "organization", 200).replace(/[\r\n]+/g, " "),
    message: field(data, "message", 5000),
  };

  // Validate first, so a person who submits too early always sees what is missing.
  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = true;
  if (!EMAIL.test(values.email)) errors.email = true;
  if (!values.message) errors.message = true;
  if (Object.keys(errors).length) return { status: "invalid", errors, values };

  // Spam traps: a hidden field people never fill in, and a minimum time on the form.
  // Bots get a quiet "success" so they have nothing to learn from.
  const started = Number(data.get("started"));
  if (field(data, "website", 200) || (started && Date.now() - started < MIN_FILL_MS)) {
    return { status: "success" };
  }

  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return { status: "limited", values };
  }

  const locale = String(data.get("locale") ?? "en");
  const sent = await sendEnquiry({ ...values, locale: hasLocale(locale) ? locale : "en" });
  return sent ? { status: "success" } : { status: "error", values };
}
