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

## Email OTP on Vercel

The OTP feature is stateless: the send-otp route packs the OTP hash + expiry into a signed token (`OTP_SECRET`) that the client sends back on verify-otp, instead of storing anything server-side. This avoids the classic serverless bug where an in-memory `Map` populated by one function instance isn't visible to the instance that later verifies the code — no database or Redis is required.

Add the variables in [`.env.example`](.env.example) to Vercel Project Settings → Environment Variables for Production, Preview, and Development, then redeploy (env var changes only apply to new deployments).

The SMTP variables must point to a real email provider. The app returns an error when email delivery is unavailable instead of showing a false success message.

Trade-off: because no OTP state is stored server-side, a code can't be marked "used" after a successful verification — it stays valid until the 5-minute expiry even if reused, provided someone has both the emailed code and the token issued to the original browser session.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
