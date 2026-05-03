import { Home, UserRole } from '../types';
import { apiRequest } from './client';
import {
  BackendHouseholdMemberResponse,
  BackendHouseholdResponse,
  fromBackendHousehold,
  fromBackendHouseholdMember,
  toBackendAddMemberRequest,
  toBackendHouseholdRole,
  toBackendCreateHouseholdRequest,
} from './adapters';

interface ApiResponse {
  message: string;
  timestamp: string;
}

export async function getHouseholdsRequest() {
  const response = await apiRequest<BackendHouseholdResponse[]>('/api/households');
  return response.map(fromBackendHousehold);
}

export async function createHouseholdRequest(name: string) {
  const response = await apiRequest<BackendHouseholdResponse>('/api/households', {
    method: 'POST',
    body: toBackendCreateHouseholdRequest(name),
  });

  return fromBackendHousehold(response);
}

export async function addHouseholdMemberRequest(householdId: string, email: string) {
  return apiRequest<ApiResponse>(`/api/households/${householdId}/members`, {
    method: 'POST',
    body: toBackendAddMemberRequest(email),
  });
}

export async function getHouseholdMembersRequest(householdId: string) {
  const response = await apiRequest<BackendHouseholdMemberResponse[]>(
    `/api/households/${householdId}/members`,
  );

  return response.map((member) => fromBackendHouseholdMember(member, householdId));
}

export async function removeHouseholdMemberRequest(householdId: string, userId: string) {
  return apiRequest<ApiResponse>(`/api/households/${householdId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function updateHouseholdMemberRoleRequest(
  householdId: string,
  userId: string,
  role: UserRole,
) {
  const response = await apiRequest<BackendHouseholdMemberResponse>(
    `/api/households/${householdId}/members/${userId}/role`,
    {
      method: 'PATCH',
      body: {
        role: toBackendHouseholdRole(role),
      },
    },
  );

  return fromBackendHouseholdMember(response, householdId);
}

export function getSelectedHouseholdId(homes: Home[]) {
  return homes[0]?.id;
}
