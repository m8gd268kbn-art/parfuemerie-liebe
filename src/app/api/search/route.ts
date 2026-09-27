import { getSuggestions } from "@/services/catalog/search";
import { rateLimit } from "@/services/security/rate-limit";
import { clientKey } from "@/services/security/request";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 80) ?? "";
  const limit = await rateLimit(`search:${await clientKey()}`, 120, 60);
  if (!limit.ok) return Response.json({ error: "Zu viele Anfragen" }, { status: 429 });
  const data = await getSuggestions(q);
  return Response.json(data, { headers: { "Cache-Control": "private, max-age=30" } });
}
