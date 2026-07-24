# Supabase early-access operations

The public browser boundary is `register-early-access`; direct table CRUD is revoked for `anon`, `authenticated`, and `service_role`. The function's server credential can only execute a tightly locked SECURITY DEFINER receipt RPC, which allowlists the project, validates the email, inserts affirmative consent, and returns only `id` and `created_at`. During testing the endpoint uses `Access-Control-Allow-Origin: *` and fails closed when its server credential, rate-limit storage, IP identity, or registration storage is unavailable.

## Configuration

- Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (public values only).
- Supabase injects `SUPABASE_URL` and legacy `SUPABASE_SERVICE_ROLE_KEY`; the latter must never enter browser variables, source, responses, or logs.

The hosted Supabase gateway is the trusted proxy. The function selects the final value of the gateway-managed `X-Forwarded-For` chain, never the first client-supplied value, and HMACs it with the automatically injected service-role secret. Only the digest is stored. No separate IP hashing secret is configured. Requests without the trusted IP signal or injected server credential fail closed.

`verify_jwt = false` is intentional because preregistration is public and does not require a user session. Authentication is not the write boundary: the function enforces the shared 5/60 rate limit and strict validation, while the database exposes only the narrow insert RPC to its server credential.

## Local and remote commands

```sh
supabase start
supabase db reset
supabase functions serve register-early-access
```

After review, apply and deploy remotely:

```sh
supabase link --project-ref <project-ref>
supabase db push
supabase functions deploy register-early-access --no-verify-jwt
```

No custom function `.env` file is required during testing. Preflight requests do not consume rate-limit budget. Every POST attempt does, including malformed and unknown-project requests. The shared Postgres RPC serializes attempts per HMAC identity and implements five requests in an arbitrary 60-second window.
