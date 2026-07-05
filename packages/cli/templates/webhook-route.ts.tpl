import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

const supportedEvents = new Set([
  'test',
  'post_published',
  'post_updated',
  'post_deleted',
  'page_published',
  'page_updated',
  'page_deleted',
]);

type WebhookPayload = {
  event?: unknown;
  slug?: unknown;
};

function jsonError(message: string, status: number): Response {
  return Response.json({ ok: false, error: message }, { status });
}

function verifySignature(body: string, secret: string, signature: string | null): boolean {
  const match = signature?.match(/^sha256=([a-fA-F0-9]+)$/);
  if (!match) {
    return false;
  }

  const expectedHex = createHmac('sha256', secret).update(body).digest('hex');
  const received = Buffer.from(match[1], 'hex');
  const expected = Buffer.from(expectedHex, 'hex');

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(received, expected);
}

function normalizeSlugPath(slug: string): string | null {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
  return normalized ? `/${normalized}` : null;
}

function pathsForEvent(event: string, slug: unknown): string[] {
  if (event.startsWith('post_')) {
    const paths = ['/posts'];
    if (typeof slug === 'string') {
      const slugPath = normalizeSlugPath(slug);
      if (slugPath) {
        paths.unshift(`/posts${slugPath}`);
      }
    }
    return paths;
  }

  if (event.startsWith('page_')) {
    const paths = ['/'];
    if (typeof slug === 'string') {
      const slugPath = normalizeSlugPath(slug);
      if (slugPath && slugPath !== '/') {
        paths.unshift(slugPath);
      }
    }
    return paths;
  }

  return [];
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.WP_NEXT_WEBHOOK_SECRET;
  if (!secret) {
    return jsonError('WP_NEXT_WEBHOOK_SECRET is not configured', 500);
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-wp-next-signature');

  if (!verifySignature(rawBody, secret, signature)) {
    return jsonError('Invalid webhook signature', 401);
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return jsonError('Malformed JSON body', 400);
  }

  if (typeof payload.event !== 'string' || !supportedEvents.has(payload.event)) {
    return jsonError('Unsupported webhook event', 400);
  }

  const paths = pathsForEvent(payload.event, payload.slug);
  for (const path of paths) {
    revalidatePath(path);
  }

  if (payload.event === 'test') {
    return Response.json({ ok: true, event: payload.event });
  }

  return Response.json({ ok: true, event: payload.event, revalidated: paths });
}
