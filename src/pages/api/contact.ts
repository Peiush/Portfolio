import type { APIRoute } from "astro";
import { z } from "zod";
import { Resend } from "resend";

export const prerender = false;

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  msg: z.string().trim().min(1).max(5000),
  drawingDataUrl: z.string().startsWith("data:image/png;base64,").max(2_000_000).nullish(),
  website: z.string().max(200).optional(), // honeypot
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const LIMIT = 5;
const WINDOW_S = 3600;
const hits = new Map<string, number[]>();

/** 5 requests / hour / IP. Uses Upstash REST when configured, otherwise per-instance memory. */
async function limited(ip: string): Promise<boolean> {
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const key = `contact:${ip}`;
      const headers = { Authorization: `Bearer ${token}` };
      const { result } = (await (await fetch(`${url}/incr/${key}`, { headers })).json()) as { result: number };
      if (result === 1) await fetch(`${url}/expire/${key}/${WINDOW_S}`, { headers });
      return result > LIMIT;
    } catch (err) {
      console.error("[contact] rate-limit store failed, falling back to memory", err);
    }
  }
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_S * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // same-origin only
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ success: false, error: "Forbidden." }, 403);

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ success: false, error: "Invalid request." }, 400); }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return json({ success: false, error: "Please check your name, email and message." }, 400);
  const { name, email, msg, drawingDataUrl, website } = parsed.data;

  if (website) return json({ success: true }); // bot: pretend it worked

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || clientAddress || "unknown";
  if (await limited(ip)) return json({ success: false, error: "Too many messages. Please try again later." }, 429);

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY / CONTACT_TO_EMAIL are not set");
    return json({ success: false, error: "The contact form isn't configured yet. Please email me directly." }, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: import.meta.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${msg}${drawingDataUrl ? "\n\n(doodle attached)" : ""}`,
      html: `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(msg)}</p>${drawingDataUrl ? '<p><img src="cid:drawing" alt="Visitor doodle" style="max-width:100%;border:1px solid #ccc"/></p>' : ""}`,
      attachments: drawingDataUrl
        ? [{ filename: "drawing.png", content: drawingDataUrl.split(",")[1], contentId: "drawing", contentType: "image/png" }]
        : undefined,
    });
    if (error) throw error;
    return json({ success: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    return json({ success: false, error: "Your message could not be sent. Please try again." }, 502);
  }
};
