import { User } from '../types';
import { apiRequest } from './client';
import {
  BackendUserResponse,
  fromBackendUser,
  toBackendUpdateUserProfileRequest,
} from './adapters';

export async function getMeRequest() {
  const response = await apiRequest<BackendUserResponse>('/api/users/me');
  return fromBackendUser(response);
}

export async function updateMeRequest(updates: Partial<User>) {
  const response = await apiRequest<BackendUserResponse>('/api/users/me', {
    method: 'PATCH',
    body: toBackendUpdateUserProfileRequest(updates),
  });

  return fromBackendUser(response);
}
