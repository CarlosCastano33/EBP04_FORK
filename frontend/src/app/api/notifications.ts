import {
  BackendTaskNotificationResponse,
  fromBackendTaskNotification,
} from './adapters';
import { apiRequest } from './client';

export async function getNotificationsRequest() {
  const response = await apiRequest<BackendTaskNotificationResponse[]>('/api/notifications');
  return response.map(fromBackendTaskNotification);
}

export async function markNotificationAsReadRequest(notificationId: string) {
  const response = await apiRequest<BackendTaskNotificationResponse>(
    `/api/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
    },
  );

  return fromBackendTaskNotification(response);
}

export async function markAllNotificationsAsReadRequest() {
  return apiRequest<void>('/api/notifications/read-all', {
    method: 'PATCH',
  });
}
