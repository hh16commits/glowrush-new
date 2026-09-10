import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const phone = String(body.phone ?? "").replace(/[^\d+]/g, "");
    const token = Deno.env.get("TELEGRAM_GATEWAY_TOKEN");

    if (!token) {
      return json({ error: "TELEGRAM_GATEWAY_TOKEN is not configured" }, 500);
    }

    if (!/^\+\d{8,15}$/.test(phone)) {
      return json({ error: "Неверный номер телефона" }, 400);
    }

    const response = await fetch(
      "https://gatewayapi.telegram.org/checkSendAbility",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phone,
        }),
      },
    );

    const result = await response.json();

    console.log("Telegram checkSendAbility:", result);

    return json(
      {
        http_status: response.status,
        telegram: result,
      },
      response.ok && result.ok ? 200 : 400,
    );
  } catch (error) {
    console.error("Diagnostic error:", error);

    return json(
      {
        error: error instanceof Error ? error.message : "Ошибка сервера",
      },
      500,
    );
  }
});
