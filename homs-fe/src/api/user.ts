import type { UserProfile } from '@/domain/user';
import apiClient from '.';

export async function fetchUserProfile(userId: number): Promise<UserProfile> {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data.data;
  }
