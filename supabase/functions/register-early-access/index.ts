import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createRegisterEarlyAccessHandler } from "./handler.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const admin =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const handler = createRegisterEarlyAccessHandler({
  clientKeySecret: serviceKey ?? null,
  async consumeRateLimit(clientKey) {
    if (!admin) throw new Error("server configuration unavailable");
    const { data, error } = await admin.rpc("consume_early_access_rate_limit", {
      p_client_key: clientKey,
    });
    if (error || !Array.isArray(data) || data.length !== 1)
      throw new Error("rate limit unavailable");
    return {
      allowed: data[0]?.allowed === true,
      retryAfterSeconds: Number(data[0]?.retry_after_seconds),
    };
  },
  async insertRegistration(projectId, email) {
    if (!admin) throw new Error("server configuration unavailable");
    const { data, error } = await admin.rpc("insert_early_access_registration", {
      p_project_id: projectId,
      p_email: email,
    });
    if (error || !Array.isArray(data) || data.length !== 1)
      throw new Error("registration storage unavailable");
    return { id: data[0]?.id, createdAt: data[0]?.created_at };
  },
});

Deno.serve(handler);
