export type UserRole = 'Administrador' | 'Miembro' | 'Invitado';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  sex?: string;
  homeId?: string;
  isAdmin?: boolean;
  role?: UserRole;
}

export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'unassigned' | 'pending' | 'accepted' | 'rejected';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_ACCEPTED';

export interface Task {
  id: string;
  name: string;
  description?: string;
  homeId: string;
  createdBy: string;
  createdAt: number;
  priority?: TaskPriority;
  dueDate?: number;
  assignedTo?: string;
  status?: TaskStatus;
  rejectionReason?: string;
}

export interface Home {
  id: string;
  name: string;
  adminId: string;
  memberIds: string[];
}

export interface TaskNotification {
  id: string;
  taskId: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: number;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoadingSession: boolean;
  homes: Home[];
  selectedHouseholdId?: string;
  notifications: TaskNotification[];
  unreadNotificationsCount: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  createHome: (name: string) => Promise<void>;
  selectHousehold: (householdId: string) => Promise<void>;
  addMemberToHome: (email: string) => Promise<void>;
  removeMemberFromHome: (userId: string) => Promise<void>;
  getHomeMembers: () => User[];
  getHomeName: () => string;
  assignRole: (userId: string, role: UserRole) => Promise<void>;
  createTask: (name: string, priority: TaskPriority, dueDate: number, description?: string, assignToSelf?: boolean) => Promise<void>;
  getHomeTasks: () => Task[];
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  acceptTask: (taskId: string) => Promise<void>;
  rejectTask: (taskId: string, reason: string) => Promise<void>;
  reassignTask: (taskId: string, newUserId: string | null) => Promise<void>;
  refreshHouseholdData: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}
