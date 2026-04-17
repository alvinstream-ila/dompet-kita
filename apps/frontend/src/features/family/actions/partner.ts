'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';

/**
 * Invite a partner by email
 */
export async function invitePartnerAction(email: string) {
  try {
    const data = await serverApi('/partner/invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    revalidatePath('/family-hub');
    return { success: true, message: data.message };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal mengirim undangan 🥺';
    return { success: false, error: message };
  }
}

/**
 * Get invitation details by token
 */
export async function getInvitationAction(token: string) {
  try {
    const data = await serverApi(`/partner/invitation/${token}`);
    return {
      success: true,
      inviter_name: data.inviter_name,
      email: data.email,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Undangan tidak ditemukan 🥺';
    return { success: false, error: message };
  }
}

/**
 * Accept a partner invitation
 */
export async function acceptInvitationAction(token: string) {
  try {
    const data = await serverApi('/partner/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    revalidatePath('/');
    revalidatePath('/family-hub');
    return { success: true, message: data.message };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal menerima undangan 🥺';
    return { success: false, error: message };
  }
}

/**
 * Unlink partner
 */
export async function unlinkPartnerAction() {
  try {
    const data = await serverApi('/partner/unlink', {
      method: 'POST',
    });

    revalidatePath('/');
    revalidatePath('/family-hub');
    return { success: true, message: data.message };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal melepas partner 🥺';
    return { success: false, error: message };
  }
}
