import { createClient } from "jsr:@supabase/supabase-js@2";

const CAMPUS_TIME_ZONE = "America/Los_Angeles";
type MealPeriod = "breakfast" | "lunch" | "dinner";

function campusSchedule(now: Date): { date: string; period: MealPeriod | null } {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map((part) => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  const hour = Number(values.hour);
  const weekend = values.weekday === "Sat" || values.weekday === "Sun";
  if (Number(values.minute) > 9) return { date, period: null };
  if (hour === (weekend ? 9 : 7)) return { date, period: "breakfast" };
  if (hour === 11) return { date, period: "lunch" };
  if (hour === 17) return { date, period: "dinner" };
  return { date, period: null };
}

async function sha256(value: unknown) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value)));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (Deno.env.get("DATA_SOURCE_APPROVED") !== "true") return Response.json({ error: "Live source ingestion is disabled pending written approval." }, { status: 503 });
  const cronSecret = Deno.env.get("INGESTION_CRON_SECRET");
  if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const scheduled = campusSchedule(new Date());
  const period = (body.period as MealPeriod | undefined) ?? scheduled.period;
  const menuDate = (body.menuDate as string | undefined) ?? scheduled.date;
  if (!period) return Response.json({ status: "skipped", reason: "Outside an ingestion window" });
  const sourceTemplate = Deno.env.get("AUTHORIZED_MENU_URL_TEMPLATE");
  if (!sourceTemplate) return Response.json({ error: "Authorized source URL is not configured." }, { status: 503 });
  const sourceUrl = sourceTemplate.replace("{date}", menuDate).replace("{period}", period);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: existing } = await supabase.from("menu_snapshots").select("id").eq("location_id", "gastronome").eq("menu_date", menuDate).eq("scheduled_period", period).maybeSingle();
  if (existing) return Response.json({ status: "skipped", reason: "Snapshot already exists" });
  const { data: run } = await supabase.from("ingestion_runs").insert({ location_id: "gastronome", menu_date: menuDate, scheduled_period: period, status: "started" }).select("id").single();

  try {
    const sourceResponse = await fetch(sourceUrl, { headers: { Accept: "application/json", "User-Agent": "GSpot-Eats-authorized-ingestion/0.1" } });
    if (!sourceResponse.ok) throw new Error(`Authorized source returned ${sourceResponse.status}`);
    const payload = await sourceResponse.json();
    if (payload?.locationId !== "gastronome" || payload?.menuDate !== menuDate || !Array.isArray(payload?.periods)) throw new Error("Source adapter did not return the normalized menu contract");
    await supabase.from("menu_snapshots").insert({ location_id: "gastronome", menu_date: menuDate, scheduled_period: period, source_fetched_at: new Date().toISOString(), payload, payload_checksum: await sha256(payload) });
    await supabase.from("ingestion_runs").update({ status: "succeeded", finished_at: new Date().toISOString(), status_code: sourceResponse.status }).eq("id", run.id);
    return Response.json({ status: "succeeded", menuDate, period });
  } catch (error) {
    await supabase.from("ingestion_runs").update({ status: "failed", finished_at: new Date().toISOString(), error_message: error instanceof Error ? error.message : "Unknown error" }).eq("id", run.id);
    return Response.json({ error: "Ingestion failed; the previous valid snapshot was preserved." }, { status: 502 });
  }
});
