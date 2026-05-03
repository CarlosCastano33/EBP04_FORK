import { apiRequest, setAuthToken } from './client';
import {
  BackendAuthResponse,
  fromBackendAuthUser,
  toBackendLoginRequest,
  toBackendRegisterRequest,
} from './adapters';

interface ApiResponse {
  message: string;
  timestamp: string;
}

export async function loginRequest(email: string, password: string) {
  const response = await apiRequest<BackendAuthResponse>('/api/auth/login', {
    method: 'POST',
    body: toBackendLoginRequest(email, password),
    auth: false,
  });

  setAuthToken(response.token);
  return fromBackendAuthUser(response);
}

export async function registerRequest(name: string, email: string, password: string) {
  await apiRequest<ApiResponse>('/api/auth/register', {
    method: 'POST',
    body: toBackendRegisterRequest(name, email, password),
    auth: false,
  });

  return loginRequest(email, password);
}
