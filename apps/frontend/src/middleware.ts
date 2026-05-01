/**
 * Dompet Kita - Next.js Middleware Entry Point
 *
 * Next.js requires middleware to live at `src/middleware.ts`.
 * All logic lives in `proxy.ts` to keep this file clean.
 * See: https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export { default, config } from './proxy';
