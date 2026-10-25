import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { href, t, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  contact: SiteContent["contact"];
  privacyLabel: SiteContent["navigation"]["privacy"];
  email: string | null;
};

export function Contact({ locale, contact, privacyLabel, email }: Props) {
  const L = (value: Record<Locale, string>) => t(value, locale);

  return (
    <section
      id="contact"
      data-section
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden bg-cream py-28 md:py-40"
    >
      <Texture name="stone" className="-z-10 opacity-70" />

      <div className="shell grid-12 gap-y-16">
        <div className="col-span-12 lg:col-span-5">
          <h2 id="contact-title" className="words font-display text-display font-light">
            <Words text={L(contact.title)} />
          </h2>
          <p className="reveal mt-8 max-w-md font-display text-standfirst text-ink-soft">{L(contact.intro)}</p>

          {email && (
            <p className="reveal mt-10">
              <span className="eyebrow block text-bronze-ink">{L(contact.emailLabel)}</span>
              <a href={`mailto:${email}`} className="link-underline mt-2 inline-block font-display text-[1.5rem]">
                {email}
              </a>
            </p>
          )}

          {contact.image.src && (
            <figure className="reveal-image hover-zoom relative mt-14 hidden aspect-[4/3] max-w-md overflow-hidden bg-ivory lg:block">
              <Image
                src={contact.image.src}
                alt={L(contact.image.alt)}
                fill
                sizes="(min-width: 1024px) 28rem, 0px"
                className="object-cover object-[60%_35%]"
              />
            </figure>
          )}

          <aside className="reveal mt-12 max-w-md border-l border-bronze pl-6 text-[0.95rem] text-ink-soft">
            <p>{L(contact.privacyNote)}</p>
            <Link href={href(locale, "/privacy")} className="link-underline mt-3 inline-block text-bronze-ink">
              {L(privacyLabel)}
            </Link>
          </aside>
        </div>

        <div className="reveal col-span-12 bg-ivory/90 p-7 shadow-[0_30px_80px_-40px_rgb(28_27_25/0.35)] md:p-12 lg:col-span-6 lg:col-start-7 lg:self-start">
          <ContactForm
            locale={locale}
            text={{
              name: L(contact.fields.name),
              email: L(contact.fields.email),
              organization: L(contact.fields.organization),
              message: L(contact.fields.message),
              optional: L(contact.fields.optional),
              submit: L(contact.fields.submit),
              sending: L(contact.fields.sending),
              success: L(contact.messages.success),
              error: L(contact.messages.error),
              invalid: L(contact.messages.invalid),
              nameRequired: L(contact.messages.nameRequired),
              emailInvalid: L(contact.messages.emailInvalid),
              messageRequired: L(contact.messages.messageRequired),
              tooMany: L(contact.messages.tooMany),
            }}
          />
        </div>
      </div>
    </section>
  );
}
