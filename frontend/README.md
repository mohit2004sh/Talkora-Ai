# Talkora AI Frontend

A React + Vite frontend for Talkora AI, an English and communication practice platform.

## Authentication

The current frontend includes a **persistent local authentication demo**:

- Create an account with name, email and password.
- Passwords are hashed with the browser Web Crypto API before being stored locally.
- The signed-in session is stored in `localStorage`, so refreshing/reopening the site keeps the user signed in.
- Clicking the user chip logs out.

### Important for production

This is intentionally a frontend-only authentication layer for development. `localStorage` is not an appropriate production authentication boundary. For production, move account storage and authentication to a backend (or a managed auth provider), use secure HTTP-only session/refresh cookies, server-side password hashing (Argon2id/bcrypt), CSRF protection where applicable, rate limiting, email verification and password reset flows.

## Run

```bash
npm install
npm run dev
```
