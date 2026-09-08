import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (request) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "apikey, authorization, content-type" };
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "GET") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  const menuDate = new URL(request.url).searchParams.get("date");
  if (!menuDate || !/^\d{4}-\d{2}-\d{2}$/.test(menuDate)) return Response.json({ error: "A valid date is required" }, { status: 400, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await supabase.from("menu_snapshots").select("payload, cached_at").eq("location_id", "gastronome").eq("menu_date", menuDate).order("cached_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return Response.json({ error: "Menu lookup failed" }, { status: 500, headers: cors });
  if (!data) return Response.json({ error: "No current menu is available" }, { status: 404, headers: cors });
  return Response.json(data.payload, { headers: { ...cors, "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } });
});
