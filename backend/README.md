# Nivora API

NestJS REST API using MongoDB/Mongoose and bearer JWT authentication. Routes match the original endpoint notes and include starter endpoints for additional community modules.

## Run locally

1. Install Node.js 20+ and have a MongoDB instance available (local or hosted).
2. From the repository root run `npm run api:install`.
3. Copy `backend/.env.example` to `backend/.env`; set `MONGODB_URI` and a unique, long `JWT_SECRET`. Put rotated provider credentials only in this local, git-ignored `.env` file. Never commit or paste secrets into source files.
4. Run `npm run api:dev` from the repository root. The API listens on `http://localhost:3000`.

The dashboard preview is served separately with `npm run preview` at `http://127.0.0.1:8765`.

Check `http://localhost:3000/health` after startup. It reports both the API and MongoDB connection state (`database: "connected"` means Mongoose is connected).

## Routes

All routes other than `/auth/*` and `/health` require `Authorization: Bearer <accessToken>`.

| Area | Routes |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` |
| Profile | `GET /users/me`, `PUT /users/me` |
| Visitors | `POST /visitors/pre-approve`, `GET /visitors`, `GET /visitors/:id`, `DELETE /visitors/:id` |
| Payments | `GET /payments`, `GET /payments/invoice/:id`, admin `POST /payments/invoices`, `POST /payments/pay`, `POST /payments/verify` |
| Security | `POST /security/alert`, `GET /security/alerts`, `GET /security/alerts/:id`, `GET/POST /security/exit-permissions` |
| Help desk | `POST /helpdesk/complaints`, `GET /helpdesk/complaints`, `GET/PUT /helpdesk/complaints/:id` |
| Directory | `GET /directory/residents?q=`, `GET /directory/vehicles?q=`, `GET /directory/emergency` |
| Home planner | `POST/GET /home-planner/reminders`, `DELETE /home-planner/reminders/:id` |
| Parking | `POST /parking/rent`, `GET /parking/available`, `POST /parking/book/:id` |
| Notices and surveys | `POST/GET /notice-board`, `POST/GET /elections/surveys`, `POST /elections/vote/:id` |
| Buy & sell | `POST/GET /marketplace/items`, `POST /marketplace/buy/:id` |
| Homes | `POST /homes/list`, `GET /homes`, `GET /homes/:id` |
| Community | `POST/GET /community/posts`, `POST/GET /communications/messages`, `GET /notifications`, `GET /complex/overview` |
| Other | `POST/GET /documents` (metadata only), `/support/feedback`, `/services/bookings`, admin `POST /services/catalog`, `GET /services/catalog`, `/locks/listings` and `GET /locks/available` |

## Current integration boundaries

- Community records use a shared, typed-by-`kind` Mongoose collection for feature modules. User profiles have their own schema.
- Passwords are bcrypt-hashed and JWT secrets must be provided via environment. The stateless logout endpoint tells clients to discard the token.
- The preview holds the bearer token in session storage. For a public deployment, switch to secure, HTTP-only cookies and a CSRF strategy.
- Password reset intentionally returns a non-enumerating accepted response; actual email delivery and token issuance require a configured email provider.
- Razorpay checkout is restricted to test mode (`RAZORPAY_MODE=test`) and needs a rotated test key ID and secret in local `backend/.env`. The API creates orders server-side and verifies the checkout signature and captured payment server-side; the key secret never goes to the browser. Create an invoice for a resident using admin `POST /payments/invoices` before checkout is available. No live-mode payments are enabled.
- Document routes store metadata only. Connect S3 and signed upload/download URLs before accepting files.
- Security alerts are persisted but no push/SNS/WebSocket notifications are sent yet. Connect a delivery provider before treating them as live emergency alerts.
- The preview requires an API session for resident data and clears legacy browser-only demo entries. Empty MongoDB collections are shown as empty states. Payment checkout requires a real invoice returned by the API.
- Community-curated service catalog records are stored in MongoDB; administrators publish them through `POST /services/catalog`. Bookings are stored separately under `/services/bookings`.
- Change society onboarding, roles, authorization policies, retention, and contact sharing rules for the intended deployment before using real resident data.
