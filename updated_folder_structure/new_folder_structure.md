src/
├── app/
│   ├── (auth)/                 # Route group – no sidebar layout
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts   # OAuth callback handler
│   ├── (dashboard)/            # Route group – with sidebar navigation
│   │   ├── dashboard/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── writing/page.tsx
│   │   └── speaking/page.tsx
│   ├── api/
│   │   ├── chat/route.ts       # Edge runtime streaming
│   │   ├── writing/route.ts    # OpenAI essay evaluation
│   │   ├── speaking/route.ts   # Audio analysis (mock)
│   │   └── webhooks/stripe/route.ts  # Subscription events
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── Button/index.tsx
│   │   ├── Card/index.tsx
│   │   ├── Input/index.tsx
│   │   └── Spinner/index.tsx
│   ├── chat/
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── useChatStream.ts    # Custom hook for chat logic
│   ├── writing/
│   │   ├── EssayEditor.tsx
│   │   └── FeedbackPanel.tsx
│   ├── speaking/
│   │   ├── AudioRecorder.tsx   # Real MediaRecorder
│   │   └── WaveformVisualizer.tsx
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   └── ProtectedRoute.tsx
│   └── Providers.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Helper for middleware
│   ├── api/
│   │   ├── client.ts           # Fetch wrappers (optional)
│   │   ├── endpoints.ts        # API constants (optional)
│   │   └── rateLimit.ts        # Upstash rate limiter
│   ├── hooks/
│   │   ├── useAuth.ts          # Supabase auth context + provider
│   │   ├── useProgress.ts      # Fetch user progress & stats
│   │   └── useSubscription.ts  # Fetch subscription plan
│   ├── utils/
│   │   ├── validators.ts       # Zod schemas for API requests
│   │   └── logger.ts
│   └── config/
│       ├── env.ts              # Zod runtime env validation
│       └── constants.ts
├── types/
│   ├── database.ts             # Supabase table types
│   ├── api.ts
│   └── index.ts
├── middleware.ts               # Route protection + session refresh
└── .env.example