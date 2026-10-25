"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

export function LoginForm({ requireCode }: { requireCode: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="space-y-8">
      <div>
        <label htmlFor="password" className="eyebrow block text-ink-soft">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {requireCode && (
        <div>
          <label htmlFor="code" className="eyebrow block text-ink-soft">
            Six-digit code from your authenticator app
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            required
            className="field tracking-[0.3em]"
          />
        </div>
      )}
      {state.error && (
        <p role="alert" className="text-[#9b2c2c]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="eyebrow w-full bg-charcoal px-6 py-4 text-ivory transition-colors hover:bg-bronze-ink disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
