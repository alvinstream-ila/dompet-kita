'use server';

import { serverApi } from '@/lib/server-api';
import type { User } from '../context/AuthContext';

/**
 * Fetch the current user profile (Server-side)
 */
export async function getUserProfileAction(): Promise<User | null> {
  return await serverApi('/user');
}
