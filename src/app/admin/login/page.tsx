import { connection } from "next/server";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminConfigured, totpRequired } from "@/lib/auth";

// Credentials come from the runtime environment, so this is read per request
// rather than frozen into the build.
async function LoginPanel() {
  await connection();
  if (!adminConfigured()) {
    return (
      <p className="text-ink-soft">
        The editor is not configured. Set <code>ADMIN_PASSWORD_HASH</code> and <code>ADMIN_SESSION_SECRET</code> (run{" "}
        <code>npm run admin:credentials</code>) and restart the site.
      </p>
    );
  }
  return <LoginForm requireCode={totpRequired()} />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="wordmark text-center text-[1.5rem]">Araksan</p>
        <p className="eyebrow mt-3 text-center text-ink-soft">Site editor</p>
        <div className="mt-12 border-t border-charcoal pt-10">
          <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
            <LoginPanel />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
