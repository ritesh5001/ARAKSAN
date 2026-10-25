import "server-only";
import { Resend } from "resend";

export type Enquiry = { name: string; email: string; organization: string; message: string; locale: string };

// Resend's shared test sender. It only delivers to the address that owns the
// Resend account; set CONTACT_FROM_EMAIL to an address on the verified
// araksan.com domain for real use.
const TEST_SENDER = "ARAKSAN website <onboarding@resend.dev>";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function renderHtml(enquiry: Enquiry) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#7a5a32;font-size:12px;letter-spacing:.12em;text-transform:uppercase;vertical-align:top">${label}</td>` +
    `<td style="padding:6px 0;color:#2b2b2b">${value}</td></tr>`;
  return (
    `<div style="background:#f6f2ea;padding:32px;font-family:Georgia,serif">` +
    `<div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-top:2px solid #8c6a3f">` +
    `<p style="margin:0 0 24px;font-size:20px;letter-spacing:.3em;color:#2b2b2b">ARAKSAN</p>` +
    `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">` +
    row("Name", escapeHtml(enquiry.name)) +
    row("Email", `<a href="mailto:${escapeHtml(enquiry.email)}" style="color:#7a5a32">${escapeHtml(enquiry.email)}</a>`) +
    row("Organization", escapeHtml(enquiry.organization || "—")) +
    row("Language", enquiry.locale.toUpperCase()) +
    `</table>` +
    `<p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #dcd3c4;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#2b2b2b;white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>` +
    `</div></div>`
  );
}

/**
 * Sends an enquiry to CONTACT_TO_EMAIL through Resend. Nothing is stored on the
 * server. In development without RESEND_API_KEY the enquiry is logged instead.
 */
export async function sendEnquiry(enquiry: Enquiry): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL not set; enquiry not sent:", {
        ...enquiry,
        message: `${enquiry.message.length} chars`,
      });
      return true;
    }
    console.error("[contact] Email is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL.");
    return false;
  }

  const text = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Organization: ${enquiry.organization || "—"}`,
    `Language: ${enquiry.locale.toUpperCase()}`,
    "",
    enquiry.message,
  ].join("\n");

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from: process.env.CONTACT_FROM_EMAIL || TEST_SENDER,
      to: to.split(",").map((address) => address.trim()),
      replyTo: `${enquiry.name} <${enquiry.email}>`,
      subject: `Website enquiry from ${enquiry.name}`,
      text,
      html: renderHtml(enquiry),
      tags: [{ name: "source", value: "contact-form" }],
    });
    if (error) {
      console.error("[contact] Resend rejected the enquiry:", error.name, error.message);
      return false;
    }
    console.info("[contact] Enquiry sent via Resend:", data?.id);
    return true;
  } catch (error) {
    console.error("[contact] Failed to reach Resend:", error instanceof Error ? error.message : error);
    return false;
  }
}
