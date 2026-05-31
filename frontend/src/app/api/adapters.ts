import { Home, Task, TaskNotification, TaskPriority, TaskStatus, User, UserRole } from '../types';

export type BackendHouseholdRole = 'ADMIN' | 'MIEMBRO' | 'INVITADO';
export type BackendTaskPriority = 'BAJA' | 'MEDIA' | 'ALTA';
export type BackendTaskStatus =
  | 'SIN_ASIGNAR'
  | 'ASIGNADA'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'EN_PROGRESO'
  | 'COMPLETADA'
  | 'VERIFICADA'
  | 'VERIFICACION_RECHAZADA';
export type BackendNotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_ACCEPTED'
  | 'TASK_COMPLETED'
  | 'TASK_VERIFIED'
  | 'TASK_VERIFICATION_REJECTED';

export interface BackendAuthResponse {
  token: string;
  type: string;
  userId: number;
  nombre: string;
  correo: string;
  timestamp: string;
}

export interface BackendUserResponse {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string | null;
  edad?: number | null;
  sexo?: string | null;
  timestamp: string;
}

export interface BackendHouseholdResponse {
  id: number;
  nombre: string;
  creadoPorId: number;
  timestamp: string;
}

export interface BackendHouseholdMemberResponse {
  userId: number;
  nombre: string;
  correo: string;
  role: BackendHouseholdRole;
  fechaIngreso: string;
}

export interface BackendHouseholdTaskResponse {
  id: number;
  nombre: string;
  descripcion?: string | null;
  prioridad?: BackendTaskPriority | null;
  fechaLimite?: string | null;
  estado?: BackendTaskStatus | null;
  fechaAceptacion?: string | null;
  motivoRechazo?: string | null;
  fechaInicio?: string | null;
  fechaFinalizacion?: string | null;
  verificadoPorId?: number | null;
  fechaVerificacion?: string | null;
  motivoRechazoVerificacion?: string | null;
  householdId: number;
  creadoPorId: number;
  asignadoAId?: number | null;
  timestamp: string;
}

export interface BackendTaskNotificationResponse {
  id: number;
  taskId: number;
  message: string;
  read: boolean;
  type: BackendNotificationType;
  timestamp: string;
}

export function toBackendRegisterRequest(name: string, email: string, password: string) {
  return {
    nombre: name,
    correo: email,
    password,
  };
}

export function toBackendLoginRequest(email: string, password: string) {
  return {
    correo: email,
    password,
  };
}

export function toBackendCreateHouseholdRequest(name: string) {
  return {
    nombre: name,
  };
}

export function toBackendAddMemberRequest(email: string) {
  return {
    correo: email,
  };
}

export function toBackendCreateTaskRequest(
  name: string,
  description?: string,
  priority?: TaskPriority,
  dueDate?: number,
  assignedUserId?: string,
) {
  return {
    nombre: name,
    descripcion: description || undefined,
    prioridad: priority ? toBackendTaskPriority(priority) : undefined,
    fechaLimite: dueDate ? timestampToLocalDate(dueDate) : undefined,
    asignadoAId: assignedUserId ? Number(assignedUserId) : undefined,
  };
}

export function toBackendUpdateTaskRequest(updates: Partial<Task>) {
  return {
    nombre: updates.name,
    descripcion: updates.description,
    prioridad: updates.priority ? toBackendTaskPriority(updates.priority) : undefined,
    fechaLimite: updates.dueDate ? timestampToLocalDate(updates.dueDate) : undefined,
  };
}

export function toBackendAssignTaskRequest(userId: string) {
  return {
    userId: Number(userId),
  };
}

export function toBackendUpdateUserProfileRequest(updates: Partial<User>) {
  return {
    nombre: updates.name,
    telefono: updates.phone,
    edad: updates.age,
    sexo: updates.sex,
  };
}

export function fromBackendAuthUser(response: BackendAuthResponse): User {
  return {
    id: String(response.userId),
    name: response.nombre,
    email: response.correo,
    password: '',
  };
}

export function fromBackendUser(response: BackendUserResponse): User {
  return {
    id: String(response.id),
    name: response.nombre,
    email: response.correo,
    password: '',
    phone: response.telefono || undefined,
    age: response.edad || undefined,
    sex: response.sexo || undefined,
  };
}

export function fromBackendHousehold(response: BackendHouseholdResponse): Home {
  return {
    id: String(response.id),
    name: response.nombre,
    adminId: String(response.creadoPorId),
    memberIds: [],
  };
}

