import { RevealObserver } from "@/components/RevealObserver";
import { Contact } from "@/components/sections/Contact";
import { getContent } from "@/lib/content";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/contact", seo.contact);
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const locale = await resolveLocale(params);
  const content = await getContent();

  return (
    <>
      <Contact
        locale={locale}
        contact={content.contact}
        privacyLabel={content.navigation.privacy}
        email={content.settings.showEmail && content.settings.email ? content.settings.email : null}
      />
      <RevealObserver />
    </>
  );
}
