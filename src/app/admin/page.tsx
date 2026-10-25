import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { isAuthenticated } from "@/lib/auth";
import { getContent } from "@/lib/content";

async function Editor() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return <ContentEditor initial={await getContent()} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-10 text-ink-soft">Loading the editor…</p>}>
      <Editor />
    </Suspense>
  );
}
