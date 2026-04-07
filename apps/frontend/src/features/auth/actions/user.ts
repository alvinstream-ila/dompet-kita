'use server';

import { serverApi } from '@/lib/server-api';
import type { User } from '../context/AuthContext';

/**
 * Fetch the current user profile (Server-side)
 */
export async function getUserProfileAction(): Promise<User | null> {
  try {
    return await serverApi('/user');
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
