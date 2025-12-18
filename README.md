This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Project Features

- New Shipment: manual Tracking ID input under Weight field.
- Forgot Password: request reset link via Supabase and custom reset page.
- Toast Notifications: unified success/error toasts using `sonner`.
- Admin Users: accurate last sign-in time shown in local timezone.

### Forgot Password Flow
- Visit `/forgot-password` to request a reset link.
- Email template at [public/email/forgot-password.html](public/email/forgot-password.html). Upload this in Supabase: Project Settings → Auth → Email Templates → Reset Password.
- The link redirects to `/reset-password` where users set a new password.

### Toasts
- Global toaster is mounted in [app/layout.tsx](app/layout.tsx). Use `import { toast } from 'sonner'` and call `toast.success(...)` or `toast.error(...)`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
