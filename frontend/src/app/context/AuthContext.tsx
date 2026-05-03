import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Home, Task, TaskNotification, AuthContextType } from '../types';
import { clearAuthToken, getAuthToken } from '../api/client';
import { loginRequest, registerRequest } from '../api/auth';
import { getMeRequest, updateMeRequest } from '../api/users';
import {
  addHouseholdMemberRequest,
  createHouseholdRequest,
  getHouseholdMembersRequest,
  getHouseholdsRequest,
  removeHouseholdMemberRequest,
  updateHouseholdMemberRoleRequest,
} from '../api/households';
import {
  acceptHouseholdTaskRequest,
  assignHouseholdTaskRequest,
  createConfiguredHouseholdTaskRequest,
  deleteHouseholdTaskRequest,
  getHouseholdTasksRequest,
  rejectHouseholdTaskRequest,
  unassignHouseholdTaskRequest,
  updateHouseholdTaskPriorityDeadlineRequest,
  updateHouseholdTaskRequest,
} from '../api/tasks';
import {
  getNotificationsRequest,
  markAllNotificationsAsReadRequest,
  markNotificationAsReadRequest,
} from '../api/notifications';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SELECTED_HOUSEHOLD_KEY = 'selectedHouseholdId';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | undefined>(() => {
    return localStorage.getItem(SELECTED_HOUSEHOLD_KEY) || undefined;
  });
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length;

  const clearSession = useCallback(() => {
    setCurrentUser(null);
    setHomes([]);
    setMembers([]);
    setTasks([]);
    setNotifications([]);
    setSelectedHouseholdId(undefined);
    clearAuthToken();
    localStorage.removeItem('currentUser');
    localStorage.removeItem(SELECTED_HOUSEHOLD_KEY);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const userNotifications = await getNotificationsRequest();
    setNotifications(userNotifications);
  }, []);

  const markNotificationAsRead = async (notificationId: string) => {
    const updatedNotification = await markNotificationAsReadRequest(notificationId);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? updatedNotification : notification,
      ),
    );
  };

  const markAllNotificationsAsRead = async () => {
    await markAllNotificationsAsReadRequest();
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const loadHouseholdData = async (user: User, preferredHouseholdId?: string) => {
    const userHomes = await getHouseholdsRequest();
    setHomes(userHomes);

    const storedHouseholdId =
      preferredHouseholdId || localStorage.getItem(SELECTED_HOUSEHOLD_KEY) || undefined;
    const activeHome =
      userHomes.find((home) => home.id === storedHouseholdId) || userHomes[0];

    if (!activeHome) {
      setMembers([]);
      setTasks([]);
      setSelectedHouseholdId(undefined);
      localStorage.removeItem(SELECTED_HOUSEHOLD_KEY);
      return { ...user, homeId: undefined, isAdmin: undefined, role: undefined };
    }

    setSelectedHouseholdId(activeHome.id);
    localStorage.setItem(SELECTED_HOUSEHOLD_KEY, activeHome.id);

    const [homeMembers, homeTasks] = await Promise.all([
      getHouseholdMembersRequest(activeHome.id),
      getHouseholdTasksRequest(activeHome.id),
    ]);
    const memberProfile = homeMembers.find((member) => member.id === user.id);

    setMembers(homeMembers);
    setTasks(homeTasks);

    return {
      ...user,
      homeId: activeHome.id,
      role: memberProfile?.role,
      isAdmin: memberProfile?.isAdmin,
    };
  };

  const refreshHouseholdData = async () => {
    const activeHouseholdId = selectedHouseholdId || currentUser?.homeId;
    if (!currentUser || !activeHouseholdId) return;

    const [homeMembers, homeTasks] = await Promise.all([
      getHouseholdMembersRequest(activeHouseholdId),
      getHouseholdTasksRequest(activeHouseholdId),
    ]);

    setMembers(homeMembers);
    setTasks(homeTasks);

    const memberProfile = homeMembers.find((member) => member.id === currentUser.id);
    if (memberProfile) {
      const updatedUser = {
        ...currentUser,
        homeId: activeHouseholdId,
        role: memberProfile.role,
        isAdmin: memberProfile.isAdmin,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const token = getAuthToken();
      const savedUser = localStorage.getItem('currentUser');

      if (!token) {
        clearSession();
        setIsLoadingSession(false);
        return;
      }

      try {
        const profileUser = await getMeRequest();
        const baseUser = savedUser ? { ...JSON.parse(savedUser), ...profileUser } : profileUser;
        const hydratedUser = await loadHouseholdData(baseUser);
        await refreshNotifications();

        setCurrentUser(hydratedUser);
        localStorage.setItem('currentUser', JSON.stringify(hydratedUser));
      } catch {
        clearSession();
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [clearSession, refreshNotifications]);

  const login = async (email: string, password: string) => {
    const authUser = await loginRequest(email, password);
    const profileUser = await getMeRequest();
    const hydratedUser = await loadHouseholdData({ ...authUser, ...profileUser });
    await refreshNotifications();

    setCurrentUser(hydratedUser);
    localStorage.setItem('currentUser', JSON.stringify(hydratedUser));
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const register = async (name: string, email: string, password: string) => {
    const authUser = await registerRequest(name, email, password);
    const profileUser = await getMeRequest();
    const hydratedUser = await loadHouseholdData({ ...authUser, ...profileUser });
    await refreshNotifications();

    setCurrentUser(hydratedUser);
    localStorage.setItem('currentUser', JSON.stringify(hydratedUser));
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;

    const optimisticUser = { ...currentUser, ...data };
    setCurrentUser(optimisticUser);
    localStorage.setItem('currentUser', JSON.stringify(optimisticUser));

    const hasBackendProfileUpdates =
      data.name !== undefined ||
      data.phone !== undefined ||
      data.age !== undefined ||
      data.sex !== undefined;

    if (!hasBackendProfileUpdates) {
      return;
    }

    const profileUser = await updateMeRequest(data);
    const updatedUser = { ...optimisticUser, ...profileUser };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const createHome = async (name: string) => {
    if (!currentUser) return;

    const newHome = await createHouseholdRequest(name);
    const updatedHomes = [...homes, newHome];
    const updatedUser = {
      ...currentUser,
      homeId: newHome.id,
      isAdmin: true,
      role: 'Administrador' as const,
    };

    setHomes(updatedHomes);
    setSelectedHouseholdId(newHome.id);
    setCurrentUser(updatedUser);
    localStorage.setItem(SELECTED_HOUSEHOLD_KEY, newHome.id);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    const [homeMembers, homeTasks] = await Promise.all([
      getHouseholdMembersRequest(newHome.id),
      getHouseholdTasksRequest(newHome.id),
    ]);

    setMembers(homeMembers);
    setTasks(homeTasks);
  };

  const selectHousehold = async (householdId: string) => {
    if (!currentUser) return;

    const selectedHome = homes.find((home) => home.id === householdId);
    if (!selectedHome) {
      throw new Error('No tienes acceso a este hogar');
    }

    const [homeMembers, homeTasks] = await Promise.all([
      getHouseholdMembersRequest(selectedHome.id),
      getHouseholdTasksRequest(selectedHome.id),
    ]);
    const memberProfile = homeMembers.find((member) => member.id === currentUser.id);

    const updatedUser = {
      ...currentUser,
      homeId: selectedHome.id,
      role: memberProfile?.role,
      isAdmin: memberProfile?.isAdmin,
    };

    setSelectedHouseholdId(selectedHome.id);
    setMembers(homeMembers);
    setTasks(homeTasks);
    setCurrentUser(updatedUser);
    localStorage.setItem(SELECTED_HOUSEHOLD_KEY, selectedHome.id);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    await refreshNotifications();
  };

  const addMemberToHome = async (email: string) => {
    if (!currentUser?.homeId || !currentUser.isAdmin) {
      throw new Error('No tienes permisos para agregar miembros');
    }

    await addHouseholdMemberRequest(currentUser.homeId, email);
    const homeMembers = await getHouseholdMembersRequest(currentUser.homeId);
    setMembers(homeMembers);
  };

  const removeMemberFromHome = async (userId: string) => {
    if (!currentUser?.homeId || !currentUser.isAdmin) return;

    await removeHouseholdMemberRequest(currentUser.homeId, userId);
    const homeMembers = await getHouseholdMembersRequest(currentUser.homeId);
    setMembers(homeMembers);
  };

  const getHomeMembers = (): User[] => members;

  const getHomeName = (): string => {
    if (!currentUser?.homeId) return '';
    return homes.find((home) => home.id === currentUser.homeId)?.name || '';
  };

  const assignRole = async (userId: string, role: User['role']) => {
    if (!currentUser?.homeId || !currentUser.isAdmin || !role) return;

    const updatedMember = await updateHouseholdMemberRoleRequest(currentUser.homeId, userId, role);

    setMembers((currentMembers) =>
      currentMembers.map((member) => (member.id === userId ? updatedMember : member)),
    );

    if (userId === currentUser.id) {
      const updatedUser = {
        ...currentUser,
        role: updatedMember.role,
        isAdmin: updatedMember.isAdmin,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const createTask = async (
    name: string,
    priority: string,
    dueDate: number,
    description?: string,
    assignToSelf?: boolean,
  ) => {
    if (!currentUser?.homeId) return;

    const assignedUserId = assignToSelf ? currentUser.id : undefined;
    const task = await createConfiguredHouseholdTaskRequest(
      currentUser.homeId,
      name,
      priority as Task['priority'],
      dueDate,
      description,
      assignedUserId,
    );

    setTasks((currentTasks) => [...currentTasks, task]);
    await refreshNotifications();
  };

  const getHomeTasks = (): Task[] => tasks;

  const deleteTask = async (taskId: string) => {
    if (!currentUser?.homeId || !currentUser.isAdmin) return;

    await deleteHouseholdTaskRequest(currentUser.homeId, taskId);
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!currentUser?.homeId) return;

    const updatesOnlyPriorityDeadline =
      updates.priority !== undefined &&
      updates.dueDate !== undefined &&
      updates.name === undefined &&
      updates.description === undefined;

    const updatedTask = updatesOnlyPriorityDeadline
      ? await updateHouseholdTaskPriorityDeadlineRequest(
          currentUser.homeId,
          taskId,
          updates.priority,
          updates.dueDate,
        )
      : await updateHouseholdTaskRequest(currentUser.homeId, taskId, updates);

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
  };

  const assignTask = async (taskId: string, userId: string) => {
    if (!currentUser?.homeId || !currentUser.isAdmin) return;

    const updatedTask = await assignHouseholdTaskRequest(currentUser.homeId, taskId, userId);
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
    await refreshNotifications();
  };

  const acceptTask = async (taskId: string) => {
    if (!currentUser?.homeId) return;

    const updatedTask = await acceptHouseholdTaskRequest(currentUser.homeId, taskId);
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
    await refreshNotifications();
  };

  const rejectTask = async (taskId: string, reason: string) => {
    if (!currentUser?.homeId) return;

    const updatedTask = await rejectHouseholdTaskRequest(currentUser.homeId, taskId, reason);
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
    await refreshNotifications();
  };

  const reassignTask = async (taskId: string, newUserId: string | null) => {
    if (!newUserId) {
      if (!currentUser?.homeId || !currentUser.isAdmin) return;

      const updatedTask = await unassignHouseholdTaskRequest(currentUser.homeId, taskId);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
      await refreshNotifications();
      return;
    }

    await assignTask(taskId, newUserId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoadingSession,
        homes,
        selectedHouseholdId,
        notifications,
        unreadNotificationsCount,
        login,
        logout,
        register,
        updateProfile,
        createHome,
        selectHousehold,
        addMemberToHome,
        removeMemberFromHome,
        getHomeMembers,
        getHomeName,
        assignRole,
        createTask,
        getHomeTasks,
        deleteTask,
        updateTask,
        assignTask,
        acceptTask,
        rejectTask,
        reassignTask,
        refreshHouseholdData,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
