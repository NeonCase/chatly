// Supabase Edge Function "push": отправляет уведомление на телефон при новом сообщении или звонке.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

webpush.setVapidDetails("mailto:admin@chatly.app", Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);

Deno.serve(async (req) => {
  const p = await req.json();
  const r = p.record;
  const isCall = p.table === "calls";
  if (!r || (isCall && r.status !== "ringing")) return new Response("skip");
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: from } = await sb.from("profiles").select("nick,name").eq("id", r.from_id).single();
  const { data: subs } = await sb.from("push_subs").select("endpoint,sub").eq("user_id", r.to_id);
  const who = from?.name || from?.nick || "Chatly";
  const body = isCall ? "Нажмите, чтобы ответить" : r.kind === "msg" ? String(r.body).slice(0, 120) : r.kind === "stars" ? "Прислал(а) вам звёзды ⭐" : "Подарил(а) вам NFT 🎁";
  const payload = JSON.stringify({ title: isCall ? (r.video ? "📹 Видеозвонок · " : "📞 Звонок · ") + who : who, body, call: isCall, from: from?.nick });
  await Promise.all((subs || []).map(async (s) => {
    try {
      await webpush.sendNotification(s.sub, payload, { urgency: "high", TTL: isCall ? 30 : 3600 });
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", s.endpoint);
    }
  }));
  return new Response("ok");
});
