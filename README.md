<<<<<<< HEAD
# Nivora community platform

Nivora is a resident-facing community dashboard with a responsive interface and a NestJS/MongoDB API starter.

## Start the preview

From this folder, run:

```powershell
npm run preview
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765). Sign in or create an account against the API to load community records. The interface no longer displays fixture residents, counts, invoices or announcements; empty database collections show empty states.

## Start the API

Read [backend/README.md](backend/README.md). The API uses NestJS, MongoDB/Mongoose and bcrypt/JWT authentication. After starting it, choose the API origin in the sign-in dialog and sign in or register to use connected routes.

## Feature areas

Dashboard, visitor approvals and passes, payments, security and child exit permissions, help desk, Ask Society, notice board, resident and vehicle directory, home planner, parking rental, lockers, elections and surveys, communications, documents, My Complex, notifications, resident search, household settings, support, account management, trending services, Urban Company services, additional services, marketplace, and homes for sale/rent.

## Integration status

The frontend reads and writes community records through the NestJS API and MongoDB. Razorpay checkout supports test mode when rotated credentials are configured. Documents currently store metadata only; security alerts are saved to MongoDB but do not yet send push or live gate notifications. Configure file storage, password-reset mail and a notification provider before using those external functions with residents.
=======
# Nivora
>>>>>>> d763521e639ea1bc9430ed652f9802aa6a557389
