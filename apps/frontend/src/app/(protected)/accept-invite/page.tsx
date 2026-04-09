'use client';

import { Suspense } from 'react';
import { AcceptPartnerModal } from '@/features/family/components/AcceptPartnerModal';
import { PageLoader } from '@/components/ui/PageLoader';

/**
 * AcceptInvite Page
 * Catch-all for partner invitation links.
 * Shows the acceptance modal within the authenticated context.
 */
export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
      <Suspense fallback={<PageLoader isLoading={true} />}>
        <AcceptPartnerModal />

        <div className="max-w-sm space-y-4 px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="animate-bounce text-2xl">💌</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">
            Menyiapkan Undangan...
          </h1>
          <p className="text-sm text-slate-500">
            Tunggu sebentar ya Sayang, kami lagi memverifikasi link undangan
            partner kamu.
          </p>
        </div>
      </Suspense>
    </div>
  );
}
