# Supabase early-access operations

The public browser boundary is `register-early-access`; direct table CRUD is revoked for `anon`, `authenticated`, and `service_role`. The function's server credential can only execute a tightly locked SECURITY DEFINER receipt RPC, which allowlists the project, validates the email, inserts affirmative consent, and returns only `id` and `created_at`. The function requires an exact CORS allowlist and fails closed when configuration, rate-limit storage, IP identity, or registration storage is unavailable.

## Configuration

- Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (public values only).
- Function: `EARLY_ACCESS_ALLOWED_ORIGINS` is a comma-separated list of exact origins. Wildcards, paths, and missing values are rejected.
- Function: `EARLY_ACCESS_IP_HASH_SECRET` is at least 32 random characters and must be independently rotated as a secret. Rotation resets active rate-limit identities.
- Supabase injects `SUPABASE_URL` and legacy `SUPABASE_SERVICE_ROLE_KEY`; the latter must never enter browser variables, source, responses, or logs.

The hosted Supabase gateway is the trusted proxy. The function selects the final value of the gateway-managed `X-Forwarded-For` chain, never the first client-supplied value, and stores only an HMAC digest. For self-hosting, configure the edge proxy to append/replace this header from the peer address before enabling the function. Requests without this trusted signal fail closed.

## Local and remote commands

```sh
supabase start
supabase db reset
supabase functions serve register-early-access --env-file supabase/functions/.env.local
```

After review, apply and deploy remotely:

```sh
supabase link --project-ref <project-ref>
supabase db push
supabase secrets set --env-file supabase/functions/.env.production
supabase functions deploy register-early-access --no-verify-jwt
```

Do not commit `.env.local` or `.env.production`. Preflight requests do not consume rate-limit budget. Every POST attempt does, including malformed and unknown-project requests. The shared Postgres RPC serializes attempts per HMAC identity and implements five requests in an arbitrary 60-second window.
