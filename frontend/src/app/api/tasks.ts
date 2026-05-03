import { Task, TaskPriority } from '../types';
import { apiRequest } from './client';
import {
  BackendHouseholdTaskResponse,
  fromBackendHouseholdTask,
  timestampToLocalDate,
  toBackendAssignTaskRequest,
  toBackendCreateTaskRequest,
  toBackendTaskPriority,
  toBackendUpdateTaskRequest,
} from './adapters';

interface ApiResponse {
  message: string;
  timestamp: string;
}

export async function getHouseholdTasksRequest(householdId: string) {
  const response = await apiRequest<BackendHouseholdTaskResponse[]>(
    `/api/households/${householdId}/tasks`,
  );

  return response.map(fromBackendHouseholdTask);
}

export async function createHouseholdTaskRequest(
  householdId: string,
  name: string,
  description?: string,
  priority?: TaskPriority,
  dueDate?: number,
  assignedUserId?: string,
) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks`,
    {
      method: 'POST',
      body: toBackendCreateTaskRequest(name, description, priority, dueDate, assignedUserId),
    },
  );

  return fromBackendHouseholdTask(response);
}

export async function createConfiguredHouseholdTaskRequest(
  householdId: string,
  name: string,
  priority?: TaskPriority,
  dueDate?: number,
  description?: string,
  assignedUserId?: string,
) {
  return createHouseholdTaskRequest(
    householdId,
    name,
    description,
    priority,
    dueDate,
    assignedUserId,
  );
}

export async function deleteHouseholdTaskRequest(householdId: string, taskId: string) {
  return apiRequest<ApiResponse>(`/api/households/${householdId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function updateHouseholdTaskRequest(
  householdId: string,
  taskId: string,
  updates: Partial<Task>,
) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      body: toBackendUpdateTaskRequest(updates),
    },
  );

  return fromBackendHouseholdTask(response);
}

export async function updateHouseholdTaskPriorityDeadlineRequest(
  householdId: string,
  taskId: string,
  priority: TaskPriority,
  dueDate: number,
) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks/${taskId}/priority-deadline`,
    {
      method: 'PATCH',
      body: {
        prioridad: toBackendTaskPriority(priority),
        fechaLimite: timestampToLocalDate(dueDate),
      },
    },
  );

  return fromBackendHouseholdTask(response);
}

export async function assignHouseholdTaskRequest(
  householdId: string,
  taskId: string,
  userId: string,
) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks/${taskId}/assign`,
    {
      method: 'PATCH',
      body: toBackendAssignTaskRequest(userId),
    },
  );

  return fromBackendHouseholdTask(response);
}

export async function acceptHouseholdTaskRequest(householdId: string, taskId: string) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks/${taskId}/accept`,
    {
      method: 'PATCH',
    },
  );

  return fromBackendHouseholdTask(response);
}

export async function rejectHouseholdTaskRequest(
  householdId: string,
  taskId: string,
  reason: string,
) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks/${taskId}/reject`,
    {
      method: 'PATCH',
      body: { reason },
    },
  );

  return fromBackendHouseholdTask(response);
}

export async function unassignHouseholdTaskRequest(householdId: string, taskId: string) {
  const response = await apiRequest<BackendHouseholdTaskResponse>(
    `/api/households/${householdId}/tasks/${taskId}/unassign`,
    {
      method: 'PATCH',
    },
  );

  return fromBackendHouseholdTask(response);
}
