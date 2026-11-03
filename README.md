# Smart Sender

## Run

Requires Node.js 22.12+.

```sh
npm ci
npm run dev
```

Credentials: `oleg@smartsender.test` / `Testwork123!`.

## Test

```sh
npm test
```

## Key decisions

- API logic, authentication state and UI are separate. AuthContext stores the user;
  TanStack Query caches webhooks.
- Parallel `401` responses share one rotate request. Authenticated requests retry
  once after a successful session rotation. `419` triggers one CSRF refresh and retry.
- Search and pagination are stored in the URL. Forms use React Actions.
- Fingerprint is stored in the localStorage; the device token stays in memory.
  MSW state is kept only in memory and resets on page reload.