export function fromBackendHouseholdMember(
  response: BackendHouseholdMemberResponse,
  homeId?: string,
): User {
  const role = fromBackendHouseholdRole(response.role);

  return {
    id: String(response.userId),
    name: response.nombre,
    email: response.correo,
    password: '',
    homeId,
    role,
    isAdmin: role === 'Administrador',
  };
}

export function fromBackendHouseholdTask(response: BackendHouseholdTaskResponse): Task {
  return {
    id: String(response.id),
    name: response.nombre,
    description: response.descripcion || undefined,
    homeId: String(response.householdId),
    createdBy: String(response.creadoPorId),
    createdAt: dateTimeToTimestamp(response.timestamp),
    priority: response.prioridad ? fromBackendTaskPriority(response.prioridad) : undefined,
    dueDate: response.fechaLimite ? localDateToTimestamp(response.fechaLimite) : undefined,
    assignedTo: response.asignadoAId ? String(response.asignadoAId) : undefined,
    status: response.estado ? fromBackendTaskStatus(response.estado) : undefined,
    rejectionReason: response.motivoRechazo || undefined,
    startedAt: response.fechaInicio ? dateTimeToTimestamp(response.fechaInicio) : undefined,
    completedAt: response.fechaFinalizacion
      ? dateTimeToTimestamp(response.fechaFinalizacion)
      : undefined,
    verifiedBy: response.verificadoPorId ? String(response.verificadoPorId) : undefined,
    verifiedAt: response.fechaVerificacion
      ? dateTimeToTimestamp(response.fechaVerificacion)
      : undefined,
    verificationRejectionReason: response.motivoRechazoVerificacion || undefined,
  };
}

export function fromBackendTaskNotification(
  response: BackendTaskNotificationResponse,
): TaskNotification {
  return {
    id: String(response.id),
    taskId: String(response.taskId),
    message: response.message,
    read: response.read,
    type: response.type,
    createdAt: dateTimeToTimestamp(response.timestamp),
  };
}

export function fromBackendHouseholdRole(role: BackendHouseholdRole): UserRole {
  const roles: Record<BackendHouseholdRole, UserRole> = {
    ADMIN: 'Administrador',
    MIEMBRO: 'Miembro',
    INVITADO: 'Invitado',
  };

  return roles[role];
}

export function toBackendHouseholdRole(role: UserRole): BackendHouseholdRole {
  if (role === 'Administrador') return 'ADMIN';
  if (role === 'Invitado') return 'INVITADO';
  return 'MIEMBRO';
}

export function fromBackendTaskPriority(priority: BackendTaskPriority): TaskPriority {
  const priorities: Record<BackendTaskPriority, TaskPriority> = {
    ALTA: 'Alta',
    MEDIA: 'Media',
    BAJA: 'Baja',
  };

  return priorities[priority];
}

export function toBackendTaskPriority(priority: TaskPriority): BackendTaskPriority {
  const priorities: Record<TaskPriority, BackendTaskPriority> = {
    Alta: 'ALTA',
    Media: 'MEDIA',
    Baja: 'BAJA',
  };

  return priorities[priority];
}

export function fromBackendTaskStatus(status: BackendTaskStatus): TaskStatus {
  const statuses: Record<BackendTaskStatus, TaskStatus> = {
    SIN_ASIGNAR: 'unassigned',
    ASIGNADA: 'pending',
    ACEPTADA: 'accepted',
    RECHAZADA: 'rejected',
    EN_PROGRESO: 'in_progress',
    COMPLETADA: 'completed',
    VERIFICADA: 'verified',
    VERIFICACION_RECHAZADA: 'verification_rejected',
  };

  return statuses[status];
}

export function toBackendTaskStatus(status: TaskStatus): BackendTaskStatus | undefined {
  const statuses: Partial<Record<TaskStatus, BackendTaskStatus>> = {
    unassigned: 'SIN_ASIGNAR',
    pending: 'ASIGNADA',
    accepted: 'ACEPTADA',
    rejected: 'RECHAZADA',
    in_progress: 'EN_PROGRESO',
    completed: 'COMPLETADA',
    verified: 'VERIFICADA',
    verification_rejected: 'VERIFICACION_RECHAZADA',
  };

  return statuses[status];
}

export function localDateToTimestamp(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime();
}

export function timestampToLocalDate(value: number): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateTimeToTimestamp(value: string): number {
  return new Date(value).getTime();
}
