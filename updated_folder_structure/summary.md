# Project Restructure Documentation

## 3. Differences from Previous Folder Structure

| Previous | New | Reason |
|----------|-----|--------|
| Flat `app/` with all pages | Route groups `(auth)` & `(dashboard)` | Isolate auth pages from protected pages; different layouts |
| Multiple Supabase client files (`supabase.ts`, `supabaseClient.ts`, `client.ts`, `server.ts`) | Single `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (server) | Eliminate duplication, follow Supabase SSR best practices |
| Chat logic inside `page.tsx` | `useChatStream` custom hook + `MessageList`/`MessageInput` components | Reusability, testability, cleaner page |
| Writing UI in one file | Split into `EssayEditor` + `FeedbackPanel` | Separation of concerns |
| Speaking page static (no real recording) | `AudioRecorder` with MediaRecorder API + `WaveformVisualizer` | Functional speaking practice |
| No rate limiting | `lib/api/rateLimit.ts` + Upstash Redis | Prevent API abuse |
| No environment validation | `lib/config/env.ts` with Zod | Catch missing env vars at startup |
| No Stripe integration | `api/webhooks/stripe/route.ts` | Subscription billing ready |
| No custom hooks for auth/progress | `useAuth`, `useProgress`, `useSubscription` | Centralized data fetching, reduces boilerplate |
| UI components defined inline | Reusable `ui/Button`, `Card`, `Input`, `Spinner` | Consistent styling, easier maintenance |

## 4. Files Changed / Removed / Created

### Removed (consolidated)

- `src/lib/supabase.ts`
- `src/lib/supabaseClient.ts`
- `src/lib/client.ts`
- `src/lib/server.ts`

### Changed

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Updated imports (Navigation, Providers paths) |
| `src/app/globals.css` | Added `animate-wave`, neon shadows, fixed `::before` mask |
| `src/middleware.ts` | Fixed redirect loop, added static path exclusion |
| `package.json` | Added `zod`, `@upstash/ratelimit`, `@upstash/redis`, `stripe` |

### New Files – Purpose Summary

| File | Purpose |
|------|---------|
| `src/app/(auth)/login/page.tsx` | Moved from `app/login` – email/password login with Google OAuth option |
| `src/app/(auth)/signup/page.tsx` | New – separate signup page for account creation |
| `src/app/(auth)/callback/route.ts` | OAuth callback handler – exchanges code for session |
| `src/app/(dashboard)/dashboard/page.tsx` | Moved + enhanced with `useProgress` & `useSubscription` hooks |
| `src/app/(dashboard)/chat/page.tsx` | Simplified – uses `useChatStream` hook and reusable chat components |
| `src/app/(dashboard)/writing/page.tsx` | Split into `EssayEditor` and `FeedbackPanel` components |
| `src/app/(dashboard)/speaking/page.tsx` | Real audio integration – uses `AudioRecorder` and `WaveformVisualizer` |
| `src/components/chat/useChatStream.ts` | Extracted chat streaming logic – manages messages, loading, abort controller |
| `src/components/speaking/AudioRecorder.tsx` | MediaRecorder implementation – records audio and sends blob to API |
| `src/lib/api/rateLimit.ts` | Upstash rate limiter – prevents API abuse (10 requests / 10 seconds) |
| `src/lib/config/env.ts` | Zod environment validation – ensures all required env vars are present at startup |
| `src/lib/hooks/useAuth.tsx` | Replaces `context/AuthContext.tsx` – provides user, session, signIn, signUp, signOut, Google OAuth |
| `src/lib/hooks/useProgress.ts` | Fetch user progress & stats – total count, average score, latest score, recent sessions |
| `src/lib/hooks/useSubscription.ts` | Fetch subscription plan – retrieves current plan (free/pro) from Supabase |
| `src/lib/supabase/client.ts` & `server.ts` | Unified Supabase clients – browser client for client components, server client for server components & API routes |
| `src/lib/utils/validators.ts` | Zod schemas for API inputs – validates chat requests, writing requests, etc. |
| `src/types/database.ts` | TypeScript types for Supabase tables – `Profile`, `Progress`, `Subscription` |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook handler – processes `checkout.session.completed` and `subscription.deleted` events |

---

*End of documentation*