"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitEnquiry, type ContactState } from "@/app/[lang]/actions";
import { Arrow } from "./Arrow";

export type ContactFormText = {
  name: string;
  email: string;
  organization: string;
  message: string;
  optional: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  invalid: string;
  nameRequired: string;
  emailInvalid: string;
  messageRequired: string;
  tooMany: string;
};

export function ContactForm({ locale, text }: { locale: string; text: ContactFormText }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitEnquiry, { status: "idle" });
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, [state]);
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div>
        <span aria-hidden="true" className="mb-8 block h-px w-14 bg-bronze" />
        <p ref={statusRef} tabIndex={-1} role="status" className="font-display text-title outline-none">
          {text.success}
        </p>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const v = state.values;
  const statusMessage =
    state.status === "invalid"
      ? text.invalid
      : state.status === "error"
        ? text.error
        : state.status === "limited"
          ? text.tooMany
          : "";

  const label = (htmlFor: string, value: string, optional = false) => (
    <label htmlFor={htmlFor} className="eyebrow block text-ink-soft">
      {value}
      {optional && <span className="ml-2 tracking-normal normal-case opacity-80">({text.optional})</span>}
    </label>
  );
  const fieldError = (id: string, show: boolean | undefined, message: string) =>
    show ? (
      <p id={id} className="mt-2 text-sm text-[#9b2c2c]">
        {message}
      </p>
    ) : null;

  return (
    <form action={action} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input ref={startedRef} type="hidden" name="started" defaultValue="" />
      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p ref={statusRef} tabIndex={-1} role="alert" className={statusMessage ? "mb-8 text-[#9b2c2c] outline-none" : "sr-only"}>
        {statusMessage}
      </p>

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
        <div>
          {label("name", text.name)}
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            defaultValue={v?.name}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="field"
          />
          {fieldError("name-error", errors.name, text.nameRequired)}
        </div>
        <div>
          {label("email", text.email)}
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            defaultValue={v?.email}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="field"
          />
          {fieldError("email-error", errors.email, text.emailInvalid)}
        </div>
        <div className="sm:col-span-2">
          {label("organization", text.organization, true)}
          <input
            id="organization"
            name="organization"
            type="text"
            autoComplete="organization"
            maxLength={200}
            defaultValue={v?.organization}
            className="field"
          />
        </div>
        <div className="sm:col-span-2">
          {label("message", text.message)}
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            maxLength={5000}
            defaultValue={v?.message}
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby={errors.message ? "message-error" : undefined}
            className="field resize-y"
          />
          {fieldError("message-error", errors.message, text.messageRequired)}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-sweep arrow-link eyebrow mt-12 bg-charcoal px-8 py-5 text-ivory disabled:opacity-60"
      >
        {pending ? text.sending : text.submit}
        <Arrow />
      </button>
    </form>
  );
}
